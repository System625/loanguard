'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupabaseClient } from '@/components/SupabaseProvider';
import { Zap, Copy } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = useSupabaseClient();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Login failed', {
          description: error.message,
        });
        setIsLoading(false);
        return;
      }

      if (data.session) {
        toast.success('Welcome back!', {
          description: 'Redirecting to dashboard...',
        });

        // Wait for cookies to be set, then refresh and navigate
        // The onAuthStateChange in SupabaseProvider will handle the refresh
        await new Promise(resolve => setTimeout(resolve, 100));
        router.refresh();
        router.push('/dashboard');
      }
    } catch {
      toast.error('An unexpected error occurred', {
        description: 'Please try again later.',
      });
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('lender@loanguard.demo');
    setPassword('demo123456');
    toast.success('Demo credentials loaded', {
      description: 'Click "Sign In" to continue',
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Demo Credentials Callout - Most Prominent */}
        <Card className="border-2 border-primary bg-primary/5 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">🎯 Try the Demo Instantly</h3>
                  <p className="text-sm text-muted-foreground">Click the button below to auto-fill demo credentials</p>
                </div>
                <div className="flex justify-center text-center items-center">
                  <Button
                    type="button"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={handleDemoLogin}
                    disabled={isLoading}
                  >
                    <Zap className="h-4 w-4" />
                    Load Demo Credentials
                  </Button>
                </div>
                <div className="pt-2 border-t border-primary/20 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Or copy manually:</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded border border-border">
                      <span className="text-sm font-mono text-foreground flex-1">lender@loanguard.demo</span>
                      <button
                        onClick={() => copyToClipboard('lender@loanguard.demo', 'Email')}
                        className="text-primary hover:text-primary/80"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded border border-border">
                      <span className="text-sm font-mono text-foreground flex-1">demo123456</span>
                      <button
                        onClick={() => copyToClipboard('demo123456', 'Password')}
                        className="text-primary hover:text-primary/80"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Login Form Card */}
        <Card className="shadow-xl border-2 border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center text-foreground">
              LoanGuard
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Sign in to monitor your loans
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-input focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-input focus:ring-ring"
                />
              </div>
              <div className="flex justify-center text-center items-center">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>
            </CardContent>
          </form>
          <CardFooter className="flex justify-center border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary hover:text-primary/80 font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
