'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Trash2,
  Plus,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSupabaseClient } from '@/components/SupabaseProvider';
import AddPaymentDialog from './AddPaymentDialog';
import ESGMetrics from './ESGMetrics';

interface Loan {
  id: string;
  borrower_name: string;
  loan_amount: number;
  interest_rate: number;
  start_date: string;
  due_date: string;
  status: 'active' | 'overdue' | 'paid';
  payment_history: Payment[];
  risk_score: number;
  created_at?: string;
}

interface Payment {
  id: string;
  amount: number;
  date: string;
  method: string;
  note?: string;
}

interface Alert {
  id: string;
  loan_id: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  created_at: string;
  resolved: boolean;
}

interface ESGMetric {
  id: string;
  loan_id: string;
  esg_score: number;
  carbon_footprint: number;
  environmental_score: number;
  social_score: number;
  governance_score: number;
  notes: string;
  created_at: string;
}

interface LoanDetailsClientProps {
  initialLoan: Loan;
  initialAlerts: Alert[];
  initialESGMetrics?: ESGMetric | null;
}

export default function LoanDetailsClient({
  initialLoan,
  initialAlerts,
  initialESGMetrics,
}: LoanDetailsClientProps) {
  const [loan, setLoan] = useState<Loan>(initialLoan);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const router = useRouter();
  const supabase = useSupabaseClient();

  // Realtime subscription for loan updates
  useEffect(() => {
    const channel = supabase
      .channel(`loan-${loan.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'loans',
          filter: `id=eq.${loan.id}`,
        },
        (payload) => {
          setLoan(payload.new as Loan);
          toast.info('Loan updated');
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts',
          filter: `loan_id=eq.${loan.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAlerts((current) => [payload.new as Alert, ...current]);
            toast.warning('New alert added');
          } else if (payload.eventType === 'UPDATE') {
            setAlerts((current) =>
              current.map((alert) =>
                alert.id === payload.new.id ? (payload.new as Alert) : alert
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setAlerts((current) =>
              current.filter((alert) => alert.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, loan.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge className="bg-red-500 hover:bg-red-600">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'bg-red-500';
    if (risk >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleUpdateStatus = async (newStatus: 'active' | 'overdue' | 'paid') => {
    setIsUpdatingStatus(true);

    try {
      const { error } = await supabase
        .from('loans')
        .update({ status: newStatus })
        .eq('id', loan.id);

      if (error) throw error;

      setLoan({ ...loan, status: newStatus });
      toast.success('Status updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to update status', {
        description: errorMessage,
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from('loans').delete().eq('id', loan.id);

      if (error) throw error;

      toast.success('Loan deleted successfully');
      router.push('/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to delete loan', {
        description: errorMessage,
      });
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ resolved: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts((current) =>
        current.map((alert) =>
          alert.id === alertId ? { ...alert, resolved: true } : alert
        )
      );
      toast.success('Alert resolved');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to resolve alert', {
        description: errorMessage,
      });
    }
  };

  // Calculate payment statistics
  const payments = Array.isArray(loan.payment_history) ? loan.payment_history : [];
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = loan.loan_amount - totalPaid;
  const paymentProgress = (totalPaid / loan.loan_amount) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Loan Details</h2>
            <p className="text-slate-600 mt-1">
              Manage and monitor loan #{loan.id.slice(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-300 hover:bg-red-50"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Details Card */}
      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-slate-900">
              {loan.borrower_name}
            </CardTitle>
            {getStatusBadge(loan.status)}
          </div>
          <CardDescription>Loan Information and Details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Loan Amount</p>
                <p className="text-xl font-bold text-slate-900">
                  {formatCurrency(loan.loan_amount)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Interest Rate</p>
                <p className="text-xl font-bold text-slate-900">{loan.interest_rate}%</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Start Date</p>
                <p className="text-sm font-medium text-slate-900">
                  {formatDate(loan.start_date)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-orange-100 p-2">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Due Date</p>
                <p className="text-sm font-medium text-slate-900">
                  {formatDate(loan.due_date)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Risk Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-700">Risk Score</p>
              <p className="text-sm font-bold text-slate-900">{loan.risk_score}/100</p>
            </div>
            <Progress
              value={loan.risk_score}
              className="h-3"
              indicatorClassName={getRiskColor(loan.risk_score)}
            />
            <p className="text-xs text-slate-600 mt-1">
              {loan.risk_score >= 70
                ? 'High risk - requires close monitoring'
                : loan.risk_score >= 40
                ? 'Medium risk - monitor regularly'
                : 'Low risk - healthy loan'}
            </p>
          </div>

          <Separator />

          {/* Update Status */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Update Status</p>
            <div className="flex gap-2">
              <Select
                value={loan.status}
                onValueChange={handleUpdateStatus}
                disabled={isUpdatingStatus}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Progress Card */}
      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-slate-900">Payment Progress</CardTitle>
          <CardDescription>Track payment completion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-slate-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalPaid)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Remaining</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(remainingAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {paymentProgress.toFixed(1)}%
              </p>
            </div>
          </div>
          <Progress value={paymentProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900">Payment History</CardTitle>
              <CardDescription>All recorded payments for this loan</CardDescription>
            </div>
            <Button
              onClick={() => setIsPaymentDialogOpen(true)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">
                No payments recorded
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Add the first payment to start tracking.
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.date)}</TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell className="capitalize">{payment.method}</TableCell>
                      <TableCell className="text-slate-600">
                        {payment.note || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts Section */}
      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alerts & Notifications
          </CardTitle>
          <CardDescription>
            Important alerts and issues related to this loan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">
                No alerts
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Everything looks good with this loan.
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {alerts.map((alert, index) => (
                <AccordionItem key={alert.id} value={`alert-${index}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      {getSeverityBadge(alert.severity)}
                      <span className="font-medium">{alert.type}</span>
                      {alert.resolved && (
                        <Badge variant="outline" className="text-green-600">
                          Resolved
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      <p className="text-sm text-slate-700">{alert.message}</p>
                      <p className="text-xs text-slate-500">
                        Created: {formatDateTime(alert.created_at)}
                      </p>
                      {!alert.resolved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveAlert(alert.id)}
                          className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Resolved
                        </Button>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the loan and
              all associated data including payment history and alerts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Loan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ESG Metrics Section */}
      <ESGMetrics loanId={loan.id} initialMetrics={initialESGMetrics || null} />

      {/* Add Payment Dialog */}
      <AddPaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        loan={loan}
        onPaymentAdded={(updatedLoan) => {
          setLoan(updatedLoan);
          setIsPaymentDialogOpen(false);
        }}
      />
    </div>
  );
}
