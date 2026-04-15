# Features

Source of truth for all features in the Burnout & Recovery Readiness Tracker.

---

## Email/Password Authentication

**Description:** Users sign up and sign in with email and password. No OAuth required — fully self-contained auth.
**Status:** completed
**Implementation notes:** NextAuth v5 with Credentials provider, bcrypt hashing (cost 12), JWT strategy. Session callback sets `user.id = token.sub`. Routes: `src/app/auth/signin/page.tsx`, `src/app/auth/signup/page.tsx`, `src/app/api/auth/signup/route.ts`, `auth.ts`.
**Date added:** 2026-04-14

---

## Daily Check-In System

**Description:** 30-second daily check-in with 6 signal sliders. Creates or updates today's entry. Real-time score preview as sliders are adjusted.
**Status:** completed
**Implementation notes:** 6 signals: stress, energy, sleep, soreness, workload, mood (each 1–5). Optional note (200 char limit). POST creates, PUT updates existing. Route: `src/app/(dashboard)/checkin/page.tsx`, `src/app/api/checkin/route.ts`.
**Date added:** 2026-04-14

---

## Readiness Score Algorithm

**Description:** Converts 6 raw signals into a 0–100 readiness score.
**Status:** completed
**Implementation notes:** Formula: `((6-stress) + energy + sleep + (6-soreness) + (6-workload) + mood) / 30 * 100`. Stress, soreness, and workload are inverted (higher = worse). Implemented in `src/lib/scoring.ts`.
**Date added:** 2026-04-14

---

## Burnout Status Classification

**Description:** Labels each score as one of three burnout levels with contextual guidance.
**Status:** completed
**Implementation notes:** "low" (≥70), "watch" (45–69 or declining 7-day trend), "elevated" (<45 or 7-day avg <40). Logic in `src/lib/scoring.ts`. Guidance messages in `src/lib/guidance.ts`.
**Date added:** 2026-04-14

---

## Dashboard

**Description:** Main home screen showing today's readiness score, trends, streak, and guidance.
**Status:** completed
**Implementation notes:** Server component. Displays: today's ScoreCard, StatusBadge, 7-day average, 30-day trend delta, streak, guidance message, 7-day MiniScoreChart. Route: `src/app/(dashboard)/dashboard/page.tsx`.
**Date added:** 2026-04-14

---

## History View

**Description:** List of past check-in entries. Free tier shows last 7 days; premium shows all.
**Status:** completed
**Implementation notes:** Free: `take:7, gte:sevenDaysAgo`. Premium: `take:500`. Each card shows date, score, burnout status badge, note preview. Links to edit page. Upgrade prompt for free users. Route: `src/app/(dashboard)/history/page.tsx`.
**Date added:** 2026-04-14

---

## Past Entry Editing (Premium)

**Description:** Premium users can edit or delete any past check-in entry. Free users see a paywall.
**Status:** completed
**Implementation notes:** Paywall gate checks `/api/onboarding/status` for `isPremium`. DELETE hard-deletes. PUT recalculates score. Route: `src/app/(dashboard)/history/[id]/edit/page.tsx`, `src/app/api/checkin/[id]/route.ts`.
**Date added:** 2026-04-14

---

## Trends & Analytics

**Description:** Line charts showing readiness score and individual signal trends over time.
**Status:** completed
**Implementation notes:** Two Recharts line charts: readiness score + per-signal (color-coded). Free: 7-day only. Premium: 30-day and 90-day. Client component fetches `/api/trends?days={7|30|90}`. Route: `src/app/(dashboard)/trends/page.tsx`, `src/app/api/trends/route.ts`.
**Date added:** 2026-04-14

---

## Stripe Subscription Payments

**Description:** Monthly and annual subscription plans via Stripe Checkout.
**Status:** completed
**Implementation notes:** Monthly $4.99/mo, Annual $29.99/yr (7-day trial). Creates/retrieves Stripe customer, generates checkout session, redirects client. Webhook handles subscription lifecycle. Routes: `src/app/api/checkout/route.ts`, `src/app/api/webhooks/stripe/route.ts`. Gracefully disabled if `STRIPE_SECRET_KEY` is not set.
**Date added:** 2026-04-14

---

## Premium Feature Gating

