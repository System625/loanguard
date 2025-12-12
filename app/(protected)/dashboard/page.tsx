import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  // Parallel fetch user and session
  const [
    { data: { user } },
    { data: { session } }
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession()
  ]);

  // Fetch initial loans data for the current user
  const { data: loans, error } = await supabase
    .from('loans')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching loans:', error);
  }

  return <DashboardClient initialLoans={loans || []} session={session} />;
}
