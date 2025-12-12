import { createServerSupabaseClient, getCurrentUser } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  // Use cached Supabase client and user (shared with layout via React cache)
  const supabase = await createServerSupabaseClient();
  const user = await getCurrentUser();

  if (!user) {
    return null; // Should never happen due to middleware + layout checks
  }

  // Fetch loans data
  const { data: loans, error } = await supabase
    .from('loans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching loans:', error);
  }

  return <DashboardClient initialLoans={loans || []} session={null} />;
}
