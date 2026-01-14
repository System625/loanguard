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

interface CreateLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoanCreated: () => void;
}

export default function CreateLoanDialog({
  open,
  onOpenChange,
  onLoanCreated,
}: CreateLoanDialogProps) {
  const [borrowerName, setBorrowerName] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [dueDate, setDueDate] = useState<Date>();
  const [status, setStatus] = useState<'active' | 'overdue' | 'paid'>('active');
  const [riskScore, setRiskScore] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const supabase = useSupabaseClient();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!startDate || !dueDate) {
        toast.error('Please select both start and due dates');
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.from('loans').insert([
        {
          borrower_name: borrowerName,
          loan_amount: parseFloat(loanAmount),
          interest_rate: parseFloat(interestRate),
          start_date: startDate.toISOString(),
          due_date: dueDate.toISOString(),
          status: status,
          risk_score: parseInt(riskScore),
          payment_history: {},
        },
      ]).select();

      if (error) {
        throw error;
      }

      toast.success('Loan created successfully');

      // Reset form
      setBorrowerName('');
      setLoanAmount('');
      setInterestRate('');
      setStartDate(undefined);
      setDueDate(undefined);
      setStatus('active');
      setRiskScore('');

      onLoanCreated();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to create loan', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Loan</DialogTitle>
          <DialogDescription>
            Add a new loan to your portfolio. Fill in all the required information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="borrower_name">Borrower Name</Label>
              <Input
                id="borrower_name"
                placeholder="John Doe"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="loan_amount">Loan Amount ($)</Label>
                <Input
                  id="loan_amount"
                  type="number"
                  step="0.01"
                  placeholder="10000.00"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                <Input
                  id="interest_rate"
                  type="number"
                  step="0.01"
                  placeholder="5.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      disabled={isLoading}
                      className={cn(
                        'flex h-9 w-full items-center justify-start gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      <span>{startDate ? format(startDate, 'PPP') : 'Pick a date'}</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      disabled={isLoading}
                      className={cn(
                        'flex h-9 w-full items-center justify-start gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                        !dueDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      <span>{dueDate ? format(dueDate, 'PPP') : 'Pick a date'}</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as 'active' | 'overdue' | 'paid')}
                  disabled={isLoading}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="risk_score">Risk Score (0-100)</Label>
                <Input
                  id="risk_score"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="50"
                  value={riskScore}
                  onChange={(e) => setRiskScore(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
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
              {isLoading ? 'Creating...' : 'Create Loan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
