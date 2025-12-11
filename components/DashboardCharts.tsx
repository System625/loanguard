'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

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

interface DashboardChartsProps {
  loans: Loan[];
}

const COLORS = {
  active: '#10b981', // green
  overdue: '#ef4444', // red
  paid: '#94a3b8', // gray
  primary: '#3b82f6', // blue
  secondary: '#8b5cf6', // purple
  tertiary: '#f59e0b', // amber
};

const PIE_COLORS = ['#10b981', '#ef4444', '#94a3b8'];

export default function DashboardCharts({ loans }: DashboardChartsProps) {
  // Prepare data for Line Chart (Loan amounts over time)
  const loanAmountOverTime = useMemo(() => {
    if (loans.length === 0) return [];

    // Sort loans by start date
    const sortedLoans = [...loans].sort(
      (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    // Group by month
    const monthlyData: Record<string, number> = {};

    sortedLoans.forEach((loan) => {
      const date = new Date(loan.start_date);
      const monthYear = date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      monthlyData[monthYear] += loan.loan_amount;
    });

    return Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount,
    }));
  }, [loans]);

  // Prepare data for Pie Chart (Status distribution)
  const statusDistribution = useMemo(() => {
    const distribution = {
      active: 0,
      overdue: 0,
      paid: 0,
    };

    loans.forEach((loan) => {
      distribution[loan.status]++;
    });

    return [
      { name: 'Active', value: distribution.active },
      { name: 'Overdue', value: distribution.overdue },
      { name: 'Paid', value: distribution.paid },
    ].filter((item) => item.value > 0); // Only show non-zero values
  }, [loans]);

  // Prepare data for Bar Chart (Risk scores)
  const riskScoreData = useMemo(() => {
    return loans
      .map((loan) => ({
        name: loan.borrower_name.length > 15
          ? loan.borrower_name.substring(0, 15) + '...'
          : loan.borrower_name,
        risk: loan.risk_score,
      }))
      .sort((a, b) => b.risk - a.risk) // Sort by risk score descending
      .slice(0, 10); // Show top 10
  }, [loans]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-slate-900">{label}</p>
          <p className="text-sm text-slate-600">
            {payload[0].name === 'amount'
              ? formatCurrency(payload[0].value)
              : `${payload[0].value}${payload[0].name === 'risk' ? '' : ''}`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loans.length === 0) {
    return (
      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-slate-900">Analytics</CardTitle>
          <CardDescription>Visual insights into your loan portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No data to display
            </h3>
            <p className="text-sm text-slate-600">
              Add loans to see visual analytics and insights
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-md">
      <CardHeader>
        <CardTitle className="text-slate-900">Portfolio Analytics</CardTitle>
        <CardDescription>Visual insights into your loan portfolio</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="timeline" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Status</span>
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Risk</span>
            </TabsTrigger>
          </TabsList>

          {/* Line Chart - Loan Amounts Over Time */}
          <TabsContent value="timeline" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Loan Amounts Over Time
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Track loan disbursement patterns by month
              </p>
            </div>
            {loanAmountOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={loanAmountOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    name="Loan Amount"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    dot={{ fill: COLORS.primary, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-slate-600">
                No timeline data available
              </div>
            )}
          </TabsContent>

          {/* Pie Chart - Status Distribution */}
          <TabsContent value="status" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Status Distribution
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Overview of loan statuses in your portfolio
              </p>
            </div>
            {statusDistribution.length > 0 ? (
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-3">
                  {statusDistribution.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: PIE_COLORS[index] }}
                      />
                      <span className="text-sm text-slate-700">
                        <span className="font-medium">{item.name}:</span> {item.value}{' '}
                        loan{item.value !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-600">
                No status data available
              </div>
            )}
          </TabsContent>

          {/* Bar Chart - Risk Scores */}
          <TabsContent value="risk" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Risk Score Analysis
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Top {Math.min(10, loans.length)} loans by risk score
              </p>
            </div>
            {riskScoreData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={riskScoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="risk"
                    name="Risk Score"
                    fill={COLORS.primary}
                    radius={[8, 8, 0, 0]}
                  >
                    {riskScoreData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.risk >= 70
                            ? COLORS.overdue
                            : entry.risk >= 40
                            ? COLORS.tertiary
                            : COLORS.active
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-slate-600">
                No risk data available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
