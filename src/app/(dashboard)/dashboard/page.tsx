import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { format, subDays, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScoreCard } from "@/components/ScoreCard"
import { StatusBadge } from "@/components/StatusBadge"
import { EmptyState } from "@/components/EmptyState"
import { MiniScoreChart } from "@/components/MiniScoreChart"
import { UpgradedBanner } from "@/components/UpgradedBanner"
import { Suspense } from "react"
import { getGuidanceMessage } from "@/lib/guidance"
import { getBurnoutStatus, calculateTrendDelta } from "@/lib/scoring"
import type { BurnoutStatus, CheckInEntry } from "@/types"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const today = format(new Date(), "yyyy-MM-dd")
  const sevenDaysAgo = format(subDays(new Date(), 6), "yyyy-MM-dd")
  const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd")

  const [todayEntry, recentEntries, subscription] = await Promise.all([
    prisma.checkIn.findUnique({ where: { userId_date: { userId: session.user.id, date: today } } }),
    prisma.checkIn.findMany({
      where: { userId: session.user.id, date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
      take: 30,
    }),
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
  ])

  const isPremium = subscription?.status === "active" || subscription?.status === "trialing"
  const typedRecentEntries = recentEntries as CheckInEntry[]

  const chronologicalEntries = [...typedRecentEntries].sort((a, b) => a.date.localeCompare(b.date))
  const last7Entries = chronologicalEntries.filter((entry) => entry.date >= sevenDaysAgo)
  const last7 = last7Entries.map((entry) => entry.readinessScore)
  const sevenDayAvg = last7.length > 0 ? Math.round(last7.reduce((a, b) => a + b, 0) / last7.length) : null

  const midpoint = Math.floor(last7.length / 2)
  const olderWindow = last7.slice(0, midpoint)
  const recentWindow = last7.slice(midpoint)
  const trendDelta =
    olderWindow.length > 0 && recentWindow.length > 0
      ? calculateTrendDelta(recentWindow, olderWindow)
      : null

  let streak = 0
  const sortedDates = typedRecentEntries.map((entry) => entry.date).sort().reverse()
  let checkDate = today
  for (const date of sortedDates) {
    if (date === checkDate) {
      streak++
      const d = parseISO(checkDate)
      checkDate = format(subDays(d, 1), "yyyy-MM-dd")
    } else {
      break
    }
  }

  const todayScore = todayEntry?.readinessScore ?? null
  const burnoutStatus = todayEntry
    ? (todayEntry.burnoutStatus as BurnoutStatus)
    : sevenDayAvg
      ? getBurnoutStatus(sevenDayAvg, sevenDayAvg, trendDelta)
      : null
  const guidance = burnoutStatus
    ? getGuidanceMessage(burnoutStatus, todayScore ?? sevenDayAvg ?? 50)
    : null

  const thirtyDayTrend = trendDelta === null ? null : trendDelta > 5 ? "up" : trendDelta < -5 ? "down" : "stable"
  const trendIcon = thirtyDayTrend === "up" ? "↑" : thirtyDayTrend === "down" ? "↓" : "→"
  const trendColor =
    thirtyDayTrend === "up" ? "text-[#1e6d67]" : thirtyDayTrend === "down" ? "text-[#c45244]" : "text-[#b46d2f]"

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), "yyyy-MM-dd")
    const entry = typedRecentEntries.find((item) => item.date === date)
    return { date: format(parseISO(date), "MMM d"), score: entry?.readinessScore ?? null }
  })

  const userName = session.user.name ? session.user.name.split(" ")[0] : null

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <UpgradedBanner />
      </Suspense>

      <section className="paper-panel overflow-hidden">
        <div className="flex flex-col gap-8 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="eyebrow">Daily Pulse</div>
              <div>
                <h1 className="text-4xl sm:text-5xl editorial-title">
                  {userName ? `Hey, ${userName}` : "Dashboard"}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Your recovery ledger turns six subjective signals into a quick daily read on strain, readiness, and drift.
                </p>
              </div>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <Link href="/checkin">{todayEntry ? "Edit Today" : "Check In"}</Link>
            </Button>
          </div>
          <div className="h-px ink-divider" />
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </p>
              <p className="mt-2 text-sm text-slate-700">
                {guidance ?? "Take today’s reading to see how your system is holding up."}
              </p>
            </div>
            {burnoutStatus && <StatusBadge status={burnoutStatus} />}
          </div>
        </div>
      </section>

      {typedRecentEntries.length === 0 ? (
        <EmptyState
          title="No check-ins yet"
          description="Complete your first daily check-in to start tracking your burnout risk and readiness score."
          action={{ label: "Start First Check-In", href: "/checkin" }}
        />
      ) : (
        <>
          <section className="grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
            <Card className="overflow-hidden">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <ScoreCard score={todayScore} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {todayEntry ? "Today's Readiness" : "Awaiting today's entry"}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      {burnoutStatus && <StatusBadge status={burnoutStatus} />}
                    </div>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-700">
                      {todayEntry
                        ? "A single score is only a snapshot. Use the trend and note fields to spot slow-building strain."
                        : "You haven’t logged today yet. Save a check-in to refresh the score and guidance."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
              <Card>
                <CardHeader className="pb-1 pt-5 px-5">
                  <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">7-Day Avg</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="text-3xl editorial-title">{sevenDayAvg ?? "—"}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-1 pt-5 px-5">
                  <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">30-Day Drift</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className={["text-3xl editorial-title", trendColor].join(" ")}>
                    {thirtyDayTrend ? trendIcon : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">{thirtyDayTrend ?? "No data"}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-1 pt-5 px-5">
                  <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Streak</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="text-3xl editorial-title">{streak}</div>
                  <p className="text-xs text-muted-foreground">consecutive days</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {guidance && (
            <div
              className={[
                "paper-panel flex items-start gap-4 px-5 py-4",
                burnoutStatus === "low"
                  ? "border-[#7eb6aa] bg-[linear-gradient(135deg,rgba(220,239,232,0.9),rgba(250,246,239,0.96))]"
                  : burnoutStatus === "elevated"
                    ? "border-[#d6968e] bg-[linear-gradient(135deg,rgba(246,216,210,0.95),rgba(250,246,239,0.98))]"
                    : "border-[#d2a574] bg-[linear-gradient(135deg,rgba(244,225,203,0.95),rgba(250,246,239,0.98))]",
              ].join(" ")}
            >
              <span className="text-lg shrink-0 mt-0.5 text-slate-700">◆</span>
              <p className="text-sm leading-relaxed text-slate-800">{guidance}</p>
            </div>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <MiniScoreChart data={chartData} />
            </CardContent>
          </Card>

          {!isPremium && typedRecentEntries.length >= 5 && (
            <Card className="border-[#d2a574] bg-[linear-gradient(135deg,rgba(244,225,203,0.72),rgba(250,246,239,0.96))]">
              <CardContent className="pt-5 pb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Unlock 30/90-day insights</p>
                  <p className="text-xs text-slate-700 mt-0.5">See long-term trends, edit history, and export your data.</p>
                </div>
                <Button asChild size="sm" className="shrink-0">
                  <Link href="/upgrade">Upgrade</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
