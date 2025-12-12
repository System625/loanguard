# Plaid Integration Setup Guide

This guide will help you set up the Plaid integration for LoanGuard to import loans from connected bank accounts.

## Prerequisites

1. Supabase CLI installed: `npm install -g supabase`
2. Plaid account (sign up at https://plaid.com/developers)

## Step 1: Get Plaid Credentials

1. Sign up for a Plaid account at https://dashboard.plaid.com/signup
2. Once logged in, go to **Team Settings** → **Keys**
3. Copy your:
   - Client ID
   - Sandbox Secret (for development)
   - Development Secret (for production)

## Step 2: Configure Supabase Environment Variables

You need to add Plaid credentials to your Supabase Edge Functions:

### Using Supabase Dashboard:

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** → **Settings**
3. Add the following secrets:
   - `PLAID_CLIENT_ID`: Your Plaid Client ID
   - `PLAID_SECRET`: Your Plaid Secret (sandbox or development)
   - `PLAID_ENV`: `sandbox` (for testing) or `development` (for production)

### Using Supabase CLI:

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets
supabase secrets set PLAID_CLIENT_ID=your_client_id
supabase secrets set PLAID_SECRET=your_plaid_secret
supabase secrets set PLAID_ENV=sandbox
```

## Step 3: Deploy Edge Functions

Deploy the Plaid integration Edge Functions to Supabase:

```bash
# Deploy create-link-token function
supabase functions deploy create-link-token

# Deploy fetch-loans function
supabase functions deploy fetch-loans
```

## Step 4: Test the Integration

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Navigate to the dashboard at http://localhost:3000/dashboard

3. Click the "Connect Loan Apps" button

4. Follow the Plaid Link flow to connect a test account

5. In **Sandbox mode**, you can use test credentials:
   - Username: `user_good`
   - Password: `pass_good`

## Plaid Products Used

The integration uses the **Liabilities** product to fetch:
- Credit cards
- Student loans
- Mortgages
- Auto loans

## How It Works

1. **User clicks "Connect Loan Apps"**
   - Frontend calls `create-link-token` Edge Function
   - Edge Function creates a Plaid Link token
   - Plaid Link modal opens for user authentication

2. **User connects their bank account**
   - User authenticates with their financial institution
   - Plaid returns a public token

3. **Frontend exchanges token and fetches loans**
   - Frontend calls `fetch-loans` Edge Function with public token
   - Edge Function exchanges public token for access token
   - Edge Function fetches liabilities data from Plaid
   - Edge Function transforms and stores loans in Supabase

4. **Loans appear in dashboard**
   - User sees imported loans in their portfolio
   - Real-time updates reflect new loans

## Troubleshooting

### CORS Errors
If you see CORS errors, ensure:
- Edge Functions are deployed correctly
- Your Supabase project URL is correct in `.env.local`

### 401 Unauthorized
If you get unauthorized errors:
- Check that you're logged in
- Verify Supabase environment variables are set
- Check that Edge Functions have proper authentication

### Plaid API Errors
If Plaid returns errors:
- Verify your Plaid credentials are correct
- Ensure you're using the right environment (sandbox/development)
- Check Plaid dashboard for API logs

## Environment Variables Reference

### Frontend (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Edge Functions (Secrets)
```bash
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox  # or 'development' for production
```

## Plaid Environments

- **Sandbox**: Free, uses test data, perfect for development
- **Development**: Free for limited use, connects to real banks
- **Production**: Paid, for live applications

## Security Notes

- Never commit Plaid credentials to version control
- Use Supabase secrets for Edge Function environment variables
- Plaid access tokens are stored securely in Edge Functions, not in the frontend
- All requests to Edge Functions require authentication

## Next Steps

After setup:
1. Test with Plaid Sandbox credentials
2. Customize loan data transformation in `fetch-loans/index.ts`
3. Add error handling and retry logic
4. Consider storing Plaid access tokens for recurring updates
5. Move to Development/Production environment when ready

## Resources

- [Plaid Documentation](https://plaid.com/docs/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Plaid Sandbox Guide](https://plaid.com/docs/sandbox/)
