# PayrollPal Malta — Build Status (2026-03-30)

**Status:** Backend API complete, auth refactored, context overflow fixed. UI needs Shadcn expansion and Stripe webhooks pending.

## What's Built (26 files)

### Core Configuration
- `package.json`, `tsconfig.json`, `.gitignore`
- `next.config.js`, `tailwind.config.ts`, `postcss.config.mjs`
- `.env.local.example` (all required env vars documented)

### Database (Prisma)
- `prisma/schema.prisma` — Full Malta payroll schema:
  - `Company`, `User`, `Employee`, `PayrollRun`, `PayrollEntry`, `Contribution`, `Benefit`
  - `TaxBracket`, `SocialSecurityRate`, `AuditEvent`
  - Malta-specific enums: `EmploymentType`, `ContributionType`, `BenefitType`, `PayrollStatus`

### Library (`lib/`)
- `prisma.ts` — Prisma client singleton
- `supabase.ts` — Supabase server client helper
- `stripe.ts` — Stripe client
- `openai.ts` — OpenAI client + `generateJSON` helper

### Authentication
- `middleware.ts` — Supabase session protection for dashboard routes
- `app/api/auth/callback/route.ts` — OAuth callback handler
- `app/api/auth/signup/route.ts` — User registration (creates company)
- `app/api/dashboard/me/route.ts` — Returns current user + first company

### Dashboard API (Protected, Cookie-Based Auth)
- `app/api/dashboard/stats/route.ts` — Aggregates (employee count, recent runs, cost)
- `app/api/dashboard/employees/route.ts` — CRUD employees (company derived from session)
- `app/api/dashboard/payroll/route.ts` — List/create payroll runs
- `app/api/dashboard/payroll/[id]/route.ts` — Get run + POST `/calculate` to recalc entries

### Payroll Core API
- `app/api/payroll/calculate/route.ts` — AI calculation engine (GPT-4o)
- `app/api/payroll/ask/route.ts` — Natural language queries (context overflow fixed: truncates tax brackets)
- `app/api/payroll/submit/route.ts` — Mark run as `SUBMITTED`, generate FS3 reference

### Frontend (App Router)
- `app/layout.tsx`, `app/providers.tsx` (Supabase + Stripe providers)
- `app/globals.css` (Tailwind + dark theme)
- `app/login/page.tsx`, `app/signup/page.tsx`
- `app/dashboard/layout.tsx` — Protected layout with navigation
- `app/dashboard/page.tsx` — Stats cards (employee count, payroll runs, monthly cost)
- `app/dashboard/employees/page.tsx` — Employee list
- `app/dashboard/employees/new/page.tsx` — Add employee form
- `app/dashboard/payroll/page.tsx` — Payroll runs list + create new
- `app/dashboard/payroll/[id]/page.tsx` — Run details + recalc button

### Components (`components/`)
- `components/ui/button.tsx` — Shadcn Button (base component)
- `components/header.tsx` — Dashboard header (placeholder)

## To Run (Dev)

```bash
cd ~/Sites/visitflow
npm ci
cp .env.local.example .env.local
# Fill env with your Supabase + Stripe + OpenAI keys
npx prisma migrate dev --name init
npm run dev
# Visit http://localhost:3000
```

### Seed Malta Tax Data (Optional but Recommended)
```sql
-- TaxBracket 2025 example
INSERT INTO "TaxBracket" (year, "minIncome", "maxIncome", rate) VALUES
(2025, 0, 9100, 0.15),
(2025, 9101, 14500, 0.25),
(2025, 14501, 19500, 0.35),
(2025, 19501, 60000, 0.40);

-- SocialSecurityRate 2025 example
INSERT INTO "SocialSecurityRate" (year, "employeeRate", "employerRate", "maxWeeklyEarning") VALUES
(2025, 0.10, 0.15, 240.19);
```

## Authentication Flow

