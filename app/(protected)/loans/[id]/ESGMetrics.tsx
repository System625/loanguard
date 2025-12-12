'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Leaf, Plus, TrendingUp, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSupabaseClient } from '@/components/SupabaseProvider';

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
  updated_at?: string;
}

interface ESGMetricsProps {
  loanId: string;
  initialMetrics: ESGMetric | null;
}

export default function ESGMetrics({ loanId, initialMetrics }: ESGMetricsProps) {
  const [metrics, setMetrics] = useState<ESGMetric | null>(initialMetrics);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [esgScore, setEsgScore] = useState('');
  const [carbonFootprint, setCarbonFootprint] = useState('');
  const [environmentalScore, setEnvironmentalScore] = useState('');
  const [socialScore, setSocialScore] = useState('');
  const [governanceScore, setGovernanceScore] = useState('');
  const [notes, setNotes] = useState('');

  const supabase = useSupabaseClient();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'bg-green-500' };
    if (score >= 60) return { label: 'Good', color: 'bg-blue-500' };
    if (score >= 40) return { label: 'Fair', color: 'bg-yellow-500' };
    return { label: 'Poor', color: 'bg-red-500' };
  };

  const handleAddMockData = async () => {
    setIsLoading(true);

    try {
      // Generate mock ESG data
      const mockData = {
        loan_id: loanId,
        esg_score: Math.floor(Math.random() * 40) + 60, // 60-100
        carbon_footprint: parseFloat((Math.random() * 50 + 10).toFixed(2)), // 10-60 tons
        environmental_score: Math.floor(Math.random() * 30) + 70, // 70-100
        social_score: Math.floor(Math.random() * 40) + 60, // 60-100
        governance_score: Math.floor(Math.random() * 30) + 70, // 70-100
        notes: 'Mock ESG data generated for demonstration purposes. Replace with actual metrics.',
      };

      const { data, error } = await supabase
        .from('esg_metrics')
        .insert([mockData])
        .select()
        .single();

      if (error) throw error;

      setMetrics(data);
      toast.success('ESG metrics added successfully', {
        description: 'Mock data has been generated for this loan',
      });
      setIsDialogOpen(false);
    } catch (error) {
      // If table doesn't exist, show helpful message
      if (error && typeof error === 'object' && 'code' in error && error.code === '42P01') {
        toast.info('ESG metrics table not configured', {
          description: 'Contact your administrator to enable ESG tracking',
        });
      } else {
        console.error('Error adding ESG metrics:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error('Failed to add ESG metrics', {
          description: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitCustomData = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const customData = {
        loan_id: loanId,
        esg_score: parseFloat(esgScore),
        carbon_footprint: parseFloat(carbonFootprint),
        environmental_score: parseFloat(environmentalScore),
        social_score: parseFloat(socialScore),
        governance_score: parseFloat(governanceScore),
        notes: notes,
      };

      const { data, error } = await supabase
        .from('esg_metrics')
        .insert([customData])
        .select()
        .single();

      if (error) throw error;

      setMetrics(data);
      toast.success('ESG metrics added successfully');

      // Reset form
      setEsgScore('');
      setCarbonFootprint('');
      setEnvironmentalScore('');
      setSocialScore('');
      setGovernanceScore('');
      setNotes('');
      setIsDialogOpen(false);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === '42P01') {
        toast.info('ESG metrics table not configured', {
          description: 'Contact your administrator to enable ESG tracking',
        });
      } else {
        console.error('Error adding ESG metrics:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error('Failed to add ESG metrics', {
          description: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!metrics) {
    return (
      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                ESG Metrics
              </CardTitle>
              <CardDescription>
                Environmental, Social, and Governance performance
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Leaf className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No ESG metrics available
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Add ESG metrics to track sustainability performance
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add ESG Metrics
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add ESG Metrics</DialogTitle>
                  <DialogDescription>
                    Add environmental, social, and governance metrics for this loan
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitCustomData}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="esg_score">Overall ESG Score (0-100)</Label>
                      <Input
                        id="esg_score"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="85"
                        value={esgScore}
                        onChange={(e) => setEsgScore(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="env_score">Environmental</Label>
                        <Input
                          id="env_score"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="80"
                          value={environmentalScore}
                          onChange={(e) => setEnvironmentalScore(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="social_score">Social</Label>
                        <Input
                          id="social_score"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="75"
                          value={socialScore}
                          onChange={(e) => setSocialScore(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="gov_score">Governance</Label>
                        <Input
                          id="gov_score"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="90"
                          value={governanceScore}
                          onChange={(e) => setGovernanceScore(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="carbon">Carbon Footprint (tons CO₂)</Label>
                      <Input
                        id="carbon"
                        type="number"
                        step="0.01"
                        placeholder="25.5"
                        value={carbonFootprint}
                        onChange={(e) => setCarbonFootprint(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional ESG notes and observations..."
                        value={notes}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                        disabled={isLoading}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddMockData}
                      disabled={isLoading}
                    >
                      Generate Mock Data
                    </Button>
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Adding...' : 'Add Metrics'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  const scoreBadge = getScoreBadge(metrics.esg_score);

  return (
    <Card className="border-slate-200 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            ESG Metrics
          </CardTitle>
          <Badge className={`${scoreBadge.color} hover:${scoreBadge.color}`}>
            {scoreBadge.label}
          </Badge>
        </div>
        <CardDescription>
          Environmental, Social, and Governance performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall ESG Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-700">Overall ESG Score</p>
            <p className={`text-2xl font-bold ${getScoreColor(metrics.esg_score)}`}>
              {metrics.esg_score}/100
            </p>
          </div>
          <Progress value={metrics.esg_score} className="h-2" />
        </div>

        {/* Individual Scores */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-slate-700">Environmental</p>
            </div>
            <p className={`text-xl font-bold ${getScoreColor(metrics.environmental_score)}`}>
              {metrics.environmental_score}
            </p>
            <Progress
              value={metrics.environmental_score}
              className="h-1.5"
              indicatorClassName="bg-green-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-medium text-slate-700">Social</p>
            </div>
            <p className={`text-xl font-bold ${getScoreColor(metrics.social_score)}`}>
              {metrics.social_score}
            </p>
            <Progress
              value={metrics.social_score}
              className="h-1.5"
              indicatorClassName="bg-blue-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" />
              <p className="text-sm font-medium text-slate-700">Governance</p>
            </div>
            <p className={`text-xl font-bold ${getScoreColor(metrics.governance_score)}`}>
              {metrics.governance_score}
            </p>
            <Progress
              value={metrics.governance_score}
              className="h-1.5"
              indicatorClassName="bg-purple-500"
            />
          </div>
        </div>

        {/* Carbon Footprint */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Carbon Footprint</p>
              <p className="text-2xl font-bold text-slate-900">
                {metrics.carbon_footprint} <span className="text-sm font-normal">tons CO₂</span>
              </p>
            </div>
            <Leaf className="h-8 w-8 text-green-600 opacity-50" />
          </div>
        </div>

        {/* Notes */}
        {metrics.notes && (
          <div className="border-t border-slate-200 pt-4">
            <p className="text-sm font-medium text-slate-700 mb-2">Notes</p>
            <p className="text-sm text-slate-600">{metrics.notes}</p>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-slate-500 text-right">
          Last updated: {new Date(metrics.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </CardContent>
    </Card>
  );
}