**Description:** Certain features require an active premium subscription.
**Status:** completed
**Implementation notes:** Gated features: CSV export, 30/90-day trends, past entry editing. Premium check: `subscription.status === "active" || "trialing"`. Checked server-side in API routes and pages.
**Date added:** 2026-04-14

---

## CSV Export (Premium)

**Description:** Download all check-in data as a CSV file.
**Status:** completed
**Implementation notes:** Premium gate enforced server-side. Generates CSV with columns: date, stress, energy, sleep, soreness, workload, mood, readinessScore, burnoutStatus, note. Returns with `Content-Disposition: attachment`. Route: `src/app/api/export/route.ts`, component: `src/components/ExportButton.tsx`.
**Date added:** 2026-04-14

---

## Onboarding Flow

**Description:** 3-step first-run experience that explains the app, gets disclaimer acknowledgment, and sets up reminders.
**Status:** completed
**Implementation notes:** Step 1: Welcome + feature list. Step 2: Disclaimer checkbox. Step 3: Reminder toggle + time picker. Calls `/api/onboarding/complete` on finish, sets `hasCompletedOnboarding: true` in UserSettings. Route: `src/app/onboarding/page.tsx`.
**Date added:** 2026-04-14

---

## Reminder Settings

**Description:** Users can toggle daily reminders and set a preferred time.
**Status:** completed
**Implementation notes:** Toggle + time picker in Settings and Onboarding. PATCHes `/api/settings/reminder`. Stored in `UserSettings.reminderEnabled` and `UserSettings.reminderTime`. Note: actual reminder delivery (push/email) is not yet implemented — infrastructure is in place. Routes: `src/app/api/settings/reminder/route.ts`, `src/components/ReminderSettings.tsx`.
**Date added:** 2026-04-14

---

## Settings Page

**Description:** Account info, subscription status, reminder configuration, export, and support.
**Status:** completed
**Implementation notes:** Server component. Shows: user email, subscription plan/status, ReminderSettings component, ExportButton (premium only), disclaimer, support email. Route: `src/app/(dashboard)/settings/page.tsx`.
**Date added:** 2026-04-14

---

## Upgrade Page

**Description:** Plan selection page where users choose monthly or annual and are redirected to Stripe Checkout.
**Status:** completed
**Implementation notes:** Client component. Selects plan, POSTs to `/api/checkout`, redirects to returned Stripe URL. Shows `?upgraded=true` success banner on dashboard after return. Route: `src/app/(dashboard)/upgrade/page.tsx`, component: `src/components/UpgradedBanner.tsx`.
**Date added:** 2026-04-14

---

## Contextual Guidance Messages

**Description:** Personalized motivational messages based on the user's current burnout status and score.
**Status:** completed
**Implementation notes:** Multiple messages per status (low/watch/elevated), selected by `score % messages.length`. Implemented in `src/lib/guidance.ts`. Also exports `getStatusLabel`, `getStatusColor`, `getStatusBgColor` helpers.
**Date added:** 2026-04-14

---

## Mobile-Responsive UI

**Description:** Full mobile support with a bottom tab bar for small screens and top navigation for desktop.
**Status:** completed
**Implementation notes:** Dashboard layout has 5-item bottom tab bar (Home, Check-In, History, Trends, Settings) on mobile, and a top nav with the same links on desktop. Implemented in `src/app/(dashboard)/layout.tsx`.
**Date added:** 2026-04-14

---

## SQLite Database (No External DB)

**Description:** Uses SQLite via Prisma ORM. Zero external infrastructure required.
**Status:** completed
**Implementation notes:** `provider = "sqlite"` in `prisma/schema.prisma`. Dev: `file:./dev.db`. Production (Docker): `file:/data/app.db` on a mounted volume. Models: User, Account, Session, VerificationToken, CheckIn, Subscription, UserSettings. Singleton client in `src/lib/prisma.ts`.
**Date added:** 2026-04-14

---

## Docker Production Build

**Description:** Multi-stage Dockerfile for production deployment with automatic database migration.
**Status:** completed
**Implementation notes:** Three stages: deps (npm ci) → builder (prisma generate + db push + next build) → runner (standalone output). CMD runs `prisma db push --skip-generate && node server.js` to auto-migrate on startup. Uses `output: "standalone"` in `next.config.ts`. Dockerfile is in project root.
**Date added:** 2026-04-14
