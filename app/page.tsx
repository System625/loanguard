import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, TrendingUp, Bell, Leaf, BarChart3, Users, CheckCircle2, ArrowRight, Link2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F3F4FB]">
      {/* Header */}
      <header className="border-b border-[#D0D9F7] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-[#6B7DE8]" />
            <span className="text-2xl font-bold text-[#15123D]">LoanGuard</span>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="hidden sm:inline-flex border-[#D0D9F7] text-[#15123D]">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="bg-[#6B7DE8] hover:bg-[#4338CA] text-white">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-[#15123D] leading-tight">
            Monitor Loans, Mitigate Risks, Maximize Returns
          </h1>

          <p className="text-lg md:text-xl text-[#556277] max-w-2xl">
            LoanGuard helps lenders and borrowers track loan portfolios in real-time, assess risk scores,
            manage payments, and monitor ESG compliance—all in one powerful platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild size="lg" className="bg-[#6B7DE8] hover:bg-[#4338CA] text-white text-lg px-8">
              <Link href="/login">
                Try Live Demo
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-[#D0D9F7] text-[#15123D] text-lg px-8">
              <Link href="/signup">
                Sign Up Free
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Plaid Integration Showcase */}
      <section className="container mx-auto px-4 py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-[#15123D] mb-4">
              Connect 10,000+ Banks in 30 Seconds
            </h2>
            <p className="text-lg text-[#556277] max-w-2xl mx-auto">
              Powered by Plaid — Import loans automatically from any financial institution with zero manual entry
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Before - Manual Entry */}
            <Card className="border-2 border-[#D0D9F7] shadow-sm">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#15123D]">
                    Manual Entry
                  </CardTitle>
                  <span className="text-2xl font-bold text-red-500">10 min</span>
                </div>
                <CardDescription className="text-[#556277]">
                  Traditional method
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2 text-sm text-[#556277]">
                  <span className="text-red-500">•</span>
                  <span>Manually type loan details</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-[#556277]">
                  <span className="text-red-500">•</span>
                  <span>Error-prone data entry</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-[#556277]">
                  <span className="text-red-500">•</span>
                  <span>Time-consuming process</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-[#556277]">
                  <span className="text-red-500">•</span>
                  <span>No real-time sync</span>
                </div>
              </CardContent>
            </Card>

            {/* After - Plaid */}
            <Card className="border-2 border-[#6B7DE8] shadow-lg bg-gradient-to-br from-[#F3F4FB] to-white">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#15123D] flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    LoanGuard + Plaid
                  </CardTitle>
                  <span className="text-2xl font-bold text-[#10B981]">30 sec</span>
                </div>
                <CardDescription className="text-[#556277]">
                  Automated import
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2 text-sm text-[#15123D]">
                  <CheckCircle2 className="h-4 w-4 text-[#10B981] mt-0.5" />
                  <span className="font-medium">One-click authentication</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-[#15123D]">
                  <CheckCircle2 className="h-4 w-4 text-[#10B981] mt-0.5" />
                  <span className="font-medium">100% accurate data</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-[#15123D]">
                  <CheckCircle2 className="h-4 w-4 text-[#10B981] mt-0.5" />
                  <span className="font-medium">Instant portfolio population</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-[#15123D]">
                  <CheckCircle2 className="h-4 w-4 text-[#10B981] mt-0.5" />
                  <span className="font-medium">Real-time balance updates</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#556277] mb-4">Supports all major financial institutions:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-[#7E8BA0]">
              <span>Chase • Bank of America • Wells Fargo • Citi • Capital One • +10,000 more</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#15123D] mb-4">
              Real-Time Portfolio Monitoring
            </h2>
            <p className="text-lg text-[#556277] max-w-2xl mx-auto">
              Get instant insights with intelligent risk assessment, interactive charts, and automated alerts
            </p>
          </div>

          {/* Dashboard Screenshot Placeholder */}
          <div className="relative rounded-xl border-4 border-[#D0D9F7] shadow-2xl overflow-hidden bg-white">
            <div className="aspect-video bg-gradient-to-br from-[#F3F4FB] to-white flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <BarChart3 className="h-24 w-24 text-[#6B7DE8] mx-auto" />
                <p className="text-xl font-semibold text-[#15123D]">Dashboard Screenshot</p>
                <p className="text-sm text-[#556277] max-w-md">
                  Add your dashboard screenshot here: <code className="bg-[#F3F4FB] px-2 py-1 rounded">public/screenshots/dashboard.png</code>
                </p>
              </div>
            </div>

            {/* Feature Callouts */}
            <div className="absolute top-4 left-4 bg-[#6B7DE8] text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Portfolio Analytics
            </div>
            <div className="absolute top-4 right-4 bg-[#E8735E] text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Real-Time Updates
            </div>
            <div className="absolute bottom-4 left-4 bg-[#10B981] text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Risk Scoring
            </div>
            <div className="absolute bottom-4 right-4 bg-[#8B9EF0] text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              ESG Tracking
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-20 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#15123D] mb-4">
            Everything you need to manage loans
          </h2>
          <p className="text-lg text-[#556277] max-w-2xl mx-auto">
            Comprehensive tools designed for modern financial institutions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 border-[#D0D9F7] shadow-sm hover:shadow-lg hover:border-[#8B9EF0] transition-all">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-[#F3F4FB] rounded-lg border border-[#D0D9F7]">
                  <BarChart3 className="h-5 w-5 text-[#6B7DE8]" />
                </div>
                <CardTitle className="text-[#15123D]">Portfolio Dashboard</CardTitle>
              </div>
              <CardDescription className="text-[#556277]">
                Track all your loans in one place with interactive charts and real-time statistics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-[#D0D9F7] shadow-sm hover:shadow-lg hover:border-[#8B9EF0] transition-all">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-red-50 rounded-lg border border-red-200">
                  <TrendingUp className="h-5 w-5 text-red-600" />
                </div>
                <CardTitle className="text-[#15123D]">Risk Assessment</CardTitle>
              </div>
              <CardDescription className="text-[#556277]">
                Automated risk scoring based on loan amount, interest rate, payment history, and duration
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-[#D0D9F7] shadow-sm hover:shadow-lg hover:border-[#8B9EF0] transition-all">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Bell className="h-5 w-5 text-yellow-600" />
                </div>
                <CardTitle className="text-[#15123D]">Smart Alerts</CardTitle>
              </div>
              <CardDescription className="text-[#556277]">
                Get notified instantly about overdue payments, high-risk loans, and important updates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-[#D0D9F7] shadow-sm hover:shadow-lg hover:border-[#8B9EF0] transition-all">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                  <Leaf className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-[#15123D]">ESG Metrics</CardTitle>
              </div>
              <CardDescription className="text-[#556277]">
                Track environmental, social, and governance performance for sustainable lending
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-[#D0D9F7] shadow-sm hover:shadow-lg hover:border-[#8B9EF0] transition-all">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-[#15123D]">Multi-user Support</CardTitle>
              </div>
              <CardDescription className="text-[#556277]">
                Role-based access for lenders and borrowers with secure authentication
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-[#D0D9F7] shadow-sm hover:shadow-lg hover:border-[#8B9EF0] transition-all">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-[#F3F4FB] rounded-lg border border-[#D0D9F7]">
                  <Shield className="h-5 w-5 text-[#6B7DE8]" />
                </div>
                <CardTitle className="text-[#15123D]">Secure & Compliant</CardTitle>
              </div>
              <CardDescription className="text-[#556277]">
                Bank-grade security with encrypted data storage and secure authentication
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <Card className="bg-[#6B7DE8] border-0 shadow-xl">
          <CardContent className="py-12 md:py-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to transform your loan management?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join financial institutions and lenders who trust LoanGuard to manage their portfolios
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-[#6B7DE8] hover:bg-[#F3F4FB] text-lg px-8">
                <Link href="/signup">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8">
                <Link href="/login">
                  Try Demo
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#D0D9F7] bg-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-[#6B7DE8]" />
              <span className="text-lg font-bold text-[#15123D]">LoanGuard</span>
            </div>
            <p className="text-sm text-[#556277]">
              © 2025 LoanGuard. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