- **Frontend:** `useUser()` hook from `@supabase/auth-helpers-react`
- **Server:** Cookie-based session verification (no `Authorization: Bearer` header)
- All `/api/dashboard/*` routes call `getCompanyIdFromUser()` helper to:
  1. Read `cookie` header
  2. `supabase.auth.getUser()` verifies session
  3. Look up `User` record by email → first `Company`
  4. Reject if missing (401) or company mismatch (403)

## AI Calculation Details

`/api/payroll/calculate` uses `lib/payrollCalculator.ts` (shared logic also used by recalculation endpoint). Computes:
- Gross period (annual / 12)
- Maltese tax via progressive brackets
- MSSS contributions (employee + employer)
- Net pay and total employer cost
- Notes for unusual scenarios (partial month, high income)

`/api/payroll/ask` accepts natural language questions, loads **only first 5 tax brackets** to avoid context overflow (previously loaded all), returns JSON with answer + optional calculation.

## What's Missing (To-Do for Production)

### High Priority
- [ ] **Shadcn UI components** — Only Button exists. Need: Card, Table, Form, Input, Select, Dialog, DropdownMenu, Alert, Skeleton, Badge.
- [ ] **Stripe webhooks** — Implement `/api/webhooks/stripe` to handle `customer.subscription.updated`, `invoice.paid`, etc. Update `Company.subscriptionStatus`.
- [ ] **Subscription enforcement** — Middleware to check active subscription before accessing `/dashboard/*`.
- [ ] **Polished employee UI** — Form with validation, edit/delete actions, loading states.
- [ ] **Payroll creation UI** — Date range picker, employee selector, confirmation modal.
- [ ] **Error handling** — Global error boundary, toast notifications (use `sonner` or `toaster` from Shadcn).

### Medium Priority
- [ ] **Bank integrations** — APS Bank payment initiation API; generate SEPA XML.
- [ ] **PDF generation** — Payslips, FS3/FS5 reports.
- [ ] **Multilingual** — Maltese translations (i18next).
- [ ] **Natural language UI** — Chat interface for `/api/payroll/ask`.
- [ ] **Audit logging** — Enhanced middleware to log all API access to `AuditEvent`.

### Testing & Quality
- [ ] Unit tests for `lib/payrollCalculator.ts` (Vitest)
- [ ] API integration tests (Supertest)
- [ ] E2E payroll flow (Playwright)
- [ ] TypeScript strict mode (currently relaxed)
- [ ] ESLint + Prettier rules enforced

### Deployment
- [ ] Vercel project setup
- [ ] Supabase production database + migrations
- [ ] Stripe live keys + webhook endpoint configuration
- [ ] Domain setup (HTTPS)
- [ ] Monitoring (Sentry) + analytics

## Design Decisions (Rationale)

### Cookie-Based Auth vs Bearer Header
- **Decision:** Use Supabase cookie sessions on server routes (`supabase.auth.getUser()` with `cookie` header).
- **Reason:** Next.js App Router doesn't support route middleware that sets per-request Supabase client. Cookie-based auth works natively with Supabase Auth helpers.
- **Impact:** All dashboard APIs derive user from session, not `Authorization` header. Simpler, more secure, consistent with Supabase examples.

### Truncate Tax Brackets in AI Prompt
- **Problem:** Full bracket list (~10-15 entries) + context caused OpenAI context overflow.
- **Solution:** Limit to top 5 brackets in prompt; AI knows progressive structure, can infer.
- **Fallback:** If calculation needs specific bracket, AI can request clarification or fetch full set via separate call (future optimization).

### Shadcn UI
- **Why:** Copy-paste components, fully customizable, no package bloat.
- **Status:** Only Button added. Need to add 15+ components for full UI.

### Stripe Subscriptions (Not Yet Implemented)
- **Model:** Per-employee-per-month pricing (€2-5).
- **Enforcement:** Middleware checks `Company.subscriptionStatus === 'active'` before dashboard routes.
- **Webhooks:** Sync subscription state automatically.

---

**Last updated:** 2026-03-30 by Zephyr (OpenClaw assistant)
**Owner:** Glenn Bundy (Independent Researcher, Malta)
**Repository:** `~/Sites/visitflow/`
