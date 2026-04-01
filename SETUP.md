# PayrollPal Malta — Setup Guide

Complete setup instructions for local development and production deployment.

## 📦 Prerequisites

- Node.js 18+ (we use Node 24)
- PostgreSQL database (Supabase recommended)
- Stripe account (for payments)
- OpenAI API key (for AI calculations)

## 🚀 Quick Start (Local)

### 1. Clone and Install

```bash
cd ~/Sites/visitflow
npm ci
```

### 2. Environment Configuration

Copy `.env.local.example` to `.env.local` and fill in the values:

```bash
cp .env.local.example .env.local
```

**Required variables:**

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `DATABASE_URL` | PostgreSQL connection string | Supabase → Project Settings → Database |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase → Project Settings → General |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (keep secret) | Supabase → Project Settings → API |
| `STRIPE_SECRET_KEY` | Stripe secret key | Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Stripe → Developers → Webhooks |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Stripe Dashboard |
| `STRIPE_PRICE_BASIC` | Stripe price ID for BASIC tier | Stripe → Products |
| `STRIPE_PRICE_PRO` | Stripe price ID for PRO tier | Stripe → Products |
| `STRIPE_PRICE_ENTERPRISE` | Stripe price ID for ENTERPRISE tier | Stripe → Products |
| `OPENAI_API_KEY` | OpenAI API key | OpenAI Platform |
| `NEXT_PUBLIC_APP_URL` | Your app URL | e.g., http://localhost:3000 |

### 3. Create Stripe Products

Log into Stripe Dashboard → Products → Create:

1. **PayrollPal BASIC** — Price: ~€29/month
2. **PayrollPal PRO** — Price: ~€79/month
3. **PayrollPal ENTERPRISE** — Custom pricing (or set high amount)

Copy the Price IDs (look like `price_1234567890`) into `.env.local`.

### 4. Set Up Supabase Database

#### Option A: Via Prisma Migrate (Recommended)

```bash
npx prisma migrate dev --name init
```

This will:
- Create tables based on `prisma/schema.prisma`
- Generate Prisma client

#### Option B: Manual SQL

```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Then run the SQL generated from: npx prisma migrate resolve --applied 0
```

### 5. Run Database Seeding (Optional)

If you have initial data (tax brackets, social security rates), create a seed file:

```bash
npx prisma db seed
```

### 6. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

### 7. Set Up Stripe Webhook (Local Testing)

Install Stripe CLI: https://stripe.com/docs/stripe-cli

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will output a webhook secret. Set `STRIPE_WEBHOOK_SECRET` to that value.

### 8. Test the Flow

1. Go to http://localhost:3000/signup → create account
2. You'll be redirected to dashboard (no employees yet)
3. Add an employee (`/dashboard/employees/new`)
4. Create a payroll run (`/dashboard/payroll`)
5. Click "Calculate" to run AI payroll engine
6. If Stripe configured, upgrade subscription via checkout

## 🚢 Deployment (Vercel + Supabase)

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/visitflow.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Import project in Vercel
2. Set environment variables (same as `.env.local`)
3. Deploy

### 3. Set Up Supabase Production

1. Create new Supabase project (or use existing)
2. Run migrations in production:

```bash
npx prisma migrate deploy
```

3. Configure Auth providers (email/password, Google, GitHub)
4. Set up CORS to allow your Vercel domain

### 4. Configure Stripe Webhook for Production

```bash
stripe listen --forward-to your-domain.vercel.app/api/stripe/webhook
```

Update webhook endpoint in Stripe dashboard to use production secret.

## 📁 Project Structure

```
visitflow/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Supabase callbacks (optional)
│   │   ├── dashboard/    # Dashboard data endpoints
│   │   ├── payroll/      # Payroll calculation/submit
│   │   ├── checkout/     # Stripe checkout session
│   │   └── stripe/       # Stripe webhook
│   ├── dashboard/        # Dashboard pages
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── layout.tsx        # Root layout
├── components/ui/        # Shadcn UI components
├── lib/                  # Utilities (prisma, supabase, stripe, openai)
├── prisma/               # Database schema
└── middleware.ts         # Auth middleware
```

## 🔧 Common Issues

### "Environment variable not found: DATABASE_URL"
- Ensure `.env.local` exists in project root
- Check variable name spelling
- Restart dev server after adding

### "No rows in table for user"
- After signup, you need to create a Company record manually or implement onboarding flow
- Currently: User → Company is 1:1 but not auto-created
- **Fix:** Run in Prisma Studio or create an API endpoint to create company on first login

### Stripe webhook returns 404
- Ensure webhook endpoint is registered in Stripe dashboard
- For local, use Stripe CLI forwarding
- In production, set endpoint to `https://your-domain.vercel.app/api/stripe/webhook`

### "Module not found: @supabase/auth-helpers-react"
- Run `npm install @supabase/auth-helpers-react`
- If still failing, check `node_modules` and `tsconfig.json` paths

### TypeScript errors after adding Shadcn components
- Ensure you've installed required Radix UI dependencies
- Common: `@radix-ui/react-select`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-slot`
- Check Shadcn docs: https://ui.shadcn.com/docs/installation

## 🧪 Testing

### Manual Testing Checklist

- [ ] Signup → login → logout
- [ ] Create company (via Prisma Studio or API)
- [ ] Add employee
- [ ] Create payroll run
- [ ] Calculate payroll (AI)
- [ ] Submit payroll (FS3 reference generated)
- [ ] Stripe checkout (upgrade subscription)
- [ ] Subscription enforcement (should block if inactive)

### Run Tests (Future)

```bash
npm test
```

## 📝 License

Proprietary — All rights reserved.

---

**Need help?** Check `README.md` for architecture overview or `COMPLETION.md` for build status.
