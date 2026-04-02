# Multi-Tenant Auth Migration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ground VisitFlow authentication on NextAuth v4 + Keycloak so onboarding docs, auth pages, and Prisma stay in sync with the multi-tenant provider.

**Architecture:** NextAuth acts as the single source of truth for auth, binding the Prisma adapter schema (Account/Session/VerificationToken) to Keycloak credentials and a Credentials provider. Login/signup/forgot/reset UIs call `signIn('credentials')` for email/password fallbacks and redirect to Keycloak when appropriate; middleware and docs describe the new env variables that provision each tenant’s realm.

**Tech Stack:** Next.js App Router (React Server Components), Prisma + Postgres, NextAuth v4 + Prisma adapter, Keycloak OIDC, Postgres migrations.

---

## Task 1: Run the NextAuth/Keycloak migration

**Files:**

- Review: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_nextauth_keycloak/*`

**Step 1: Confirm the Prisma schema already defines Account, Session, and VerificationToken tables.**

- Run `rg -n "Account" prisma/schema.prisma` and `rg -n "VerificationToken" prisma/schema.prisma` and note the model definitions are present.

- Expectation: The models already exist; no schema edits are required before the migration.

**Step 2: Execute the migration against a working Postgres URL.**

- Ensure `DIRECT_DATABASE_URL` or `DATABASE_URL` points to a reachable Postgres instance (local dev or staging) before running the migration.
- Run `npx prisma migrate dev --name nextauth-keycloak`.
- Expectation: Prisma prints "Applying 1 migration" and generates a folder under `prisma/migrations/` containing `migration.sql` with the CREATE TABLE statements.

**Step 3: Confirm migration status.**

- Run `npx prisma migrate status --schema prisma/schema.prisma` or `npx prisma migrate status`.
- Expectation: `Database schema is up to date. No pending migrations.` appears.

**Step 4: Stage and commit the generated SQL.**

- Run `git status` to see the new migration folder.
- Run `git add prisma/migrations/<timestamp>_nextauth-keycloak` and `git commit -m "chore: add nextauth keycloak migration"`.

## Task 2: Align the auth UIs with NextAuth/Keycloak

**Files:**

- Modify: `app/login/page.tsx`, `app/signup/page.tsx`, `app/forgot-password/page.tsx`, `app/reset-password/page.tsx`

**Step 1: Simplify the login page to rely on NextAuth.**

- Keep `signIn('keycloak')` for Keycloak redirects.
- Keep the credentials form and `signIn('credentials')` call; eliminate supabase imports or any direct HTTP requests.
- Ensure the form handles `result.error` and pushes `result.url` via `router.push` when credentials succeed.
**Step 2: Rework signup/forgot/reset flows to describe the new provider behavior.**

- Update `app/signup/page.tsx` so the CTA letters Keycloak and optionally Credentials, referencing `process.env.NEXT_PUBLIC_KEYCLOAK_REALM` if available.
- Replace `app/forgot-password/page.tsx`'s Supabase reset logic with guidance that users must reset via Keycloak (add a button/link to `KEYCLOAK_HOST/realms/${KEYCLOAK_REALM}/account/` or call `signIn('credentials')` if the tenant allows direct credentials).
- Update `app/reset-password/page.tsx` to stop calling Supabase entirely; either show a redirect button to the Keycloak account page or guard with a `signIn('credentials')` retry once the user is back in VisitFlow.
**Step 3: Verify UI/test behavior.**

- Run `npm run lint` after changes to ensure formatting/TS passes.
- Manually smoke the flow with `npm run dev` if possible, visiting `/login`, `/signup`, `/forgot-password`, and `/reset-password` to confirm buttons link to NextAuth.

**Step 4: Stage the UI changes and commit.**

- Run `git add app/login/page.tsx app/signup/page.tsx app/forgot-password/page.tsx app/reset-password/page.tsx`.
- Commit with `git commit -m "feat(auth): point flows at nextauth/keycloak"`.

## Task 3: Document the new Keycloak/NextAuth env variables for multi-tenant provisioning

**Files:**

- Modify: `README.md`, `SETUP.md`, `DEPLOYMENT.md`

**Step 1: Describe Keycloak variables.**

- Add entries for `KEYCLOAK_HOST`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`, and optionally `KEYCLOAK_REALM_ALIAS` if needed, including what each value should look like.
- Mention these values need to be set in both Vercel and local `.env` files so Keycloak/OIDC discovery works.
**Step 2: Document NextAuth variables.**

- Explain `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_TRUST_HOST`, and `NEXTAUTH_SECRET` (if environment uses NextAuth cookies). Emphasize multi-tenant deployments should keep `NEXTAUTH_URL` consistent with the user-facing host and `NEXTAUTH_SECRET` must be strong.
**Step 3: Outline onboarding guidance.**

- Update `SETUP.md` where onboarding is described so it references the Keycloak-hosted login/reset flows and notes that tenant provisioning happens in Keycloak and then VisitFlow automatically maps the Keycloak realm claims to a `Company` record via `extractTenantIdentifier`.

**Step 4: Stage and commit documentation updates.**

- Run `git add README.md SETUP.md DEPLOYMENT.md` and `git commit -m "docs: describe keycloak nextauth env vars"`.

---
Plan complete and saved to `docs/plans/2026-04-02-multitenant-auth.md`. Two execution options:

1. **Subagent-Driven (this session)** — continue in this session and execute each task using `superpowers:subagent-driven-development`, reviewing along the way.
2. **Parallel Session (separate)** — spin up a new session dedicated to `superpowers:executing-plans` and follow this outline independently.

Which approach would you prefer?
