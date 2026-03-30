# PayrollPal Malta — Architecture & Design Decisions

**Last updated:** 2026-03-30

## Overview

PayrollPal Malta is a full-stack SaaS for Maltese SMEs to manage payroll, tax, and social security compliance. Built on modern JAMstack: Next.js 14 App Router, Prisma ORM, Supabase (Postgres + Auth), Stripe, OpenAI GPT-4o.

### Key Principles
- **Compliance-first:** All tax/MSSS logic server-side; immutable audit trail.
- **AI-native but transparent:** Calculations powered by LLM with structured JSON schema; all results reviewable and editable before submission.
- **Zero-trust auth:** Cookie-based Supabase sessions; server verifies every request; company isolation.
- **Progressive disclosure:** Simple UI for common tasks; advanced options (one-time adjustments, benefits) hidden behind expansions.

---

## System Architecture

### High-Level Components

```
┌─────────────────┐      ┌──────────────────┐      ┌──────────────┐
│   Frontend      │─────▶│   Next.js API    │─────▶│  PostgreSQL  │
│ (Next.js +      │      │   Routes         │      │   (Supabase) │
│  React + Shadcn)│      │                  │      │              │
└─────────────────┘      └──────────────────┘      └──────────────┘
         │                         │                         │
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────┐      ┌──────────────────┐      ┌──────────────┐
│   Supabase      │◀─────▶│   Prisma ORM     │◀─────│   Schema     │
│   Auth (Session)│      │                  │      │              │
└─────────────────┘      └──────────────────┘      └──────────────┘
                                    │
                                    ▼
                            ┌──────────────┐
                            │   OpenAI     │
                            │   GPT-4o     │
                            └──────────────┘
```

### Data Models (Prisma Schema)

#### Core Payroll Entities

**Company** — Tenant (SME). One per user (first user creates company). Stores:
- `name`, `address`, `vatNumber`
- `subscriptionStatus` (for Stripe billing)
- `stripeCustomerId` (if subscribed)

**User** — Auth user from Supabase (`auth.users`). Links to `Company` via `companies` relation. Multiple users per company possible (future: accountant roles).

**Employee** — Person employed by company. Contains:
- `firstName`, `lastName`, `email`, `iban`, `taxId` (Malta ID number)
- `employmentType` (FULL_TIME, PART_TIME, CONTRACT)
- `salaryGross` (annual gross EUR)
- `startDate`, `endDate` (nullable for active employees)
- `benefits` (JSON array of BenefitType + amount)
- `workHoursPerWeek` (for pro-rata calculations)

**PayrollRun** — A specific payroll period.
- `companyId`, `periodStart`, `periodEnd`
- `status` → DRAFT | CALCULATED | SUBMITTED
- `submissionReference` (FS3 number when submitted)
- `submittedAt`

**PayrollEntry** — Calculated result for one employee in a run.
- `payrollRunId`, `employeeId`
- `salaryGross` (prorated for period)
- `tax`, `socialSecurity` (employee portion)
- `netPay`, `totalCost` (employer total)
- `notes` (e.g., "Partial month adjustment")

**Contribution** — Breakdown of MSSS contributions.
- `payrollEntryId`
- `type` → MSSS_EMPLOYEE | MSSS_EMPLOYER | OTHER
- `amount`, `description`

**Benefit** — Non-cash benefits (car, housing, etc.) declared by employer.
- `employeeId`, `type` (enum), `monthlyValue`
- Included in gross for tax/SSC calculation.

**TaxBracket** — Malta income tax brackets by year.
- `year`, `minIncome`, `maxIncome`, `rate` (decimal)
- Annual amounts used for progressive calculation.

**SocialSecurityRate** — MSSS rates by year.
- `year`, `employeeRate` (%), `employerRate` (%), `maxWeeklyEarning`

**AuditEvent** — Immutable log of sensitive actions.
- `action` (enum), `userId`, `companyId`, `metadata` (JSON), `ipAddress`, `timestamp`

---

## Authentication & Authorization

### Flow

1. **Sign up** → `/api/auth/signup` creates Supabase auth user + Prisma `User` record + `Company`.
2. **Login** → Supabase Auth returns session cookie (`sb-access-token`).
3. **Dashboard access** → Next.js middleware checks `/dashboard/*` routes.
4. **API calls** → Server routes read cookie, call `supabase.auth.getUser()`, find company.

### Why Cookie-Based?
Next.js App Router doesn't allow per-request middleware to set Supabase client. Cookie-based sessions work with `@supabase/supabase-js` server client:
```ts
const supabase = createClient(url, anonKey, {
  global: { headers: { cookie: req.headers.get('cookie') ?? '' } }
})
const { data: { user } } = await supabase.auth.getUser()
```

