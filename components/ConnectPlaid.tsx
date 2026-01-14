"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePlaidLink } from "react-plaid-link";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export default function ConnectPlaid() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { open, ready } = usePlaidLink({
    token: linkToken!,
    onSuccess: async (public_token) => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user?.id) {
          toast.error("Authentication error. Please log in again.");
          return;
        }

        // Get session for access token
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          toast.error("Authentication error. Please log in again.");
          return;
        }

        const functionUrl = `${SUPABASE_URL}/functions/v1/fetch-loans`;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const headers: HeadersInit = {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
          "apikey": anonKey
        };

        const res = await fetch(functionUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({ public_token, user_id: data.user.id }),
          signal: controller.signal,
          mode: "cors", // Explicitly set CORS mode
          credentials: "omit" // Don't send cookies
        }).catch((fetchError) => {
          clearTimeout(timeoutId);
          if (fetchError.name === 'AbortError') {
            throw new Error("Request timed out. Please try again.");
          }
          throw new Error(`Network error: ${fetchError.message}. Please check your internet connection and try again.`);
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(`Failed to fetch loans: ${res.status} - ${errorData.error || res.statusText}`);
        }

        const result = await res.json();
        toast.success(`Successfully imported ${result.loans_imported || 0} loans!`);
        // Refresh the page to show new loans
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to import loans. Please try again.";
        toast.error(errorMessage);
      }
    },
  });

  const getToken = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        toast.error("Please log in to connect your bank account");
        setIsLoading(false);
        return;
      }

      // Get session for access token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error("Authentication error. Please log in again.");
        setIsLoading(false);
        return;
      }

      if (!SUPABASE_URL) {
        toast.error("Configuration error: Supabase URL not found");
        setIsLoading(false);
        return;
      }

      const functionUrl = `${SUPABASE_URL}/functions/v1/create-link-token`;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const headers: HeadersInit = {
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
        "apikey": anonKey
      };

      const res = await fetch(functionUrl, {
        method: "POST",
        headers,
        signal: controller.signal,
        mode: "cors", // Explicitly set CORS mode
        credentials: "omit" // Don't send cookies
      }).catch((fetchError) => {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error("Request timed out. Please try again.");
        }
        throw new Error(`Network error: ${fetchError.message}. Please check your internet connection and try again.`);
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`Failed to create link token: ${res.status} - ${errorData.error || res.statusText}`);
      }

      const { link_token } = await res.json();
      if (!link_token) {
        throw new Error("No link token received from server");
      }
      setLinkToken(link_token);
      setIsLoading(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to initialize bank connection";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (linkToken) {
      open();
    } else {
      getToken();
    }
  };

  return (
    <Button onClick={handleClick} disabled={(!!linkToken && !ready) || isLoading}>
      {isLoading ? "Connecting..." : linkToken ? (ready ? "Connect Bank" : "Loading…") : "Connect Loan Apps"}
    </Button>
  );
}

