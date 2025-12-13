'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Session, SupabaseClient } from '@supabase/supabase-js';

type SupabaseContext = {
  supabase: SupabaseClient;
  session: Session | null;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children,
  session: initialSession,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            if (typeof document === 'undefined') return undefined;
            return document.cookie
              .split('; ')
              .find((row) => row.startsWith(`${name}=`))
              ?.split('=')[1];
          },
          set(name: string, value: string, options: { maxAge?: number }) {
            if (typeof document === 'undefined') return;
            document.cookie = `${name}=${value}; path=/; max-age=${options.maxAge}; SameSite=Lax; Secure`;
          },
          remove(name: string) {
            if (typeof document === 'undefined') return;
            document.cookie = `${name}=; path=/; max-age=0`;
          },
        },
      }
    )
  );
  const [session, setSession] = useState<Session | null>(initialSession);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);

      // Refresh the router to update server components
      router.refresh();
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <Context.Provider value={{ supabase, session }}>
      {children}
    </Context.Provider>
  );
}

// Custom hook to use Supabase client and session
export const useSupabase = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider');
  }

  return context;
};

// Convenience hook for just the session
export const useSession = () => {
  const { session } = useSupabase();
  return session;
};

// Convenience hook for just the client
export const useSupabaseClient = () => {
  const { supabase } = useSupabase();
  return supabase;
};
