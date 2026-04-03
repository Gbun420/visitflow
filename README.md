# PayrollPal Malta

Effortless Multi-Tenant Payroll for Maltese SMEs. Built for compliance, security, and scale.

## 🚀 Overview

PayrollPal Malta is an enterprise-grade SaaS designed specifically for the Maltese market. It automates complex payroll calculations, generates legally-compliant payslips (Malta Legal Notice 274 of 2018), and handles tax/SSC submissions with a focus on zero-trust security.

## 🛠 Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (hosted on Supabase)
- **ORM & Security:** [Prisma](https://www.prisma.io/) + [ZenStack](https://zenstack.dev/) (ORM-level data isolation)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) + [Keycloak](https://www.keycloak.org/) (OIDC)
- **Background Jobs:** [Trigger.dev v3](https://trigger.dev/) (Asynchronous processing)
- **Payments:** [Stripe](https://stripe.com/) (Subscription management)
- **Email:** [Resend](https://resend.com/) + [React Email](https://react.email/)
- **UI:** [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **Charts:** [Recharts](https://recharts.org/)

## 🔒 Security Architecture

VisitFlow implements **Zero-Trust Multi-Tenancy**. By leveraging ZenStack, data isolation is enforced at the database layer. 
- **Mathematical Isolation:** No user can ever query or modify data belonging to another company.
- **ABAC/RBAC:** Fine-grained access control defined directly in `schema.zmodel`.
- **Encryption:** Sensitive employee data (IBAN, Tax IDs) is encrypted at rest using AES-256-GCM.

## 🏗 Key Features

- **AI-Powered Payroll:** GPT-4o driven calculations for tax brackets, MSSS, and benefits.
- **Asynchronous Engine:** Background processing for high-volume payroll runs via Trigger.dev.
- **PDF Payslips:** Legally compliant, itemised payslips generated on-the-fly.
- **Analytics:** Interactive dashboard showing historical spend and workforce trends.
- **Automated Notifications:** Branded email alerts via Resend when payroll is complete.

## 🚦 Getting Started

Check the [SETUP.md](./SETUP.md) for detailed environment configuration and local development instructions.

## 📜 License

Proprietary — All rights reserved.
