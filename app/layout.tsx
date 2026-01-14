import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import SupabaseProvider from "@/components/SupabaseProvider";
import { Toaster } from "@/components/ui/sonner";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
  // Verify authentication server-side to hydrate the provider securely
  const supabase = await createServerSupabaseClient();

  // Use getUser() to verify the session is authentic
  const { data: { user } } = await supabase.auth.getUser();

  // Get session only if user is authenticated
  const { data: { session } } = user ? await supabase.auth.getSession() : { data: { session: null } };

  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} antialiased font-sans`}
      >
        <SupabaseProvider session={session}>
          {children}
          <Toaster />
        </SupabaseProvider>
      </body>
    </html>
  );
}
