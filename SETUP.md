# Setup Guide — PayrollPal Malta

## 📦 Required Environment Variables

Create a `.env.local` file in the root directory and populate it with the following:

### 1. Database (Supabase / Postgres)
```env
DATABASE_URL="postgres://..."
DIRECT_DATABASE_URL="postgres://..."
```

### 2. Authentication (NextAuth + Keycloak)
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

KEYCLOAK_HOST="https://your-keycloak-domain"
KEYCLOAK_REALM="your-realm"
KEYCLOAK_CLIENT_ID="your-client-id"
KEYCLOAK_CLIENT_SECRET="your-client-secret"
```

### 3. Background Jobs (Trigger.dev)
```env
TRIGGER_API_KEY="tr_dev_..."
```

### 4. Emails (Resend)
```env
RESEND_API_KEY="re_..."
```

### 5. Payments (Stripe)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Price IDs
STRIPE_PRICE_FREE="price_..."
STRIPE_PRICE_BASIC="price_..."
STRIPE_PRICE_PRO="price_..."
STRIPE_PRICE_ENTERPRISE="price_..."
```

### 6. AI (OpenAI)
```env
OPENAI_API_KEY="sk-..."
```

## 🚀 Local Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Generate Prisma & ZenStack:**
   ```bash
   npx zenstack generate
   ```

3. **Sync Database:**
   ```bash
   npx prisma db push
   ```

4. **Start Trigger.dev:**
   ```bash
   npx trigger.dev@latest dev
   ```

5. **Start Next.js:**
   ```bash
   npm run dev
   ```

## 🚢 Deployment

1. **Push to GitHub:** Vercel will auto-deploy.
2. **Database:** Ensure `DATABASE_URL` in Vercel points to your production Postgres instance.
3. **Webhooks:** Configure your Stripe and Trigger.dev webhooks to point to your production domain.
