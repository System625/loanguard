import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { notFound } from 'next/navigation';
import LoanDetailsClient from './LoanDetailsClient';

export default async function LoanDetailsPage({
  params,
}: {
  params: { id: string };
}) {
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

  // Fetch loan details
  const { data: loan, error: loanError } = await supabase
    .from('loans')
    .select('*')
    .eq('id', params.id)
    .single();

  if (loanError || !loan) {
    notFound();
  }

  // Fetch alerts for this loan
  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .eq('loan_id', params.id)
    .order('created_at', { ascending: false });

  // Fetch ESG metrics for this loan (optional - may not exist)
  const { data: esgMetrics } = await supabase
    .from('esg_metrics')
    .select('*')
    .eq('loan_id', params.id)
    .single();

  return (
    <LoanDetailsClient
      initialLoan={loan}
      initialAlerts={alerts || []}
      initialESGMetrics={esgMetrics}
    />
  );
}
