# Deployment Guide — PayrollPal Malta

**Target:** Vercel (frontend + API) + Supabase (PostgreSQL + Auth)

**Estimated time:** 30-60 minutes (excluding DNS propagation)

---

## Prerequisites

- GitHub account (public or private repo)
- Vercel account (free tier works)
- Supabase account (free tier → production later)
- Stripe account (test mode first)
- OpenAI API key (or OpenRouter)

---

## 1. Prepare Repository

```bash
cd ~/Sites/visitflow
git init
git add .
git commit -m "Initial commit — PayrollPal Malta MVP"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/visitflow.git
git push -u origin main
```

Make sure `.env.local` is **not** committed (`.gitignore` includes it).

---

## 2. Supabase Setup

### 2.1 Create Project
1. Go to https://supabase.com → Dashboard → New Project
2. Name: `visitflow-malta`
3. Database: PostgreSQL, region choose closest to Malta (London or Frankfurt)
4. Password: strong password (save it!)
5. Wait for provisioning (~2 min)

### 2.2 Get Credentials
In Project Settings → **API**:
- `NEXT_PUBLIC_SUPABASE_URL` → **Project URL**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → **anon public** key
- `SUPABASE_SERVICE_ROLE_KEY` → **service_role** key (keep secret!)

Copy these to your `.env.local` file.

### 2.3 Enable Auth Providers
In Authentication → **Providers**:
- **Email** — Enable (magic link or password, choose password for now)
- **Google** — Optional but recommended
- **GitHub** — Optional

Set **Site URL** to your live Vercel domain: `https://visitflow-lovat.vercel.app` (use `http://localhost:3000` only for local development).
Add **Redirect URLs**:
- `https://visitflow-lovat.vercel.app/auth/callback`
- `https://visitflow-lovat.vercel.app/auth/confirm`
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/auth/confirm`

Save.

### 2.4 Create Database Tables
Run Prisma migrations against Supabase:

```bash
npx prisma migrate deploy
```

That will apply all migrations to the Supabase database. Alternatively:
```bash
npx prisma db push  # for quick prototyping
```

### 2.5 Seed Malta Tax Data

Open Supabase SQL Editor (in Dashboard) and run:

```sql
-- Tax brackets 2025 (example; update annually)
INSERT INTO "TaxBracket" (year, "minIncome", "maxIncome", rate) VALUES
(2025, 0, 9100, 0.15),
(2025, 9101, 14500, 0.25),
(2025, 14501, 19500, 0.35),
(2025, 19501, 60000, 0.40);

-- Social Security (MSSS) 2025
INSERT INTO "SocialSecurityRate" (year, "employeeRate", "employerRate", "maxWeeklyEarning") VALUES
(2025, 0.10, 0.15, 240.19);
```

Repeat for previous years if needed.

---

## 3. Stripe Setup

### 3.1 Create Account & Test Mode
1. Go to https://stripe.com → Dashboard
2. Activate account (may need email verification)
3. Switch to **Test mode** (top right toggle)

### 3.2 Get API Keys
In Developers → API keys:
- `STRIPE_SECRET_KEY` → starts with `sk_test_`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → starts with `pk_test_`

Copy to `.env.local`.

### 3.3 Create Product & Price
In Products → Add product:
- Name: "PayrollPal Malta"
- Description: "AI-powered payroll for Maltese SMEs"
- Create price: `€2` per employee/month (recurring)
- Save → copy `price_id` (e.g., `price_1...`)

We'll store `STRIPE_PRICE_ID` in env later (or hardcode for now).

---

## 4. OpenAI / OpenRouter Setup

### Option A: OpenAI (recommended if you have credit)
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. `OPENAI_API_KEY=sk-...` in `.env.local`
4. In `lib/openai.ts`, ensure model is `gpt-4o` (or `gpt-4o-mini` for cheaper)

### Option B: OpenRouter (fallback, free tier)
1. Go to https://openrouter.ai → API Keys
2. Create key → copy
3. `OPENROUTER_API_KEY=sk-or-...` in `.env.local`
4. In `lib/openai.ts`, use `baseURL: 'https://openrouter.ai/api/v1'` and `model: 'openai/gpt-4o'` (or free model)

---

## 5. Vercel Deployment

### 5.1 Import Project
1. Go to https://vercel.com → New Project
2. Import from GitHub → select `visitflow` repo
3. Framework: Next.js (auto-detected)

### 5.2 Environment Variables
Add all from `.env.local`:
```
DATABASE_URL=postgresql://... (from Supabase)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=https://visitflow-lovat.vercel.app
```

`NEXT_PUBLIC_APP_URL` is an optional fallback for server-generated URLs. Client auth flows use the browser origin first, and server routes prefer the live Vercel host.

### 5.3 Build Settings
- Build command: `npm run build` (default)
- Output directory: `.next` (default)
- Install command: `npm ci` (default)
- No root directory changes

Click **Deploy**.

### 5.4 Post-Deploy Verification
1. Wait for build to finish.
2. Open your Vercel URL.
3. Should see login page (or signup). Test signup flow.
4. Check Vercel Functions logs if errors appear.

---

## 6. Domain & HTTPS

For the current deployment, keep every route on the same Vercel host.

### 6.1 Update Auth Redirects
Back to Supabase Auth → keep the live domain and callback on `visitflow-lovat.vercel.app`:
- **Site URL**: `https://visitflow-lovat.vercel.app`
- **Redirect URLs**: `https://visitflow-lovat.vercel.app/auth/callback`, `https://visitflow-lovat.vercel.app/auth/confirm`
- **Email redirect target in app**: use `/auth/callback` for Google OAuth, signup confirmation, and password reset. `/auth/confirm` remains a compatibility alias.

