'use client';

import { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Calendar,
  FileText,
  Activity,
} from 'lucide-react';

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

interface BorrowerDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  borrowerName: string | null;
  allLoans: Loan[];
}

export default function BorrowerDetailModal({
  open,
  onOpenChange,
  borrowerName,
  allLoans,
}: BorrowerDetailModalProps) {
  const borrowerData = useMemo(() => {
    if (!borrowerName) return null;

    // Filter loans for this borrower
    const borrowerLoans = allLoans.filter(
      (loan) => loan.borrower_name === borrowerName
    );

    if (borrowerLoans.length === 0) return null;

    // Calculate aggregates
    const totalBorrowed = borrowerLoans.reduce(
      (sum, loan) => sum + loan.loan_amount,
      0
    );
    const activeLoans = borrowerLoans.filter((loan) => loan.status === 'active');
    const overdueLoans = borrowerLoans.filter((loan) => loan.status === 'overdue');
    const paidLoans = borrowerLoans.filter((loan) => loan.status === 'paid');

    const averageRiskScore =
      borrowerLoans.reduce((sum, loan) => sum + loan.risk_score, 0) /
      borrowerLoans.length;

    const averageInterestRate =
      borrowerLoans.reduce((sum, loan) => sum + loan.interest_rate, 0) /
      borrowerLoans.length;

    // Calculate total outstanding (active + overdue loans)
    const totalOutstanding = [...activeLoans, ...overdueLoans].reduce(
      (sum, loan) => sum + loan.loan_amount,
      0
    );

    const totalPaid = paidLoans.reduce(
      (sum, loan) => sum + loan.loan_amount,
      0
    );

    return {
      name: borrowerName,
      loans: borrowerLoans,
      totalLoans: borrowerLoans.length,
      totalBorrowed,
      totalOutstanding,
      totalPaid,
      activeLoansCount: activeLoans.length,
      overdueLoansCount: overdueLoans.length,
      paidLoansCount: paidLoans.length,
      averageRiskScore,
      averageInterestRate,
    };
  }, [borrowerName, allLoans]);

  if (!borrowerData) return null;

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

  const getRiskLabel = (risk: number) => {
    if (risk >= 70) return 'High Risk';
    if (risk >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            {borrowerData.name}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Complete borrower profile and loan portfolio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Risk Score Header */}
          <Card className="border-slate-200 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-2">Overall Risk Score</p>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-slate-900">
                      {borrowerData.averageRiskScore.toFixed(1)}
                    </div>
                    <Badge
                      className={`${
                        borrowerData.averageRiskScore >= 70
                          ? 'bg-red-500'
                          : borrowerData.averageRiskScore >= 40
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      } text-white`}
                    >
                      {getRiskLabel(borrowerData.averageRiskScore)}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Progress
                    value={borrowerData.averageRiskScore}
                    className="w-32 h-3"
                    indicatorClassName={getRiskColor(borrowerData.averageRiskScore)}
                  />
                  <p className="text-xs text-slate-500">
                    Avg. Interest Rate: {borrowerData.averageInterestRate.toFixed(2)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Summary Cards */}
          <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">
                  Total Loans
                </CardTitle>
                <FileText className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {borrowerData.totalLoans}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {borrowerData.activeLoansCount} active, {borrowerData.overdueLoansCount} overdue
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">
                  Total Borrowed
                </CardTitle>
                <DollarSign className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {formatCurrency(borrowerData.totalBorrowed)}
                </div>
                <p className="text-xs text-slate-600 mt-1">Lifetime total</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">
                  Outstanding
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(borrowerData.totalOutstanding)}
                </div>
                <p className="text-xs text-slate-600 mt-1">Current balance</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">
                  Paid Off
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(borrowerData.totalPaid)}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {borrowerData.paidLoansCount} loans completed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Loan Portfolio Table */}
          <Card className="border-slate-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-slate-900">Loan Portfolio</CardTitle>
              <CardDescription className="text-slate-600">
                All loans for this borrower
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="rounded-md border border-slate-200">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loan Amount</TableHead>
                      <TableHead>Interest Rate</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {borrowerData.loans.map((loan) => (
                      <TableRow key={loan.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">
                          {formatCurrency(loan.loan_amount)}
                        </TableCell>
                        <TableCell>{loan.interest_rate}%</TableCell>
                        <TableCell>{formatDate(loan.start_date)}</TableCell>
                        <TableCell>{formatDate(loan.due_date)}</TableCell>
                        <TableCell>{getStatusBadge(loan.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={loan.risk_score}
                              className="w-20 h-2"
                              indicatorClassName={getRiskColor(loan.risk_score)}
                            />
                            <span className="text-sm text-slate-600 w-8">
                              {loan.risk_score}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="border-slate-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-slate-900">Loan Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-600">Active Loans</p>
                    <p className="text-2xl font-bold text-green-600">
                      {borrowerData.activeLoansCount}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-600">Overdue Loans</p>
                    <p className="text-2xl font-bold text-red-600">
                      {borrowerData.overdueLoansCount}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-600">Paid Loans</p>
                    <p className="text-2xl font-bold text-slate-600">
                      {borrowerData.paidLoansCount}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-slate-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
