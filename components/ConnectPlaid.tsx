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
        const { data: { session } } = await supabase.auth.getSession();
        const { data } = await supabase.auth.getUser();

        if (!session?.access_token || !data.user?.id) {
          toast.error("Authentication error. Please log in again.");
          return;
        }

        const functionUrl = `${SUPABASE_URL}/functions/v1/fetch-loans`;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        console.log("Calling Edge Function:", functionUrl);

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
          console.error("Network error calling Edge Function:", fetchError);
          console.error("Error details:", {
            name: fetchError.name,
            message: fetchError.message
          });
          if (fetchError.name === 'AbortError') {
            throw new Error("Request timed out. Please try again.");
          }
          throw new Error(`Network error: ${fetchError.message}. Please check your internet connection and try again.`);
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error("Failed to fetch loans:", res.status, errorData);
          throw new Error(`Failed to fetch loans: ${res.status} - ${errorData.error || res.statusText}`);
        }

        const result = await res.json();
        toast.success(`Successfully imported ${result.loans_imported || 0} loans!`);
        // Refresh the page to show new loans
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error("Error fetching loans:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to import loans. Please try again.";
        toast.error(errorMessage);
      }
    },
  });

  const getToken = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error("Please log in to connect your bank account");
        setIsLoading(false);
        return;
      }

      if (!SUPABASE_URL) {
        console.error("SUPABASE_URL is not defined");
        toast.error("Configuration error: Supabase URL not found");
        setIsLoading(false);
        return;
      }

      const functionUrl = `${SUPABASE_URL}/functions/v1/create-link-token`;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      
      console.log("Calling Edge Function:", functionUrl);
      console.log("Supabase URL:", SUPABASE_URL);
      console.log("Session token exists:", !!session.access_token);
      console.log("Anon key exists:", !!anonKey);

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const headers: HeadersInit = {
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
        "apikey": anonKey
      };

      console.log("Request headers:", { 
        hasAuth: !!headers.Authorization, 
        hasApikey: !!headers.apikey,
        contentType: headers["Content-Type"]
      });

      const res = await fetch(functionUrl, {
        method: "POST",
        headers,
        signal: controller.signal,
        mode: "cors", // Explicitly set CORS mode
        credentials: "omit" // Don't send cookies
      }).catch((fetchError) => {
        clearTimeout(timeoutId);
        console.error("Network error calling Edge Function:", fetchError);
        console.error("Error details:", {
          name: fetchError.name,
          message: fetchError.message,
          stack: fetchError.stack
        });
        if (fetchError.name === 'AbortError') {
          throw new Error("Request timed out. Please try again.");
        }
        throw new Error(`Network error: ${fetchError.message}. Please check your internet connection and try again.`);
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Failed to create link token:", res.status, errorData);
        throw new Error(`Failed to create link token: ${res.status} - ${errorData.error || res.statusText}`);
      }

      const { link_token } = await res.json();
      if (!link_token) {
        throw new Error("No link token received from server");
      }
      setLinkToken(link_token);
      setIsLoading(false);
    } catch (error) {
      console.error("Error getting Plaid link token:", error);
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
