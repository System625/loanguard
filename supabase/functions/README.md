# Supabase Edge Functions

This directory contains Supabase Edge Functions for the LoanGuard application.

## Available Functions

### 1. create-link-token
Creates a Plaid Link token for initializing the Plaid Link flow.

**Endpoint:** `/functions/v1/create-link-token`
**Method:** POST
**Auth:** Required (Bearer token)

**Response:**
```json
{
  "link_token": "link-sandbox-xxx"
}
```

### 2. fetch-loans
Exchanges a Plaid public token for an access token and fetches liabilities data.

**Endpoint:** `/functions/v1/fetch-loans`
**Method:** POST
**Auth:** Required (Bearer token)

**Request Body:**
```json
{
  "public_token": "public-sandbox-xxx",
  "user_id": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "loans_imported": 3,
  "loans": [...]
}
```

## Deployment

Deploy all functions:
```bash
supabase functions deploy create-link-token
supabase functions deploy fetch-loans
```

Deploy a specific function:
```bash
supabase functions deploy create-link-token
```

## Environment Variables

Required secrets (set via Supabase CLI or Dashboard):
- `PLAID_CLIENT_ID` - Your Plaid Client ID
- `PLAID_SECRET` - Your Plaid Secret Key
- `PLAID_ENV` - Plaid environment (sandbox, development, or production)

Set secrets:
```bash
supabase secrets set PLAID_CLIENT_ID=your_client_id
supabase secrets set PLAID_SECRET=your_secret
supabase secrets set PLAID_ENV=sandbox
```

## Local Development

Run functions locally:
```bash
supabase functions serve
```

Test locally:
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/create-link-token' \
  --header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  --header 'Content-Type: application/json'
```

## Logs

View function logs:
```bash
supabase functions logs create-link-token
supabase functions logs fetch-loans
```

## Documentation

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Plaid API Docs](https://plaid.com/docs/api/)
