import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getCurrentUser } from '@/lib/supabase/server';
import ProtectedLayoutClient from './ProtectedLayoutClient';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // getCurrentUser internally calls createServerSupabaseClient (cached)
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Only fetch profile - user is already authenticated
  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <ProtectedLayoutClient user={user} profile={profile}>
      {children}
    </ProtectedLayoutClient>
  );
}
