# Features

## Daily Check-In
Description: Users rate 6 wellness signals on a 1-5 scale in about 30 seconds. Calculates a Readiness Score in real-time.
Status: completed
Implementation: src/app/(dashboard)/checkin/page.tsx, src/app/api/checkin/route.ts
Date: 2026-04-14

## Readiness Score
Description: Algorithmically computed 0-100 score from 6 signal inputs. Energy/sleep/mood are positive, stress/soreness/workload are inverted.
Status: completed
Implementation: src/lib/scoring.ts - calculateReadinessScore()
Date: 2026-04-14

## Burnout Status
Description: Three-tier risk: Low Risk (score >= 70), Watch (45-69), Elevated Risk (< 45).
Status: completed
Implementation: src/lib/scoring.ts - getBurnoutStatus()
Date: 2026-04-14

## Dashboard
Description: Shows today score, 7-day average, 30-day trend, streak count, guidance message, and 7-day bar chart.
Status: completed
Implementation: src/app/(dashboard)/dashboard/page.tsx
Date: 2026-04-14

## History View
Description: Chronological list of all past check-ins with score, status badge, and signal breakdown. Last 100 entries.
Status: completed
Implementation: src/app/(dashboard)/history/page.tsx
Date: 2026-04-14

## Edit Past Check-Ins
Description: Edit or delete any past check-in. Scores recalculated on save.
Status: completed
Implementation: src/app/(dashboard)/history/[id]/edit/page.tsx
Date: 2026-04-14

## Trends Charts
Description: Interactive line chart of readiness score and bar chart of signal averages. 7-day free, 30/90-day premium.
Status: completed
Implementation: src/app/(dashboard)/trends/page.tsx
Date: 2026-04-14

## Personalized Guidance
Description: Context-aware daily messages based on burnout status.
Status: completed
Implementation: src/lib/guidance.ts
Date: 2026-04-14

## Google OAuth Authentication
Description: Sign in with Google via NextAuth v5. Database sessions stored in PostgreSQL.
Status: completed
Implementation: auth.ts, src/app/auth/signin/page.tsx
Date: 2026-04-14

## Premium Subscriptions via Stripe
Description: Monthly (4.99/mo) and Annual (29.99/yr) plans. Annual includes 7-day free trial.
Status: completed
Implementation: src/app/(dashboard)/upgrade/page.tsx, src/app/api/checkout/route.ts, src/app/api/webhooks/stripe/route.ts
Date: 2026-04-14

## CSV Data Export
Description: Premium feature. Export all check-in history as CSV with all signals, score, status, and notes.
Status: completed
Implementation: src/app/api/export/route.ts, src/components/ExportButton.tsx
Date: 2026-04-14

## Streak Tracking
Description: Counts consecutive days with check-ins. Shown on dashboard for motivation.
Status: completed
Implementation: Streak logic in src/app/(dashboard)/dashboard/page.tsx
Date: 2026-04-14

## Onboarding Flow
Description: 3-step onboarding: welcome screen, disclaimer acknowledgment, and optional daily reminder setup. Redirects to first check-in.
Status: completed
Implementation: src/app/onboarding/page.tsx, src/app/api/onboarding/complete/route.ts, src/app/api/onboarding/status/route.ts
Date: 2026-04-14

## Reminder Settings
Description: Toggle daily reminder on/off and set reminder time. Stored in UserSettings.
Status: completed
Implementation: src/components/ReminderSettings.tsx, src/app/api/settings/reminder/route.ts
Date: 2026-04-14
