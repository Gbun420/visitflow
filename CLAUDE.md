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
npx prisma migrate dev --name <name>  # Create and apply migration
npx prisma studio    # Open database GUI
```

## Architecture

### Authentication Flow
- **Firebase Auth** (client-side) — login/signup pages use Firebase SDK (`lib/firebase.ts`)
- **Session cookies** — Firebase session token stored in HTTP-only cookie, verified server-side via `adminAuth.verifySessionCookie()` (`lib/firebase-admin.ts`)
- **Middleware** (`middleware.ts`) — checks for session cookie on `/dashboard/*` routes, redirects to `/login` if missing
- **API routes** — call `getCompanyFromAuth()` (`lib/auth.ts`) to verify session and get company context

### Database (Prisma + PostgreSQL)
- Single Prisma client instance exported from `lib/prisma.ts` (prevents multiple connections in dev)
- Key models: `User` → `Company` (multi-tenant), `Employee`, `PayrollRun` → `PayrollEntry` → `Contribution`
- Regulatory models: `TaxBracket`, `SocialSecurityRate` (Malta-specific, updated annually)
- Audit trail: `AuditEvent` for compliance

### API Routes
- All routes under `app/api/` use Next.js App Router conventions (`export async function GET/POST`)
- Pattern: `export const dynamic = 'force-dynamic'` to disable static rendering
- Auth pattern: extract session cookie, verify with Firebase Admin, look up User/Company in Prisma
- Return `NextResponse.json()` with appropriate status codes

### Payroll Calculation Flow
1. `POST /api/payroll/calculate` — pure calculation (no persistence)
2. Calls `calculatePayrollEntry()` (`lib/payrollCalculator.ts`)
3. Fetches employee, tax brackets, SS rates from DB
4. Sends structured prompt to GPT-4o via `generateJSON<T>()` (`lib/openai.ts`)
5. Returns calculation result for preview

### Stripe Integration
- `lib/stripe.ts` — client setup + price/tier mapping helpers
- `POST /api/checkout` — creates Stripe Checkout session
- `POST /api/stripe/webhook` — handles `customer.subscription.*` events, syncs to `Company.subscriptionStatus`
- Tiers: FREE → BASIC → PRO → ENTERPRISE (mapped in `Tier` enum)

### Subscription Enforcement
- `lib/subscription.ts` — `requireActiveSubscription()` checks company subscription status
- Returns HTTP 402 if inactive/past due

## Key Patterns

### Server-Side Auth Check
```typescript
const session = cookies().get('session')?.value
const decodedToken = await adminAuth.verifySessionCookie(session, true)
const user = await prisma.user.findUnique({ where: { email: decodedToken.email } })
```

### AI Calculation Pattern
```typescript
const result = await generateJSON<PayrollCalcResult>(prompt, 'You are a Maltese payroll accountant.')
```

### Prisma Client Usage
```typescript
import { prisma } from '@/lib/prisma'
// Use prisma directly — singleton pattern handles connection pooling
```

## Environment Variables

Required (see `.env.local.example`):
- `DATABASE_URL` — PostgreSQL connection string
- `NEXT_PUBLIC_FIREBASE_*` — Firebase client config
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` — Firebase Admin SDK
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_PRICE_FREE/BASIC/Pro/ENTERPRISE` — Stripe Price IDs
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL`

## Malta Payroll Domain Notes

- Tax brackets: progressive (0%, 15%, 25%, 35% by 2024 thresholds)
- MSSS: Employee 10%, Employer ~10.6%, capped at weekly maximum
- Payroll statuses: DRAFT → CALCULATED → SUBMITTED → PAID
- `PayrollEntry` stores per-employee breakdown; `Contribution` stores line items (MSSS, bonuses, allowances)