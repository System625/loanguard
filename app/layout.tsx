import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SupabaseProvider from "@/components/SupabaseProvider";
import { Toaster } from "@/components/ui/sonner";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LoanGuard - Smart Loan Monitoring & Risk Management",
  description: "Monitor loans, track payments, assess risks, and manage ESG metrics in real-time with LoanGuard.",
  keywords: ["loan monitoring", "risk management", "ESG metrics", "financial tracking"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch session server-side to hydrate the provider
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SupabaseProvider session={session}>
          {children}
          <Toaster />
        </SupabaseProvider>
      </body>
    </html>
  );
}
