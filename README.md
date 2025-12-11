# LoanGuard 🛡️

A modern, full-stack loan monitoring and risk management platform built with Next.js 14+, TypeScript, Supabase, and shadcn/ui.

![LoanGuard](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Enabled-green?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

## Features ✨

### Core Functionality
- **📊 Portfolio Dashboard** - Track all loans with interactive charts and real-time statistics
- **⚠️ Risk Assessment** - Automated risk scoring based on loan parameters and payment history
- **🔔 Smart Alerts** - Real-time notifications for overdue payments and high-risk loans
- **💰 Payment Tracking** - Record and monitor payment history with detailed analytics
- **🌱 ESG Metrics** - Track environmental, social, and governance performance
- **📈 Data Visualization** - Interactive charts using Recharts (line, pie, and bar charts)

### Technical Features
- **🔐 Secure Authentication** - Email/password auth with Supabase and protected routes
- **⚡ Real-time Updates** - Live data synchronization using Supabase subscriptions
- **📱 Responsive Design** - Mobile-first approach with Tailwind CSS
- **🎨 Modern UI** - Beautiful components from shadcn/ui
- **🛡️ Type Safety** - Full TypeScript coverage with strict mode
- **✅ Form Validation** - Zod schemas for robust input validation
- **🌐 Server & Client Components** - Optimized with Next.js App Router
- **🔄 Error Handling** - Global error boundaries and toast notifications

## Tech Stack 🚀

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Charts**: Recharts
- **Icons**: Lucide React
- **Form Validation**: Zod
- **Notifications**: Sonner

## Getting Started 🏁

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)
- Git

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd loanguard
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API

4. **Set up the database**

Run the SQL scripts from [DEPLOYMENT.md](./DEPLOYMENT.md) in your Supabase SQL Editor to create:
- Tables (profiles, loans, alerts, esg_metrics)
- Indexes
- Row Level Security (RLS) policies
- Triggers

5. **Run the development server**

```bash
npm run dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure 📁

```
loanguard/
├── app/
│   ├── (auth)/              # Authentication routes
│   │   ├── login/           # Login page
│   │   └── signup/          # Signup page
│   ├── (protected)/         # Protected routes
│   │   ├── dashboard/       # Main dashboard
│   │   └── loans/[id]/      # Loan details pages
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Landing page
│   ├── error.tsx            # Global error boundary
│   └── not-found.tsx        # 404 page
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── Alerts.tsx           # Alerts panel component
│   ├── DashboardCharts.tsx  # Charts component
│   ├── NewLoanModal.tsx     # Create loan modal
│   └── SupabaseProvider.tsx # Supabase context provider
├── lib/
│   └── supabaseClient.ts    # Supabase client config
└── .env.local               # Environment variables (create this)
```

## Key Routes 🗺️

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Landing page | Public |
| `/login` | User login | Public |
| `/signup` | User registration | Public |
| `/dashboard` | Main dashboard | Protected |
| `/loans/[id]` | Loan details | Protected |

## Database Schema 🗄️

### Tables

1. **profiles** - User profiles with roles (lender/borrower)
2. **loans** - Loan records with risk scores and payment tracking
3. **alerts** - System alerts and notifications
4. **esg_metrics** - ESG performance metrics (optional)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete SQL schema.

## Development 💻

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with Next.js recommended rules
- **Path Aliases**: Use `@/` for absolute imports

### Adding New Components

```bash
# Add a new shadcn/ui component
npx shadcn@latest add <component-name>
```

## Deployment 🚀

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Vercel.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

**Required Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Features Overview 📋

### Dashboard
- Summary cards (Total Loans, Total Amount, Overdue, Average Risk)
- Loans table with status tabs
- Interactive charts (Line, Pie, Bar)
- Create new loan modal
- Real-time updates

### Loan Details
- Full loan information display
- Payment history table
- Add payment functionality
- Update loan status
- Delete loan with confirmation
- Alerts accordion
- ESG metrics (if available)

### Alerts System
- Slide-out panel with all alerts
- Real-time notifications
- Mark as read/unread
- Delete alerts
- Navigate to related loans

### ESG Metrics
- Overall ESG score
- Individual scores (Environmental, Social, Governance)
- Carbon footprint tracking
- Add custom or mock data

## Security 🔒

- ✅ Server-side authentication checks
- ✅ Row Level Security (RLS) on all tables
- ✅ Protected API routes
- ✅ Environment variables for secrets
- ✅ HTTPS in production
- ✅ Input validation with Zod
- ✅ XSS protection with React

## Performance ⚡

- Server Components for reduced bundle size
- Optimized images with Next.js Image component
- Real-time subscriptions only where needed
- Efficient database queries
- Code splitting and lazy loading

## Browser Support 🌐

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing 🤝

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License.

## Support 💬

For support, please open an issue in the GitHub repository.

## Acknowledgments 🙏

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend platform
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Vercel](https://vercel.com/) - Deployment platform
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

---

Built with ❤️ for better loan management
