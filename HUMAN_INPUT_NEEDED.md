# Human Input Needed

The following environment variables and external services need to be configured before the app can run in production.

## 1. AUTH_SECRET (Required)

Generate a secure secret for NextAuth session encryption:

```bash
openssl rand -base64 32
```

Set `AUTH_SECRET` in your production environment.

## 2. Stripe Account and Price IDs (Required for Payments)

Payments are optional — the app works without Stripe but the upgrade flow will be disabled.

1. Create a Stripe account at https://stripe.com
2. Create two subscription products in the Stripe Dashboard:
   - **Monthly Plan**: $4.99/month
   - **Annual Plan**: $29.99/year (with 7-day free trial)
3. Copy the Price IDs from each product
4. Set up a webhook endpoint in the Stripe Dashboard pointing to:
   `https://yourdomain.com/api/webhooks/stripe`
   Subscribe to events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Set the following environment variables:
   - `STRIPE_SECRET_KEY` — from Stripe Dashboard > Developers > API keys
   - `STRIPE_PUBLISHABLE_KEY` — from Stripe Dashboard > Developers > API keys
   - `STRIPE_WEBHOOK_SECRET` — from the webhook endpoint in Stripe Dashboard
   - `STRIPE_MONTHLY_PRICE_ID` — Price ID for the monthly plan
   - `STRIPE_ANNUAL_PRICE_ID` — Price ID for the annual plan

## 3. NEXT_PUBLIC_APP_URL (Required)

Set to your production domain:

```
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 4. Database

The app uses **SQLite** — no external database service needed.

In production (Docker), the database lives at `/data/app.db` and is automatically initialized on container startup.

For local development:
```bash
npm run db:push   # creates ./dev.db
npm run dev
```

## Complete Environment Example

```env
# Required
AUTH_SECRET="your-generated-secret-here"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
DATABASE_URL="file:./dev.db"

# Optional — app works without these, but payments will be disabled
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_MONTHLY_PRICE_ID="price_..."
STRIPE_ANNUAL_PRICE_ID="price_..."
```

## Quick Start (Development)

```bash
npm install
npm run db:push
npm run dev
```

## Production (Docker)

```bash
docker build -t burnout-tracker .
docker run -p 3000:3000 \
  -e AUTH_SECRET="your-secret" \
  -e NEXT_PUBLIC_APP_URL="https://yourdomain.com" \
  -v /path/to/data:/data \
  burnout-tracker
```
