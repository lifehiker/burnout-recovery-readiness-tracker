# Human Input Needed

The following environment variables and external services need to be configured before the app can run in production.

## 1. Google OAuth Credentials

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable the Google OAuth 2.0 API
4. Create OAuth 2.0 credentials (Web Application)
5. Add authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google (development)
   - https://yourdomain.com/api/auth/callback/google (production)
6. Copy values to .env: AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET

## 2. Stripe Account and Price IDs

1. Create a Stripe account at https://stripe.com
2. Create two subscription products: Monthly at 4.99/month, Annual at 29.99/year
3. Copy the Price IDs from the Stripe dashboard
4. Set up a webhook endpoint pointing to /api/webhooks/stripe
5. Copy STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_MONTHLY_PRICE_ID, STRIPE_ANNUAL_PRICE_ID to .env

## 3. PostgreSQL Database URL

1. Set up a PostgreSQL database (e.g., Neon, Supabase, Railway, or self-hosted)
2. Run: npx prisma db push (to create the schema)
3. Set DATABASE_URL in .env

## 4. AUTH_SECRET Generation

Generate with: openssl rand -base64 32
Set AUTH_SECRET in .env

## 5. Resend API Key (for email)

1. Create an account at https://resend.com
2. Generate an API key and verify your domain
3. Set RESEND_API_KEY and EMAIL_FROM in .env

## 6. NEXT_PUBLIC_APP_URL

Set to your production domain in .env

## Quick Start

1. Copy .env.example to .env and fill in all values
2. Run: npm run db:push
3. Run: npm run dev