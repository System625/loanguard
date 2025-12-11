import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, TrendingUp, Bell, Leaf, BarChart3, Users, Lock, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">LoanGuard</span>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">          

          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight">
            Monitor Loans, Mitigate Risks, Maximize Returns
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl">
            LoanGuard helps lenders and borrowers track loan portfolios in real-time, assess risk scores,
            manage payments, and monitor ESG compliance—all in one powerful platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
              <Link href="/signup">
                Start Free Trial
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>          
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Everything you need to manage loans
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Comprehensive tools designed for modern financial institutions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-slate-900">Portfolio Dashboard</CardTitle>
              </div>
              <CardDescription>
                Track all your loans in one place with interactive charts and real-time statistics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-red-600" />
                </div>
                <CardTitle className="text-slate-900">Risk Assessment</CardTitle>
              </div>
              <CardDescription>
                Automated risk scoring based on loan amount, interest rate, payment history, and duration
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Bell className="h-5 w-5 text-yellow-600" />
                </div>
                <CardTitle className="text-slate-900">Smart Alerts</CardTitle>
              </div>
              <CardDescription>
                Get notified instantly about overdue payments, high-risk loans, and important updates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Leaf className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-slate-900">ESG Metrics</CardTitle>
              </div>
              <CardDescription>
                Track environmental, social, and governance performance for sustainable lending
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-slate-900">Multi-user Support</CardTitle>
              </div>
              <CardDescription>
                Role-based access for lenders and borrowers with secure authentication
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Shield className="h-5 w-5 text-indigo-600" />
                </div>
                <CardTitle className="text-slate-900">Secure & Compliant</CardTitle>
              </div>
              <CardDescription>
                Bank-grade security with encrypted data storage and secure authentication
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 shadow-xl">
          <CardContent className="py-12 md:py-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to transform your loan management?
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Join financial institutions and lenders who trust LoanGuard to manage their portfolios
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8">
                <Link href="/signup">
                  Create Free Account
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white bg-blue-600 hover:bg-blue-700 hover:text-white text-lg px-8">
                <Link href="/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold text-slate-900">LoanGuard</span>
            </div>
            <p className="text-sm text-slate-600">
              © 2025 LoanGuard. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
