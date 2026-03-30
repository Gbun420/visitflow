# PayrollPal Malta — API Reference

Base URL: `https://your-app.vercel.app/api`

All API routes (except `/api/auth/*`) require authenticated Supabase session via cookies.

---

## Authentication

- Client must include Supabase session cookie (`sb-access-token`) automatically set by login.
- No `Authorization: Bearer` header.
- Server verifies session via `@supabase/supabase-js` client.
- User's company is derived from `User` record in Prisma.

**Unauthenticated response:** `401 { error: "Unauthorized" }`

---

## Dashboard API (Protected)

### `GET /api/dashboard/me`

Returns current user and their first company.

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "companyId": "uuid",
  "company": {
    "id": "uuid",
    "name": "Acme Ltd"
  }
}
```

---

### `GET /api/dashboard/stats`

Aggregated dashboard metrics: employee count, payroll run count, monthly cost estimate, recent runs.

**Response:**
```json
{
  "employeeCount": 12,
  "payrollRunCount": 24,
  "monthlyCost": 45600.00,
  "recentRuns": [
    {
      "id": "uuid",
      "periodStart": "2025-01-01",
      "periodEnd": "2025-01-31",
      "status": "SUBMITTED",
      "totalCost": 38500.00
    }
  ]
}
```

---

### `GET /api/dashboard/employees`

List all employees for current user's company.

**Query params:** None (company derived from session)

**Response:** `Employee[]`
```json
[
  {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "iban": "MT65XXXX...",
    "taxId": "1234567M",
    "employmentType": "FULL_TIME",
    "salaryGross": 36000,
    "startDate": "2024-01-15",
    "endDate": null
  }
]
```

---

### `POST /api/dashboard/employees`

Create new employee.

**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "iban": "MT65XXXX...",
  "taxId": "7654321F",
  "employmentType": "FULL_TIME",
  "salaryGross": 42000,
  "startDate": "2025-02-01"  // optional, defaults to today
}
```

**Response:** Created `Employee` object (201).

---

### `DELETE /api/dashboard/employees`

Delete employee (hard delete).

**Body:**
```json
{ "id": "employee-uuid" }
```

**Response:** `{ "success": true }`

---

### `GET /api/dashboard/payroll`

List payroll runs for current company, newest first.

**Response:** `PayrollRun[]` with computed `totalCost`.
```json
[
  {
    "id": "uuid",
    "periodStart": "2025-01-01",
    "periodEnd": "2025-01-31",
    "status": "SUBMITTED",
    "createdAt": "2025-01-28T10:30:00Z",
    "submittedAt": "2025-01-28T14:00:00Z",
    "submissionReference": "FS3-20250128-XYZ123",
    "totalCost": 38500.00
  }
]
```

---

### `POST /api/dashboard/payroll`

Create new payroll run (draft) with placeholder entries.

**Body:**
```json
{
  "periodStart": "2025-02-01",
  "periodEnd": "2025-02-28"
}
```

**Response:** `PayrollRun` with `status: "DRAFT"` and empty entries (to be calculated).

---

### `GET /api/dashboard/payroll/[id]`

Get specific run with entries and employee details.

**Response:**
```json
{
  "run": { /* PayrollRun fields */ },
  "entries": [
    {
      "id": "uuid",
      "employee": {
        "id": "uuid",
        "firstName": "Alice",
        "lastName": "Jones"
      },
      "salaryGross": 3000.00,
      "tax": 450.00,
      "socialSecurity": 300.00,
      "netPay": 2250.00,
      "totalCost": 3450.00,
      "notes": null
    }
  ]
}
```

---

### `POST /api/dashboard/payroll/[id]/calculate`

Recalculate all entries using AI. Only allowed if run status is `DRAFT` or `CALCULATED`.

**Response:** `{ "success": true, "message": "Recalculated" }`

---

## Payroll Core API

### `POST /api/payroll/calculate`

Pure calculation endpoint. Does not persist anything. Used by dashboard recalculation and client-side previews.

**Body:**
```json
{
  "companyId": "uuid",
  "employeeId": "uuid",
  "periodStart": "2025-02-01",
  "periodEnd": "2025-02-28",
  "salaryGross": 36000,
  "benefits": [],  // optional array of { "type": "CAR", "value": 200 }
  "oneTimeAdjustments": []  // optional array of { "type": "BONUS", "amount": 1000 }
}
```

**Response:**
```json
{
  "grossPeriod": 3000.00,
  "tax": 525.00,
  "socialSecurityEmployee": 300.00,
  "socialSecurityEmployer": 450.00,
  "netPay": 2175.00,
  "totalCost": 3525.00,
  "notes": "Partial month adjustment applied"
}
```

**Errors:**
- `400` if missing fields
- `403` if `companyId` does not match authenticated user's company

---

### `POST /api/payroll/ask`

Natural language payroll queries.

**Body:**
```json
{
  "question": "What is the tax impact of a €2000 bonus for employee X?",
  "companyId": "uuid",
  "employeeId": "uuid"  // optional
}
```

**Response:**
```json
{
  "answer": "A €2000 gross bonus would incur €525 tax and €200 employee MSSS, resulting in €1275 net to employee. Employer adds €300 MSSS, total cost €2300.",
  "calculation": {
    "gross": 2000.00,
    "net": 1275.00,
    "tax": 525.00,
    "ssEmployee": 200.00,
    "ssEmployer": 300.00
  },
  "confidence": "high",
  "needsHumanReview": false
}
```

**Note:** Tax brackets truncated to first 5 to avoid context overflow.

---

### `POST /api/payroll/submit`

Submit payroll run to Malta Commissioner (simulated). Sets status to `SUBMITTED` and generates FS3 reference.

**Body:**
```json
{ "payrollRunId": "uuid" }
```

**Response:**
```json
{
  "success": true,
  "payrollRun": {
    "id": "uuid",
    "status": "SUBMITTED",
    "submissionReference": "FS3-20250330-ABC123",
    "submittedAt": "2025-03-30T15:45:00Z"
  },
  "message": "Payroll submitted to Malta Commissioner for Revenue"
}
```

**Errors:**
- `400` if run not found or not in `CALCULATED` status.

---

## Error Responses

All errors follow JSON format:
```json
{
  "error": "Short error message",
  "details": "Optional longer explanation"  // only in dev
}
```

Status codes:
- `400` — Bad request (missing/invalid fields)
- `401` — Unauthorized (no session)
- `403` — Forbidden (company mismatch)
- `404` — Not found
- `500` — Server error (OpenAI API failure, Prisma error)

---

## Rate Limits

Currently none, but recommended:
- `/api/payroll/calculate` — 60 req/min per user
- `/api/payroll/ask` — 30 req/min per user

Implement with Upstash Redis or similar.

---

## Future Endpoints (Planned)

- `GET /api/payroll/:id/pdf` — Generate FS3/FS5 PDF
- `POST /api/payroll/:id/submit/bank` — Initiate SEPA payment via APS
- `GET /api/companies/:id/invite` — Invite accountant/colleague
- `POST /api/webhooks/stripe` — Stripe events

---

**Last updated:** 2026-03-30
