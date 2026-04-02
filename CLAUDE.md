# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PayrollPal Malta — AI-powered payroll SaaS for Maltese SMEs. Handles payroll calculations, tax brackets, social security (MSSS), and FS3/FS5 submissions.

## Common Commands

```bash
npm run dev          # Start development server (Next.js)
npm run build        # Production build
npm run lint         # Run ESLint
npx prisma generate  # Generate Prisma client (runs automatically postinstall)
npx prisma db push   # Sync local schema to database
npx prisma studio    # Open database GUI
```

## Architecture

### Authentication Flow (Supabase)

- **Supabase Auth** — client-side login/signup use `@supabase/ssr` (`lib/supabase/client.ts`).
- **Session management** — Middleware (`middleware.ts`) refreshes sessions and handles redirects using `@supabase/ssr` (`lib/supabase/middleware.ts`).
- **Server-side Auth** — Server components use `getCurrentUser()` (`lib/auth.ts`) which verifies the Supabase session via `supabase.auth.getUser()`.
- **Database Link** — Supabase `user.id` is stored in the `User.supabaseUid` field in Prisma.

### Database (Prisma + PostgreSQL)

- Single Prisma client instance exported from `lib/prisma.ts`.
- Key models: `User` → `Company` (multi-tenant), `Employee`, `PayrollRun` → `PayrollEntry` → `Contribution`.
- Regulatory models: `TaxBracket`, `SocialSecurityRate` (Malta-specific).
- Audit trail: `AuditEvent` for compliance.

### API Routes

- All routes under `app/api/` use Next.js App Router conventions.
- Auth pattern: Call `createClient()` from `lib/supabase/server.ts`, then `supabase.auth.getUser()`.
- Context pattern: Link Supabase user to Prisma profiles via `supabaseUid`.

### Payroll Calculation Flow

1. `POST /api/payroll/calculate` — pure calculation (no persistence).
2. Calls `calculatePayrollEntry()` (`lib/payrollCalculator.ts`).
3. Fetches employee, tax brackets, SS rates from DB.
4. Sends structured prompt to GPT-4o via `generateJSON<T>()` (`lib/openai.ts`).

### Stripe Integration

- `lib/stripe.ts` — client setup + price/tier mapping helpers.
- `POST /api/checkout` — creates Stripe Checkout session.
- `POST /api/stripe/webhook` — syncs subscription status to `Company.subscriptionStatus`.

## Key Patterns

### Server-Side Auth Check

```typescript
import { createClient } from '@/lib/supabase/server'
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
const dbUser = await prisma.user.findUnique({ where: { supabaseUid: user.id } })
```

### Environment Variables

Required:

- `DATABASE_URL` — PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role (for administrative tasks)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL`
