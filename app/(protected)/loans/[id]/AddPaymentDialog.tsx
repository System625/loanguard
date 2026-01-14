'use client';

import { useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useSupabaseClient } from '@/components/SupabaseProvider';
import { cn } from '@/lib/utils';

interface Payment {
  id: string;
  amount: number;
  date: string;
  method: string;
  note?: string;
}

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
}

interface AddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: Loan;
  onPaymentAdded: (updatedLoan: Loan) => void;
}

export default function AddPaymentDialog({
  open,
  onOpenChange,
  loan,
  onPaymentAdded,
}: AddPaymentDialogProps) {
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [method, setMethod] = useState('bank_transfer');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const supabase = useSupabaseClient();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!paymentDate) {
        toast.error('Please select a payment date');
        setIsLoading(false);
        return;
      }

      const paymentAmount = parseFloat(amount);
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        toast.error('Please enter a valid payment amount');
        setIsLoading(false);
        return;
      }

      // Create new payment object
      const newPayment = {
        id: crypto.randomUUID(),
        amount: paymentAmount,
        date: paymentDate.toISOString(),
        method: method,
        note: note || undefined,
      };

      // Get existing payment history
      const existingPayments = Array.isArray(loan.payment_history)
        ? loan.payment_history
        : [];

      // Add new payment to history
      const updatedPaymentHistory = [...existingPayments, newPayment];

      // Update loan in database
      const { data, error } = await supabase
        .from('loans')
        .update({
          payment_history: updatedPaymentHistory,
        })
        .eq('id', loan.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success('Payment added successfully', {
        description: `${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(paymentAmount)} recorded`,
      });

      // Reset form
      setAmount('');
      setPaymentDate(new Date());
      setMethod('bank_transfer');
      setNote('');

      onPaymentAdded(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to add payment', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate remaining amount
  const existingPayments = Array.isArray(loan.payment_history)
    ? loan.payment_history
    : [];
  const totalPaid = existingPayments.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = loan.loan_amount - totalPaid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
          <DialogDescription>
            Record a new payment for {loan.borrower_name}&apos;s loan.
            <br />
            Remaining: {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(remainingAmount)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Payment Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="1000.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={isLoading}
                max={remainingAmount}
              />
              <p className="text-xs text-slate-600">
                Maximum: {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(remainingAmount)}
              </p>
            </div>

            <div className="grid gap-2">
              <Label>Payment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'justify-start text-left font-normal',
                      !paymentDate && 'text-muted-foreground'
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {paymentDate ? format(paymentDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={paymentDate}
                    onSelect={(date) => date && setPaymentDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="method">Payment Method</Label>
              <Select
                value={method}
                onValueChange={setMethod}
                disabled={isLoading}
              >
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Add any additional notes about this payment..."
                value={note}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
