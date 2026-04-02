# Multi-Tenant Keycloak Migration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current Supabase auth helper stack with Keycloak-backed authentication so each VisitFlow client (tenant) can authenticate against their own realm while preserving user/company data in Prisma.

**Architecture:** Drop Supabase auth in favor of NextAuth v5 acting as an OIDC client to Keycloak; maintain Prisma session data via the Prisma adapter, map the Keycloak user's realm/client to `Company` data, and keep the existing server components/middleware grounded on `getServerSession(authOptions)`.

**Tech Stack:** Next.js 14 App Router, NextAuth v5 + Prisma adapter, Keycloak (OIDC provider), Prisma/Postgres, NextAuth credentials for admin-service login when needed.

---

### Task 1: Keycloak-aware NextAuth setup

**Files:**
- `package.json` (add `next-auth`, `@next-auth/prisma-adapter`)
- `app/api/auth/[...nextauth]/route.ts`
- `lib/auth-keycloak.ts` (new helper for realm lookup + mapping)
- `.env.local.example` (new `KEYCLOAK_*` vars)

**Steps:**
1. Add dependencies `next-auth` and `@next-auth/prisma-adapter` and run `npm install`.
2. Create `authOptions` with Keycloak provider configured via `KEYCLOAK_HOST`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`. Set `session.strategy = 'database'`.
3. Add Prisma models (`Account`, `Session`, `VerificationToken`) if not already present (reusing `User` ID). Run `npx prisma migrate dev --name nextauth-keycloak`.
4. Implement `lib/auth-keycloak.ts` to normalize Keycloak claims, extract `email`, `tenantId` from `realm/accessToken`, and lookup existing `Company`; if no company exists, auto-create placeholder (controlled by admin env flag).
 5. Point `app/api/auth/[...nextauth]/route.ts` to export `GET`/`POST` using `NextAuth(authOptions)`.

### Task 2: Apply Prisma migration

**Files:**
- `prisma/migrations/2026-04-02-nextauth-keycloak` (to be generated)

**Steps:**
1. With a working DB URL (e.g., `DIRECT_DATABASE_URL` or a local Postgres), run `npx prisma migrate dev --name nextauth-keycloak`.
2. Confirm SQL creates NextAuth tables and preserves existing `User`/`Company` records.
3. Commit the new migration folder and updated Prisma client (`node_modules/@prisma/client` regenerated via `npm run postinstall`).

### Task 3: Session helpers + middleware switch

### Task 2: Session helpers + middleware switch

**Files:**
- `lib/auth.ts` (rework around `getServerSession`)
- `lib/supabase/middleware.ts` (rename/refactor into `lib/session/middleware.ts` or similar)
- `middleware.ts`

**Steps:**
1. Replace `getCurrentUser()` to call `getServerSession(authOptions)`; when present, hydrate user+company from Prisma/Keycloak claims (tenant mapping) and cache company info inside session for quick access.
2. Provide `getCompanyIdFromUser()`/`getCompanyFromAuth()` that read from new helper.
3. Update middleware to use `getServerSession` and only redirect unauthorized requests to `/login`, but allow Keycloak redirect/callback paths through.
4. Remove old Supabase client imports except for credential proxy if still needed for admin logins.

### Task 3: UI and API onboarding adjustments

**Files:**
- `app/login/page.tsx`, `app/signup/page.tsx`, `app/dashboard/layout.tsx`, `components` used for login
- `app/api/auth/logout/route.ts` (possibly not needed once NextAuth handles `/api/auth/signout`)
- `app/setup/company/page.tsx`

**Steps:**
1. Refactor login/signup forms to rely on `next-auth/react` `signIn('keycloak')` which triggers redirect to Keycloak realms; display the Keycloak-hosted login button and optionally a credentials fallback.
2. Keep email/password flows but submit to NextAuth Credentials provider that reuses Keycloak admin REST API or the built-in `direct grant`. Fallback to `supabase` only if Keycloak admin credentials missing.
3. Update logout flow to hit `/api/auth/signout` and let NextAuth handle session cleanup.
4. Update dashboard/signup pages to show tenant-specific branding (inject realm name from session).

### Task 4: Multi-tenant mapping + docs

**Files:**
- `lib/auth-keycloak.ts` (premapped)
- `lib/navigation.ts`, `lib/url-resolver.ts` (if necessary)
- `docs/README` update + `.env.local.example`

**Steps:**
1. Implement mapping logic from Keycloak `realm_access` or custom claims to internal `Company` via Prisma (e.g., `tenantId` claim matches `Company.id` or `Company.tenantSlug`).
2. Document how to provision Keycloak realms/clients per tenant, including required claims and callback URIs.
3. Update `.env.local.example` with Keycloak config and mention per-tenant variables.

### Task 5: Testing + verification

**Files:**
- `tests` (add integration-style test verifying `getCurrentUser()` works when `getServerSession` returns Keycloak payload).

**Steps:**
1. Write a test that stubs `getServerSession` to return a fake Keycloak user with realm-specific claims and asserts `getCurrentUser()` returns the linked company.
2. Run `npm run lint` and `node --test tests/*.test.ts`.
3. Manually test flow: `npm run dev`, open `/login`, follow Keycloak redirect (use local Keycloak dev env or stub `NEXTAUTH_URL`).

---

Plan complete and saved to `docs/plans/2026-04-02-keycloak-auth.md`. Two execution options:

1. Subagent-Driven (this session) — step through each task with a dedicated subagent and frequent checkpoints.
2. Parallel Session — start a new worktree/session using `superpowers:executing-plans` and work through the plan there.
