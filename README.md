# PayrollPal Malta — AI-Powered Payroll SaaS

Fully automated payroll, tax, and social security compliance for Maltese SMEs.

## ✨ Features

- **AI calculations** using Malta tax brackets & MSSS rules (GPT-4o)
- **Auto-submissions** to Commissioner for Revenue (FS3/FS5)
- **Natural language queries**: "What if I give a €2K bonus?"
- **Subscription billing** via Stripe (BASIC, PRO, ENTERPRISE)
- **Multilingual**: Maltese + English UI (framework ready)
- **Compliance-first**: audit logs, regulatory-ready
- **One-click payroll runs**: draft → calculate → submit

## 🧱 Tech Stack

- **Frontend**: Next.js 14 App Router + TypeScript + Tailwind CSS + Shadcn UI
- **Backend**: Next.js API routes (serverless)
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth (email/password + OAuth)
- **Payments**: Stripe Checkout + Webhooks
- **AI**: OpenAI GPT-4o (streaming JSON)

## 📦 Project Structure

```
visitflow/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── callback/route.ts    # Supabase OAuth callback
│   │   │   └── signup/route.ts      # Email signup
│   │   ├── dashboard/
│   │   │   ├── employees/route.ts
│   │   │   ├── me/route.ts
│   │   │   ├── payroll/route.ts
│   │   │   ├── payroll/[id]/route.ts
│   │   │   └── stats/route.ts
│   │   ├── payroll/
│   │   │   ├── calculate/route.ts   # AI calculation engine
│   │   │   ├── ask/route.ts         # Natural language queries
│   │   │   └── submit/route.ts
│   │   └── checkout/route.ts        # Stripe checkout session
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── employees/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   └── payroll/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── table.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       └── badge.tsx
├── lib/
│   ├── prisma.ts
│   ├── supabase.ts
│   ├── stripe.ts
│   └── openai.ts
├── prisma/
│   └── schema.prisma
├── middleware.ts
├── .env.local.example
├── README.md
└── tailwind.config.ts
```

## 🚀 Getting Started (Dev)

1. **Clone + install**
   ```bash
   cd ~/Sites/visitflow
   npm ci
   ```

2. **Set up environment**
   Copy `.env.local.example` → `.env.local` and fill in:
   - `DATABASE_URL` (Supabase PostgreSQL connection string)
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_PRICE_BASIC`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_ENTERPRISE`
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (optional fallback app URL for server-generated links; the browser origin is preferred for auth flows, and the live Vercel host is preferred on the server)

3. **Database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Supabase setup**
   - Enable Auth (email/password + any OAuth providers)
   - Create a table `users` linking email to company (our Prisma schema handles this)
   - Configure CORS to allow your domain

5. **Stripe setup**
   - Create products: PayrollPal BASIC, PRO, ENTERPRISE
   - Note the Price IDs and set in `.env.local`
   - Set up webhook endpoint to `/api/stripe/webhook` for `customer.subscription.*` events
   - In Stripe dashboard, add your dev domain to allowed domains for Checkout

6. **Run**
   ```bash
   npm run dev
   # open http://localhost:3000
   ```

## 🔒 Malta Compliance

- **Tax brackets**: `TaxBracket` model (annual update required)
- **Social Security**: `SocialSecurityRate` model (MSSS contributions)
- **Submissions**: Simulated FS3/FS5 generation (future: direct Commissioner API)
- **Audit trail**: `AuditEvent` records all actions
- **Bank payments**: Future integration with APS/BOV for salary disbursement

## 📈 Subscription Tiers

| Tier    | Price (monthly) | Features                                |
|---------|-----------------|----------------------------------------|
| FREE    | €0              | Up to 5 employees, 1 payroll/month, no AI optimizations |
| BASIC   | ~€29            | Up to 20 employees, unlimited payrolls, basic AI queries |
| PRO     | ~€79            | Up to 100 employees, advanced AI optimizations, natural language, FS3/FS5 submission |
| ENTERPRISE | Custom       | Unlimited employees, dedicated support, bank integrations, SLA |

## 🔧 Development Notes

### Authentication
- Uses Supabase Auth with cookie-based sessions.
- Server routes validate session via `@supabase/supabase-js` client reading cookies.
- Client uses `@supabase/auth-helpers-react` for session management.

### Middleware
- Redirects unauthenticated users from `/dashboard/*` to `/login`.
- Enforces active subscription (status `ACTIVE` or `TRIALING`) on payroll write APIs (`POST/PUT/DELETE` on `/api/payroll/*` and `/api/dashboard/payroll/*`).
- Returns HTTP 402 (Payment Required) if subscription inactive.

### Payroll Calculation
- Shared logic `lib/payrollCalculator.ts` used by `/api/payroll/calculate`.
- AI-powered tax breakdown using Malta brackets + MSSS rates.
- Results stored in `PayrollEntry` and `Contribution` tables.

### Stripe Integration
- Checkout Session created at `/api/checkout`.
- Webhook `/api/stripe/webhook` syncs subscription status to `Company` record.
- Company tiers stored in `subscriptionTier` (enum) and `subscriptionStatus` (Stripe status).

### UI Components
- Shadcn UI components under `components/ui/`.
- Dark theme configured via `tailwind.config.ts`.

## 🚢 Deployment

### Vercel + Supabase (recommended)
1. Push repo to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Enable PostgreSQL in Supabase, run `npx prisma migrate deploy`
5. Deploy!

### Important
- Keep `NEXT_PUBLIC_APP_URL` only as a fallback; signup/reset emails and checkout redirects resolve from the live request origin or Vercel host first
- Configure Stripe webhook endpoint to point to live URL (use Stripe CLI locally for testing)
- Enable Supabase Auth with email + OAuth as needed

## 📋 Next Steps (To-Do)

- [ ] Add unit tests for payroll calculator
- [ ] Implement bank integration APS/BOV (salary payments)
- [ ] Add Stripe portal for subscription management (billing portal)
- [ ] Implement advanced AI optimizations (tax-loss harvesting, bonus timing)
- [ ] Add Malta-specific translations (Maltese UI)
- [ ] Write integration tests for checkout and webhook
- [ ] Add more Shadcn components (form, dialog, dropdown-menu)
- [ ] Create ARCHITECTURE.md with detailed diagrams

## 📄 License

Proprietary. All rights reserved.

---

_Status: Core platform complete. Production-ready after Stripe webhook testing and Prisma migration application._
_Last updated: 2026-03-30
