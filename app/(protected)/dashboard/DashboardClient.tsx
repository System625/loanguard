'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { TrendingUp, AlertCircle, DollarSign, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useSupabaseClient } from '@/components/SupabaseProvider';
import DashboardCharts from '@/components/DashboardCharts';
import NewLoanModal from '@/components/NewLoanModal';
import ConnectPlaid from '@/components/ConnectPlaid';

interface Loan {
  id: string;
  borrower_name: string;
  loan_amount: number;
  interest_rate: number;
  start_date: string;
  due_date: string;
  status: 'active' | 'overdue' | 'paid';
  payment_history: unknown;
  risk_score: number;
  created_at?: string;
}

interface DashboardClientProps {
  initialLoans: Loan[];
  session: Session | null;
}

// LoansTable component moved outside to avoid creating components during render
function LoansTable({
  loans,
  formatCurrency,
  formatDate,
  getStatusBadge,
  getRiskColor,
  onLoanClick
}: {
  loans: Loan[];
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  getStatusBadge: (status: string) => React.ReactElement;
  getRiskColor: (risk: number) => string;
  onLoanClick: (id: string) => void;
}) {
  if (loans.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-medium text-slate-900">No loans found</h3>
        <p className="mt-2 text-sm text-slate-600">
          Get started by creating your first loan.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Borrower</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Interest Rate</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Risk Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loans.map((loan) => (
            <TableRow
              key={loan.id}
              className="cursor-pointer hover:bg-slate-50"
              onClick={() => onLoanClick(loan.id)}
            >
              <TableCell className="font-medium">{loan.borrower_name}</TableCell>
              <TableCell>{formatCurrency(loan.loan_amount)}</TableCell>
              <TableCell>{loan.interest_rate}%</TableCell>
              <TableCell>{formatDate(loan.due_date)}</TableCell>
              <TableCell>{getStatusBadge(loan.status)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress
                    value={loan.risk_score}
                    className="w-20 h-2"
                    indicatorClassName={getRiskColor(loan.risk_score)}
                  />
                  <span className="text-sm text-slate-600 w-8">{loan.risk_score}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function DashboardClient({ initialLoans }: DashboardClientProps) {
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const router = useRouter();
  const supabase = useSupabaseClient();

  const handleLoanCreated = async () => {
    // Manually refresh loans after creation
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLoans(data);
    }
  };

  // Calculate statistics
  const totalLoans = loans.length;
  const totalAmount = loans.reduce((sum, loan) => sum + loan.loan_amount, 0);
  const overdueCount = loans.filter((loan) => loan.status === 'overdue').length;
  const averageRisk = loans.length > 0
    ? loans.reduce((sum, loan) => sum + loan.risk_score, 0) / loans.length
    : 0;

  const activeLoans = loans.filter((loan) => loan.status === 'active');
  const overdueLoans = loans.filter((loan) => loan.status === 'overdue');
  const paidLoans = loans.filter((loan) => loan.status === 'paid');

  // Realtime subscription - defer to avoid blocking initial render
  useEffect(() => {
    // Delay subscription setup by 500ms to prioritize initial render
    const timeoutId = setTimeout(() => {
      const channel = supabase
        .channel('loans-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'loans',
          },
          (payload) => {
            console.log('Realtime update:', payload);

            if (payload.eventType === 'INSERT') {
              setLoans((current) => [payload.new as Loan, ...current]);
              toast.success('New loan added');
            } else if (payload.eventType === 'UPDATE') {
              setLoans((current) =>
                current.map((loan) =>
                  loan.id === payload.new.id ? (payload.new as Loan) : loan
                )
              );
              toast.info('Loan updated');
            } else if (payload.eventType === 'DELETE') {
              setLoans((current) => current.filter((loan) => loan.id !== payload.old.id));
              toast.info('Loan deleted');
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [supabase]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500 hover:bg-red-600">Overdue</Badge>;
      case 'paid':
        return <Badge variant="secondary">Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'bg-red-500';
    if (risk >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-600 mt-2">Monitor and manage your loan portfolio</p>
        </div>
        <div className="flex gap-3">
          <ConnectPlaid />
          <NewLoanModal onLoanCreated={handleLoanCreated} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total Loans</CardTitle>
            <FileText className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalLoans}</div>
            <p className="text-xs text-slate-600 mt-1">Active portfolio items</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(totalAmount)}
            </div>
            <p className="text-xs text-slate-600 mt-1">Portfolio value</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Overdue Loans</CardTitle>
            <AlertCircle className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
            <p className="text-xs text-slate-600 mt-1">Require attention</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Average Risk</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {averageRisk.toFixed(1)}
            </div>
            <p className="text-xs text-slate-600 mt-1">Portfolio risk score</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <DashboardCharts loans={loans} />

      {/* Loans Table with Tabs */}
      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-slate-900">Loan Portfolio</CardTitle>
          <CardDescription className="text-slate-600">
            View and manage all your loans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">
                All Loans ({totalLoans})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({activeLoans.length})
              </TabsTrigger>
              <TabsTrigger value="overdue">
                Overdue ({overdueLoans.length})
              </TabsTrigger>
              <TabsTrigger value="paid">
                Paid ({paidLoans.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <LoansTable
                loans={loans}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                getStatusBadge={getStatusBadge}
                getRiskColor={getRiskColor}
                onLoanClick={(id) => router.push(`/loans/${id}`)}
              />
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              <LoansTable
                loans={activeLoans}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                getStatusBadge={getStatusBadge}
                getRiskColor={getRiskColor}
                onLoanClick={(id) => router.push(`/loans/${id}`)}
              />
            </TabsContent>

            <TabsContent value="overdue" className="space-y-4">
              <LoansTable
                loans={overdueLoans}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                getStatusBadge={getStatusBadge}
                getRiskColor={getRiskColor}
                onLoanClick={(id) => router.push(`/loans/${id}`)}
              />
            </TabsContent>

            <TabsContent value="paid" className="space-y-4">
              <LoansTable
                loans={paidLoans}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                getStatusBadge={getStatusBadge}
                getRiskColor={getRiskColor}
                onLoanClick={(id) => router.push(`/loans/${id}`)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
