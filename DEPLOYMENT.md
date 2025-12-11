# LoanGuard - Deployment Guide

This guide covers deploying your LoanGuard application to Vercel with Supabase as the backend.

## Prerequisites

- [Vercel Account](https://vercel.com/signup) (free tier available)
- [Supabase Account](https://supabase.com/dashboard) (free tier available)
- Git repository (GitHub, GitLab, or Bitbucket)

## Supabase Setup

### 1. Create a New Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in your project details:
   - Name: LoanGuard
   - Database Password: (save this securely)
   - Region: Choose closest to your users
4. Wait for the project to be created (~2 minutes)

### 2. Get Your Supabase Credentials

From your Supabase project dashboard:

1. Go to **Settings** → **API**
2. Copy these values:
   - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - `anon/public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 3. Set Up Database Tables

Run the following SQL in your Supabase SQL Editor (found in the left sidebar):

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('lender', 'borrower')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  borrower_name TEXT NOT NULL,
  loan_amount DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'overdue', 'paid')) DEFAULT 'active',
  risk_score INTEGER NOT NULL DEFAULT 50 CHECK (risk_score >= 0 AND risk_score <= 100),
  amount_paid DECIMAL(15, 2) DEFAULT 0,
  payment_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')) DEFAULT 'low',
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create ESG metrics table (optional)
CREATE TABLE IF NOT EXISTS esg_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  esg_score INTEGER NOT NULL CHECK (esg_score >= 0 AND esg_score <= 100),
  carbon_footprint DECIMAL(10, 2) NOT NULL,
  environmental_score INTEGER NOT NULL CHECK (environmental_score >= 0 AND environmental_score <= 100),
  social_score INTEGER NOT NULL CHECK (social_score >= 0 AND social_score <= 100),
  governance_score INTEGER NOT NULL CHECK (governance_score >= 0 AND governance_score <= 100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_loan_id ON alerts(loan_id);
CREATE INDEX idx_esg_metrics_loan_id ON esg_metrics(loan_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to loans table
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to esg_metrics table
CREATE TRIGGER update_esg_metrics_updated_at BEFORE UPDATE ON esg_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4. Set Up Row Level Security (RLS)

Run this SQL to enable RLS and create policies:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_metrics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Loans policies
CREATE POLICY "Users can view their own loans"
  ON loans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loans"
  ON loans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loans"
  ON loans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loans"
  ON loans FOR DELETE
  USING (auth.uid() = user_id);

-- Alerts policies
CREATE POLICY "Users can view their own alerts"
  ON alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
  ON alerts FOR DELETE
  USING (auth.uid() = user_id);

-- ESG metrics policies
CREATE POLICY "Users can view ESG metrics for their loans"
  ON esg_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loans
      WHERE loans.id = esg_metrics.loan_id
      AND loans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert ESG metrics for their loans"
  ON esg_metrics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM loans
      WHERE loans.id = esg_metrics.loan_id
      AND loans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update ESG metrics for their loans"
  ON esg_metrics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM loans
      WHERE loans.id = esg_metrics.loan_id
      AND loans.user_id = auth.uid()
    )
  );
```

### 5. Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (already enabled by default)
3. Configure email templates if needed (optional)

## Vercel Deployment

### 1. Push Your Code to Git

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit - LoanGuard application"

# Add remote repository
git remote add origin <your-git-repository-url>

# Push to main branch
git push -u origin main
```

### 2. Deploy to Vercel

**Option A: Using Vercel Dashboard**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Configure your project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add the following:
     - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase Project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key

6. Click "Deploy"

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts and add environment variables when asked
```

### 3. Add Environment Variables (if not done during setup)

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Environment Variables"
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key
4. Make sure they apply to **Production**, **Preview**, and **Development**
5. Redeploy if variables were added after initial deployment

## Post-Deployment

### 1. Test Your Application

1. Visit your deployed URL (e.g., `https://loanguard.vercel.app`)
2. Test the signup flow:
   - Go to `/signup`
   - Create a test account
   - Verify you can log in
3. Test core features:
   - Dashboard loads correctly
   - Can create a new loan
   - Charts render properly
   - Alerts work
   - Real-time updates function

### 2. Configure Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (~24-48 hours)

### 3. Set Up Monitoring (Optional)

**Vercel Analytics:**
- Automatically included in Vercel deployments
- View in Dashboard → Your Project → Analytics

**Supabase Monitoring:**
- View database usage in Supabase Dashboard
- Monitor API requests and errors

## Environment Variables Reference

Create a `.env.local` file for local development:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Never commit `.env.local` to Git. It's already in `.gitignore`.

## Troubleshooting

### Build Fails

- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript has no errors: `npm run build` locally

### Environment Variables Not Working

- Ensure variables are prefixed with `NEXT_PUBLIC_`
- Redeploy after adding environment variables
- Check variable names match exactly

### Database Connection Issues

- Verify Supabase URL and key are correct
- Check RLS policies are properly configured
- Ensure tables exist in Supabase

### Authentication Not Working

- Verify Supabase anon key is correct
- Check that email provider is enabled in Supabase
- Confirm redirect URLs are configured in Supabase

### Real-time Features Not Working

- Verify RLS policies allow real-time subscriptions
- Check browser console for WebSocket errors
- Ensure Supabase Realtime is enabled for your tables

## Security Checklist

- ✅ Environment variables are set correctly
- ✅ `.env.local` is in `.gitignore`
- ✅ Row Level Security (RLS) is enabled on all tables
- ✅ RLS policies restrict access to user's own data
- ✅ Supabase anon key is used (never service_role key in frontend)
- ✅ Protected routes check for authentication
- ✅ HTTPS is enabled (automatic with Vercel)

## Updating Your Application

```bash
# Make changes to your code
git add .
git commit -m "Your commit message"
git push origin main

# Vercel will automatically deploy the changes
```

## Cost Considerations

**Vercel Free Tier Includes:**
- Unlimited deployments
- Automatic HTTPS
- 100 GB bandwidth per month
- Serverless function executions

**Supabase Free Tier Includes:**
- 500 MB database storage
- 50,000 monthly active users
- 2 GB bandwidth
- Realtime subscriptions

Both platforms offer generous free tiers suitable for development and small production deployments.

## Support

- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Support**: https://vercel.com/support
- **Supabase Docs**: https://supabase.com/docs
- **shadcn/ui**: https://ui.shadcn.com

## Demo Credentials

For testing purposes, you can create a demo account:
- Email: `lender@loanguard.demo`
- Password: `demo123456`
- Role: Lender

---

**Your LoanGuard application is now live!** 🎉
