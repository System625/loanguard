'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSupabaseClient } from '@/components/SupabaseProvider';
import { cn } from '@/lib/utils';

// Zod validation schema
const loanFormSchema = z.object({
  borrower_name: z
    .string()
    .min(2, 'Borrower name must be at least 2 characters')
    .max(100, 'Borrower name must be less than 100 characters'),
  loan_amount: z
    .string()
    .min(1, 'Loan amount is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Loan amount must be a positive number',
    }),
  interest_rate: z
    .string()
    .min(1, 'Interest rate is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100, {
      message: 'Interest rate must be between 0 and 100',
    }),
  start_date: z.date({
    message: 'Start date is required',
  }),
  due_date: z.date({
    message: 'Due date is required',
  }),
  status: z.enum(['active', 'overdue', 'paid']),
});

type LoanFormValues = z.infer<typeof loanFormSchema>;

interface NewLoanModalProps {
  onLoanCreated?: () => void;
  triggerButton?: React.ReactNode;
  'data-tour'?: string;
}

export default function NewLoanModal({ onLoanCreated, triggerButton, 'data-tour': dataTour }: NewLoanModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = useSupabaseClient();

  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      borrower_name: '',
      loan_amount: '',
      interest_rate: '',
      status: 'active',
    },
  });

  // Calculate risk score based on loan parameters
  const calculateRiskScore = (
    loanAmount: number,
    interestRate: number,
    startDate: Date,
    dueDate: Date
  ): number => {
    // Simple risk calculation algorithm
    let riskScore = 0;

    // Factor 1: Loan amount (higher amount = higher risk)
    if (loanAmount > 100000) riskScore += 30;
    else if (loanAmount > 50000) riskScore += 20;
    else if (loanAmount > 10000) riskScore += 10;
    else riskScore += 5;

    // Factor 2: Interest rate (higher rate might indicate higher risk borrower)
    if (interestRate > 15) riskScore += 30;
    else if (interestRate > 10) riskScore += 20;
    else if (interestRate > 5) riskScore += 10;
    else riskScore += 5;

    // Factor 3: Loan duration (longer duration = higher risk)
    const durationInDays = Math.floor(
      (dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (durationInDays > 365) riskScore += 20;
    else if (durationInDays > 180) riskScore += 15;
    else if (durationInDays > 90) riskScore += 10;
    else riskScore += 5;

    // Cap at 100
    return Math.min(riskScore, 100);
  };

  const onSubmit = async (values: LoanFormValues) => {
    setIsLoading(true);

    try {
      // Validate that due date is after start date
      if (values.due_date <= values.start_date) {
        form.setError('due_date', {
          type: 'manual',
          message: 'Due date must be after start date',
        });
        setIsLoading(false);
        return;
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Authentication required', {
          description: 'Please log in to create a loan',
        });
        setIsLoading(false);
        return;
      }

      // Calculate risk score
      const riskScore = calculateRiskScore(
        parseFloat(values.loan_amount),
        parseFloat(values.interest_rate),
        values.start_date,
        values.due_date
      );

      // Insert loan into database
      const { error } = await supabase
        .from('loans')
        .insert([
          {
            borrower_name: values.borrower_name,
            loan_amount: parseFloat(values.loan_amount),
            interest_rate: parseFloat(values.interest_rate),
            start_date: values.start_date.toISOString(),
            due_date: values.due_date.toISOString(),
            status: values.status,
            risk_score: riskScore,
            payment_history: [],
            user_id: user.id,
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      toast.success('Loan created successfully', {
        description: `${values.borrower_name}'s loan has been added to your portfolio`,
      });

      // Reset form and close modal
      form.reset();
      setOpen(false);

      // Callback to refresh data
      if (onLoanCreated) {
        onLoanCreated();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error('Failed to create loan', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="bg-blue-600 hover:bg-blue-700" data-tour={dataTour}>
            <Plus className="mr-2 h-4 w-4" />
            Create Loan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Loan</DialogTitle>
          <DialogDescription>
            Add a new loan to your portfolio. Fill in all the required information below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Borrower Name */}
            <FormField
              control={form.control}
              name="borrower_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Borrower Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Full name of the borrower
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Loan Amount & Interest Rate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="loan_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Amount ($) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="10000.00"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interest_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Rate (%) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="5.5"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Start Date & Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                            disabled={isLoading}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                            disabled={isLoading}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Set the initial status of the loan
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
