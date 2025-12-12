"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePlaidLink } from "react-plaid-link";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ConnectPlaid() {
  const [linkToken, setLinkToken] = useState<string | null>(null);

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

        const res = await fetch("https://pwtfmnjonwntbkjooxkl.supabase.co/functions/v1/fetch-loans", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ public_token, user_id: data.user.id })
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch loans: ${res.status}`);
        }

        toast.success("Loans imported — refresh to see them!");
      } catch (error) {
        console.error("Error fetching loans:", error);
        toast.error("Failed to import loans. Please try again.");
      }
    },
  });

  const getToken = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error("Please log in to connect your bank account");
        return;
      }

      const res = await fetch("https://pwtfmnjonwntbkjooxkl.supabase.co/functions/v1/create-link-token", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to create link token: ${res.status}`);
      }

      const { link_token } = await res.json();
      setLinkToken(link_token);
    } catch (error) {
      console.error("Error getting Plaid link token:", error);
      toast.error("Failed to initialize bank connection");
    }
  };

  return (
    <Button onClick={linkToken ? open : getToken} disabled={!!linkToken && !ready}>
      {linkToken ? (ready ? "Connect Bank" : "Loading…") : "Connect Loan Apps"}
    </Button>
  );
}
