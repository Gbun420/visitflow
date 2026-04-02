# Code Issues Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the highest-risk runtime issues in onboarding, auth flows, payroll security, and broken internal links.

**Architecture:** Keep the existing Supabase/Prisma flow, but add a real company bootstrap path, a lightweight self-service profile endpoint, and stricter company scoping in the payroll APIs. Replace dead-end UI states with redirects to the onboarding flow and remove fake security placeholders.

**Tech Stack:** Next.js App Router, Supabase SSR auth, Prisma, TypeScript, Node test runner.

---

### Task 1: Add a company onboarding flow

**Files:**
- Create: `app/setup/company/page.tsx`
- Create: `app/api/company/route.ts`
- Create: `app/api/dashboard/me/route.ts`
- Modify: `lib/auth.ts`
- Modify: `app/dashboard/page.tsx`
- Modify: `app/dashboard/employees/page.tsx`
- Modify: `app/dashboard/payroll/page.tsx`
- Modify: `app/dashboard/employees/new/page.tsx`

**Step 1: Write the failing test**

Add a small Node test for a pure helper that decides whether a user should go to `/setup/company` or `/dashboard` based on company presence.

**Step 2: Run test to verify it fails**

Run: `node --test tests/setup-redirect.test.mjs`
Expected: FAIL because the helper does not exist yet.

**Step 3: Write minimal implementation**

Add the helper and wire the dashboard pages to redirect to onboarding when no active company exists.

**Step 4: Run test to verify it passes**

Run: `node --test tests/setup-redirect.test.mjs`
Expected: PASS.

**Step 5: Commit**

```bash
git add docs/plans/2026-04-02-code-issues-fix.md app/setup/company/page.tsx app/api/company/route.ts app/api/dashboard/me/route.ts lib/auth.ts app/dashboard/page.tsx app/dashboard/employees/page.tsx app/dashboard/payroll/page.tsx app/dashboard/employees/new/page.tsx
git commit -m "fix(onboarding): add company bootstrap flow"
```

### Task 2: Fix payroll security and failure handling

**Files:**
- Modify: `app/api/payroll/ask/route.ts`
- Modify: `app/api/payroll/submit/route.ts`
- Modify: `app/api/dashboard/payroll/[id]/route.ts`
- Modify: `lib/auth.ts`

**Step 1: Write the failing test**

Add Node tests for:
- employee lookup staying inside the authenticated company
- payroll calculation failing the whole request when one entry fails

**Step 2: Run test to verify it fails**

Run: `node --test tests/payroll-security.test.mjs`
Expected: FAIL.

**Step 3: Write minimal implementation**

Scope employee lookups by company, remove the fake MFA gate, and stop marking payroll runs calculated after partial failure.

**Step 4: Run test to verify it passes**

Run: `node --test tests/payroll-security.test.mjs`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/api/payroll/ask/route.ts app/api/payroll/submit/route.ts app/api/dashboard/payroll/[id]/route.ts lib/auth.ts tests/payroll-security.test.mjs
git commit -m "fix(payroll): tighten company scoping and failure handling"
```

### Task 3: Remove broken internal links and add password reset flow

**Files:**
- Modify: `app/dashboard/layout.tsx`
- Modify: `app/login/page.tsx`
- Create: `app/forgot-password/page.tsx`
- Create: `app/reset-password/page.tsx`

**Step 1: Write the failing test**

Add Node tests for the auth link helper used by the login and forgot-password pages.

**Step 2: Run test to verify it fails**

Run: `node --test tests/auth-links.test.mjs`
Expected: FAIL.

**Step 3: Write minimal implementation**

Point settings to the real security page and add the password reset screens.

**Step 4: Run test to verify it passes**

Run: `node --test tests/auth-links.test.mjs`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/dashboard/layout.tsx app/login/page.tsx app/forgot-password/page.tsx app/reset-password/page.tsx tests/auth-links.test.mjs
git commit -m "fix(auth): repair broken internal links and reset flow"
```

