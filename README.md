# PayrollPal Malta — AI-Powered Payroll SaaS

Fully automated payroll, tax, and social security compliance for Maltese SMEs.

## ✨ Features

- **AI calculations** using Malta tax brackets & MSSS rules
- **Auto-submissions** to Commissioner for Revenue (FS3/FS5)
- **Natural language**: "What if I give a €2K bonus?" – AI predicts impact
- **Multilingual**: Maltese + English UI (Maltese in progress)
- **Compliance-first**: audit logs, regulatory-ready
- **One-click payroll runs**: draft → calculate → submit
- **Cookie-based auth**: Secure Supabase session management

## 🧱 Tech Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Prisma ORM + PostgreSQL (Supabase)
- Supabase Auth (email/password + OAuth)
- Stripe (subscriptions & payments)
- OpenAI GPT-4o (payroll calculations & natural language)
- Shadcn UI components (Button, Card, Table, etc.)

## 📦 Complete Project Structure

```
visitflow/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── callback/route.ts    # OAuth callback
│   │   │   └── signup/route.ts      # User registration
│   │   ├── dashboard/
│   │   │   ├── me/route.ts          # Current user + company
│   │   │   ├── employees/route.ts   # CRUD employees (auth-derived company)
│   │   │   ├── payroll/route.ts     # List/create payroll runs
│   │   │   ├── payroll/[id]/route.ts  # Get run + calculate
│   │   │   └── stats/route.ts       # Dashboard aggregates
│   │   ├── payroll/
│   │   │   ├── ask/route.ts         # Natural language queries
│   │   │   ├── calculate/route.ts   # AI calculation engine
│   │   │   └── submit/route.ts      # Mark as submitted
│   ├── dashboard/
│   │   ├── layout.tsx               # Protected dashboard layout
│   │   ├── page.tsx                 # Dashboard home (stats)
│   │   ├── employees/
│   │   │   ├── page.tsx             # Employee list
│   │   │   └── new/page.tsx         # Add employee form
│   │   └── payroll/
│   │       ├── page.tsx             # Payroll runs list
│   │       └── [id]/page.tsx        # Run details + recalc
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── layout.tsx
│   └── providers.tsx                # Supabase + Stripe providers
├── components/
│   ├── ui/                          # Shadcn components (button.tsx, etc.)
│   └── header.tsx                   # Dashboard header (future)
├── lib/
│   ├── openai.ts                    # GPT-4o client + generateJSON
│   ├── prisma.ts                    # Prisma client singleton
│   ├── stripe.ts                    # Stripe client
│   └── supabase.ts                  # Supabase client (server)
├── prisma/
│   └── schema.prisma                # Full Malta payroll schema
├── middleware.ts                    # Supabase auth middleware
├── .env.local.example               # Environment template
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🚀 Getting Started (Dev)

1. **Install dependencies**  
   ```bash
   cd ~/Sites/visitflow
   npm ci
   ```

2. **Set up environment**  
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in:
   - `DATABASE_URL` (from Supabase → Settings → Database)
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for server-side user lookups)
   - `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `OPENAI_API_KEY` (OpenRouter or OpenAI)
   - `NEXT_PUBLIC_APP_URL` (http://localhost:3000 for dev)

3. **Configure Supabase Auth**  
   - Enable Email provider (magic link or password)
   - Optionally enable Google/GitHub OAuth
   - Set Site URL to `http://localhost:3000`
   - Add redirect URL: `http://localhost:3000/api/auth/callback`

4. **Create and migrate database**  
   ```bash
   npx prisma migrate dev --name init
   # Optional: seed Malta tax brackets and MSSS rates (see below)
   ```

5. **Run development server**  
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 → Sign up → Create company → Add employees → Run payroll.

## 🔒 Malta Compliance Implementation

### Tax Brackets & Social Security
The `prisma/schema.prisma` includes models for:
- `TaxBracket` (year, minIncome, maxIncome, rate)
- `SocialSecurityRate` (year, employeeRate, employerRate, maxWeeklyEarning)

**Populate initial data** (example):
```sql
INSERT INTO "TaxBracket" (year, "minIncome", "maxIncome", rate) VALUES
(2025, 0, 9100, 0.15),
(2025, 9101, 14500, 0.25),
(2025, 14501, 19500, 0.35),
(2025, 19501, 60000, 0.40);
```

```sql
INSERT INTO "SocialSecurityRate" (year, "employeeRate", "employerRate", "maxWeeklyEarning") VALUES
(2025, 0.10, 0.15, 240.19);
```

### FS3/FS5 Submissions
`/api/payroll/submit` generates a simulated `submissionReference` (e.g., `FS3-20260330-ABC123`). Production implementation should integrate with Malta Commissioner for Revenue API or generate XML reports.

### Audit Trail
`AuditEvent` model logs all sensitive actions (payroll runs, employee edits, submissions). Currently basic; extend middleware to log every API call.

## 📈 Roadmap to Production

### Phase 1: MVP Polish (Week 1)
- [x] Core API + database schema
- [x] Authentication + protected routes
- [ ] Install all Shadcn UI components (Card, Table, Form, Dialog)
- [ ] Build polished employee management UI
- [ ] Build payroll run creation UI (date pickers, confirmation)
- [ ] Add loading/error states to all API calls
- [ ] Implement Stripe subscription enforcement middleware

### Phase 2: Stripe & Billing (Week 2)
- [ ] Create Stripe products & prices (€2/employee/mo)
- [ ] Implement checkout flow (`/api/checkout`)
- [ ] Handle Stripe webhooks (`/api/webhooks/stripe`) for subscription updates
- [ ] Billing dashboard (current plan, usage, invoices)
- [ ] Add `stripeCustomerId` to Company model

### Phase 3: Bank Integrations (Week 3)
- [ ] APS Bank payment initiation API (salary transfers)
- [ ] BOV business banking integration (optional)
- [ ] Generate payment files (SEPA XML)
- [ ] Reconciliation status in payroll runs

### Phase 4: Advanced Features (Week 4)
- [ ] Natural language query UI (chat interface)
- [ ] Maltese language translations
- [ ] PDF payslip generation
- [ ] Bulk employee import (CSV)
- [ ] Year-end bonus calculations (13th month)
- [ ] Public API for accountants (partner access)

### Phase 5: Compliance & Scale
- [ ] Annual tax bracket update automation
- [ ] Multi-company support (accountant view)
- [ ] SSO for enterprise clients
- [ ] GDPR data export/delete endpoints
- [ ] PENet integration (Malta pension)

## 🔧 Development Notes

### Authentication Flow
- **Login/Signup:** `/login`, `/signup` pages use Supabase Auth helpers.
- **Session:** Supabase stores session cookie (`sb-access-token`).
- **Server-side verify:** API routes use `@supabase/supabase-js` client with cookie headers to get user session, then look up user's company in Prisma. **Do not use `Authorization: Bearer` header** — use cookie-based session.
- **Client-side:** `useUser()` from `@supabase/auth-helpers-react`.

### AI Calculation (`/api/payroll/calculate`)
Body:
```json
{
  "companyId": "uuid",
  "employeeId": "uuid",
  "periodStart": "2025-01-01",
  "periodEnd": "2025-01-31",
  "salaryGross": 36000,
  "benefits": [],
  "oneTimeAdjustments": []
}
```
Returns: `{ grossPeriod, tax, socialSecurityEmployee, socialSecurityEmployer, netPay, totalCost, notes }`

### Natural Language (`/api/payroll/ask`)
Body:
```json
{
  "question": "What if I give a €2000 bonus to employee X?",
  "companyId": "uuid",
  "employeeId": "uuid" (optional)
}
```
Returns: `{ answer, calculation, confidence, needsHumanReview }`

### Database Migrations
After schema changes:
```bash
npx prisma migrate dev --name descriptive_name
npx prisma generate
```

Never edit `schema.prisma` without migrating.

### Stripe Integration
- Prices defined in Stripe Dashboard → products.
- Checkout creates `StripeCheckoutSession` record (if needed).
- Webhook handler (`/api/webhooks/stripe`) updates `Company.subscriptionStatus`.
- Protect paid routes with middleware checking subscription.

## 🧪 Testing

Not implemented yet. Recommended:
- Unit: `lib/payrollCalculator.test.ts` (Vitest)
- Integration: API route tests (Supertest + isolated DB)
- E2E: Playwright for payroll flow

## 📦 Deployment

### Vercel + Supabase (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Connect Supabase (database already exists)
5. Deploy

### Production Checklist
- [ ] Enable Supabase Auth email confirmations
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Configure Stripe webhook endpoint
- [ ] Add rate limiting (e.g., Upstash Redis)
- [ ] Set up error monitoring (Sentry)
- [ ] Enable Vercel logs + analytics
- [ ] Database backups (Supabase automatic)

## 📄 License
Proprietary — all rights reserved.

---

**Status:** Backend API complete, auth refactored to cookie-based sessions, context overflow fixed in AI query endpoint. UI needs Shadcn components expansion and polish. Stripe webhooks pending. Bank integrations planned.

**Last updated:** 2026-03-30