---

## 7. Production Checklist

### Before Opening to Public
- [ ] **Supabase Auth:** Enable email confirmations? For MVP, disable `"Enable email confirmations"` to allow instant login (or keep if you want verification).
- [ ] **Stripe Webhooks:** Configure endpoint in Stripe Dashboard → Developers → Webhooks:
  - URL: `https://your-app.vercel.app/api/webhooks/stripe`
  - Events: `customer.subscription.updated`, `invoice.paid`, `invoice.payment_failed`
  - Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET` in Vercel env
- [ ] **Stripe Subscription Enforcement:** Implement middleware check (TODO) to block `/dashboard/*` if `Company.subscriptionStatus !== 'active'`.
- [ ] **Database Backups:** Supabase enables daily backups on paid tier. Free tier → manual export (`pg_dump`) weekly.
- [ ] **Error Monitoring:** Add Sentry (free tier) to track runtime errors.
- [ ] **Rate Limiting:** Implement Upstash Redis or similar to prevent abuse of API routes.
- [ ] **Environment Variables:** Double-check all present in Vercel dashboard (Production environment).
- [ ] **Prisma Migrate:** Use `prisma migrate deploy` in production (CI/CD). Do not use `db push` in production.

---

## 8. Continuous Integration (Optional)

### GitHub Actions for Deploy Preview
Create `.github/workflows/ci.yml` to run `npm ci && npm run build` on PRs.

### Automated Deploys
Vercel Git integration → automatic deploy on `main` push. Good for MVP.

---

## 9. Monitoring & Maintenance

### Vercel Analytics
Shipped automatically → view in Vercel dashboard: traffic, response times, functions invocations.

### Supabase Dashboard
- Database size, connection counts
- Auth → sign-in metrics
- Enable logs (paid)

### Stripe Dashboard
- Subscription status, MRR, churn
- Failed payments → dunning management

---

## Common Issues & Troubleshooting

### "P3005: Applied migrations are not up to date"
Run: `npx prisma migrate dev` locally, commit new migration, redeploy.

### "Supabase auth cookie not found"
Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in Vercel env. Check that you're calling `supabase.auth.getUser()` on server with cookie header.

### "OpenAI context overflow"
$/api/payroll/ask truncates tax brackets to 5 items. If still overflow, reduce further or switch to `gpt-4o-mini` (cheaper, still 128K context).

### "Stripe webhook signature verification failed"
Make sure `STRIPE_WEBHOOK_SECRET` in Vercel matches the one in Stripe webhook config. If using test secret in dev, separate from prod.

### "Database connection refused"
Check `DATABASE_URL` format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require` (Supabase requires SSL). Use the connection string from Supabase → Settings → Database → Connection string.

---

## Rollback Plan

If deployment breaks:
1. In Vercel → Deployments → select previous working deployment → Promote to Production.
2. Keep migrations atomic; never roll back DB schema without plan.
3. For Stripe changes → use test mode until fully validated.

---

**Happy deploying!** 🚀
