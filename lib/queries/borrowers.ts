import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface Borrower {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  ssn_last_four: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string;
  credit_score: number | null;
  annual_income: number | null;
  employment_status: string | null;
  employer_name: string | null;
  debt_to_income_ratio: number | null;
  overall_risk_score: number;
  payment_reliability_score: number;
  default_history_count: number;
  notes: string | null;
  tags: string[] | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Loan {
  id: string;
  user_id: string;
  borrower_id: string;
  loan_amount: number;
  interest_rate: number;
  start_date: string;
  due_date: string;
  status: 'active' | 'overdue' | 'paid' | 'defaulted';
  payment_history: unknown;
  total_paid: number;
  remaining_balance: number;
  risk_score: number;
  last_payment_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BorrowerWithLoans extends Borrower {
  loans: Loan[];
  total_borrowed: number;
  total_outstanding: number;
  total_paid: number;
  active_loans_count: number;
  paid_loans_count: number;
}

/**
 * Fetch a borrower with all their loans and calculated aggregates
 */
export async function getBorrowerWithLoans(
  borrowerId: string,
  userId: string
): Promise<BorrowerWithLoans | null> {
  const supabase = await createServerSupabaseClient();

  // Fetch borrower
  const { data: borrower, error: borrowerError } = await supabase
    .from('borrowers')
    .select('*')
    .eq('id', borrowerId)
    .eq('user_id', userId)
    .single();

  if (borrowerError || !borrower) {
    console.error('Error fetching borrower:', borrowerError);
    return null;
  }

  // Fetch loans for this borrower
  const { data: loans, error: loansError } = await supabase
    .from('loans')
    .select('*')
    .eq('borrower_id', borrowerId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (loansError) {
    console.error('Error fetching loans:', loansError);
    return null;
  }

  // Calculate aggregates
  const total_borrowed = loans?.reduce((sum, l) => sum + Number(l.loan_amount), 0) || 0;
  const total_outstanding =
    loans?.reduce((sum, l) => sum + Number(l.remaining_balance || 0), 0) || 0;
  const total_paid = loans?.reduce((sum, l) => sum + Number(l.total_paid || 0), 0) || 0;
  const active_loans_count =
    loans?.filter((l) => l.status === 'active' || l.status === 'overdue').length || 0;
  const paid_loans_count = loans?.filter((l) => l.status === 'paid').length || 0;

  return {
    ...borrower,
    loans: loans || [],
    total_borrowed,
    total_outstanding,
    total_paid,
    active_loans_count,
    paid_loans_count,
  };
}

/**
 * Fetch all borrowers for a user
 */
export async function getAllBorrowers(userId: string): Promise<Borrower[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('borrowers')
    .select('*')
    .eq('user_id', userId)
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching borrowers:', error);
    return [];
  }

  return data || [];
}