**No `Authorization: Bearer` header** — that would require managing JWTs manually. Cookies let Supabase SDK handle token refresh automatically.

---

## Payroll Calculation Pipeline

### Step 1: Create Payroll Run (Draft)
`POST /api/dashboard/payroll` with `periodStart`, `periodEnd` → creates `PayrollRun` with status `DRAFT` and **empty placeholder entries** for all active employees.

### Step 2: AI Calculation
`POST /api/dashboard/payroll/[id]/calculate`
- Fetch run + employee data.
- For each entry, call `calculatePayrollEntry()` from `lib/payrollCalculator.ts`.
- Update `PayrollEntry` with computed values.
- Create `Contribution` records (employee + employer MSSS).
- Set run status to `CALCULATED`.

**Recalculation allowed** until `SUBMITTED`.

### Step 3: Review & Edit
Frontend shows editable fields. User can adjust:
- `tax` (if AI mis-calculated)
- `socialSecurity`
- `notes` per entry
- One-time adjustments added manually.

### Step 4: Submission
`POST /api/payroll/submit` with `payrollRunId`
- Verify status is `CALCULATED`.
- Set status `SUBMITTED`, store `submissionReference` (FS3 number).
- In future: call Commissioner API or generate XML file.

---

## AI Engine (OpenAI GPT-4o)

### Two Endpoints

1. **`/api/payroll/calculate`** — Pure calculation given parameters. Returns structured JSON with fields.
   - Used by recalculation endpoint.
   - Shared function `calculatePayrollEntry()` in `lib/payrollCalculator.ts` wraps the API call.

2. **`/api/payroll/ask`** — Natural language questions.
   - Loads current tax brackets (limited to first N to control context).
   - Includes employee/company context if IDs provided.
   - Returns JSON: `answer`, `calculation` (optional), `confidence`, `needsHumanReview`.

### Prompt Engineering
- Tax brackets truncated to avoid context overflow (previously loaded all).
- Schema strictly defined; `generateJSON` enforces format.
- System prompt: "You are a Maltese payroll expert. Keep answers brief and actionable."

### Fallback Strategy
If OpenAI rate-limited or fails:
- Calculate using deterministic rules (fallback function in `lib/payrollCalculator.ts`).
- Mark `needsHumanReview: true` in response.

---

## Database Migrations & Seeding

### Creating Migrations
```bash
npx prisma migrate dev --name add_subscription_fields
npx prisma generate
```

### Seed Malta Data
Create `prisma/seed.ts` (run with `prisma db seed`) to populate:
- Initial `TaxBracket` records for previous 3 years.
- Initial `SocialSecurityRate` records for previous 3 years.
- Default `BenefitType` enum values.

---

## Security Considerations

- **SQL Injection:** Prevented by Prisma parameterized queries.
- **XSS:** React escapes by default; no `dangerouslySetInnerHTML`.
- **CSRF:** Cookie-based auth includes `SameSite= lax` by default (Supabase). State-changing POSTs protected.
- **Data Isolation:** Every query filters by `companyId` from authenticated user.
- **API Keys:** Stored in `.env.local`; never exposed to client (server-only routes use them).
- **Audit Logging:** `AuditEvent` records sensitive actions with user ID + IP. Extend middleware to log all `/api/*` calls.

---

## Scalability Plans

- **Database:** Supabase scales to ~1000 requests/sec; add connection pooling (pgbouncer) if needed.
- **AI calls:** Cache frequent calculations per employee/period (Redis) to reduce OpenAI spend.
- **Payroll runs:** Large companies (500+ employees) → batch processing with background jobs (BullMQ).
- **Subscriptions:** Stripe handles billing; webhook idempotency implemented.

---

## Trade-offs

| Decision | Alternative | Why Chosen |
|----------|-------------|------------|
| Cookie-based auth | Bearer tokens | Simpler with Supabase SDK; auto-refresh |
| GPT-4o for calc | Pure JS rules | AI handles edge cases (partial months, benefits) with fewer lines |
| Truncate tax brackets in prompt | Load all | Context overflow risk; AI can infer progressive structure from sample |
| Shadcn UI | Full component library | Copy-paste control; no runtime bloat |
| Monorepo (single Next.js app) | Microservices | Simplicity for MVP; can split later |

---

**Future evolution:** Move AI calculation to a separate microservice (Python/FastAPI) with caching, rate limiting, and better observability. But keep it in-process for now to reduce deployment complexity.
