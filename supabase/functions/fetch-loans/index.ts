import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user is authenticated
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { public_token, user_id } = await req.json();

    if (!public_token || !user_id || user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Invalid request" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Exchange public token for access token
    const plaidClientId = Deno.env.get("PLAID_CLIENT_ID");
    const plaidSecret = Deno.env.get("PLAID_SECRET");
    const plaidEnv = Deno.env.get("PLAID_ENV") || "sandbox";

    if (!plaidClientId || !plaidSecret) {
      return new Response(
        JSON.stringify({ error: "Plaid configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const exchangeResponse = await fetch(`https://${plaidEnv}.plaid.com/item/public_token/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: plaidClientId,
        secret: plaidSecret,
        public_token,
      }),
    });

    const exchangeData = await exchangeResponse.json();

    if (!exchangeResponse.ok) {
      console.error("Plaid exchange error:", exchangeData);
      return new Response(
        JSON.stringify({ error: "Failed to exchange token" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = exchangeData.access_token;

    // Fetch liabilities (loans) from Plaid
    const liabilitiesResponse = await fetch(`https://${plaidEnv}.plaid.com/liabilities/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: plaidClientId,
        secret: plaidSecret,
        access_token: accessToken,
      }),
    });

    const liabilitiesData = await liabilitiesResponse.json();

    if (!liabilitiesResponse.ok) {
      console.error("Plaid liabilities error:", liabilitiesData);
      return new Response(
        JSON.stringify({ error: "Failed to fetch liabilities" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Transform and insert loans into database
    const loans = [];
    const liabilities = liabilitiesData.liabilities || {};

    // Process credit cards as loans
    if (liabilities.credit) {
      for (const credit of liabilities.credit) {
        const loanData = {
          user_id: user.id,
          borrower_name: credit.name || "Credit Card",
          loan_amount: credit.last_statement_balance || 0,
          interest_rate: credit.aprs?.[0]?.apr_percentage || 0,
          start_date: new Date().toISOString().split('T')[0],
          due_date: credit.next_payment_due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: credit.is_overdue ? "overdue" : "active",
          risk_score: credit.is_overdue ? 75 : 30,
          amount_paid: 0,
          payment_history: [],
        };

        const { data, error } = await supabaseClient
          .from("loans")
          .insert(loanData)
          .select()
          .single();

        if (!error && data) {
          loans.push(data);
        }
      }
    }

    // Process student loans
    if (liabilities.student) {
      for (const student of liabilities.student) {
        const loanData = {
          user_id: user.id,
          borrower_name: student.loan_name || "Student Loan",
          loan_amount: student.outstanding_balance || 0,
          interest_rate: student.interest_rate_percentage || 0,
          start_date: student.origination_date || new Date().toISOString().split('T')[0],
          due_date: student.next_payment_due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: student.is_overdue ? "overdue" : "active",
          risk_score: student.is_overdue ? 80 : 40,
          amount_paid: 0,
          payment_history: [],
        };

        const { data, error } = await supabaseClient
          .from("loans")
          .insert(loanData)
          .select()
          .single();

        if (!error && data) {
          loans.push(data);
        }
      }
    }

    // Process mortgages
    if (liabilities.mortgage) {
      for (const mortgage of liabilities.mortgage) {
        const loanData = {
          user_id: user.id,
          borrower_name: mortgage.property_address || "Mortgage",
          loan_amount: mortgage.current_balance || 0,
          interest_rate: mortgage.interest_rate_percentage || 0,
          start_date: mortgage.origination_date || new Date().toISOString().split('T')[0],
          due_date: mortgage.next_payment_due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: mortgage.is_overdue ? "overdue" : "active",
          risk_score: mortgage.is_overdue ? 85 : 35,
          amount_paid: 0,
          payment_history: [],
        };

        const { data, error } = await supabaseClient
          .from("loans")
          .insert(loanData)
          .select()
          .single();

        if (!error && data) {
          loans.push(data);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, loans_imported: loans.length, loans }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in fetch-loans:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
