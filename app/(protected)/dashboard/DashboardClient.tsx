'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { Plus, TrendingUp, AlertCircle, DollarSign, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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

interface Loan {
  id: string;
  borrower_name: string;
  loan_amount: number;
  interest_rate: number;
  start_date: string;
  due_date: string;
  status: 'active' | 'overdue' | 'paid';
  payment_history: any;
  risk_score: number;
  created_at?: string;
}

interface DashboardClientProps {
  initialLoans: Loan[];
  session: Session | null;
}

export default function DashboardClient({ initialLoans, session }: DashboardClientProps) {
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = useSupabaseClient();

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

  // Realtime subscription
  useEffect(() => {
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

  const LoansTable = ({ loans }: { loans: Loan[] }) => {
    if (loans.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">No loans found</h3>
          <p className="mt-2 text-sm text-slate-600">
            Get started by creating your first loan.
          </p>
          <div className="mt-4">
            <NewLoanModal />
          </div>
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
                onClick={() => router.push(`/loans/${loan.id}`)}
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
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-600 mt-2">Monitor and manage your loan portfolio</p>
        </div>
        <NewLoanModal />
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
              <LoansTable loans={loans} />
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              <LoansTable loans={activeLoans} />
            </TabsContent>

            <TabsContent value="overdue" className="space-y-4">
              <LoansTable loans={overdueLoans} />
            </TabsContent>

            <TabsContent value="paid" className="space-y-4">
              <LoansTable loans={paidLoans} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
