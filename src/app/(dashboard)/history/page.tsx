import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { format, parseISO, subDays } from "date-fns"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/StatusBadge"
import { EmptyState } from "@/components/EmptyState"
import type { BurnoutStatus, CheckInEntry } from "@/types"

export default async function HistoryPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const subscription = await prisma.subscription.findUnique({ where: { userId: session.user.id } })
  const isPremium = subscription?.status === "active" || subscription?.status === "trialing"

  const sevenDaysAgo = format(subDays(new Date(), 6), "yyyy-MM-dd")

  const entries = await prisma.checkIn.findMany({
    where: {
      userId: session.user.id,
      ...(isPremium ? {} : { date: { gte: sevenDaysAgo } }),
    },
    orderBy: { date: "desc" },
    take: isPremium ? 500 : 7,
  })
  const typedEntries = entries as CheckInEntry[]

  if (typedEntries.length === 0) {
    return (
      <div>
        <h1 className="text-4xl editorial-title text-slate-900 mb-6">History</h1>
        <EmptyState title="No history yet" description="Complete your first check-in to see your history." action={{ label: "Start Check-In", href: "/checkin" }} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="eyebrow">Archive</div>
        <h1 className="text-4xl editorial-title text-slate-900">History</h1>
      </div>
      <div className="space-y-2">
        {typedEntries.map((entry) => (
          <Link key={entry.id} href={"/history/" + entry.id + "/edit"}>
            <Card className="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_25px_70px_rgba(82,64,44,0.12)]">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{format(parseISO(entry.date), "EEEE, MMMM d, yyyy")}</p>
                    {entry.note && <p className="text-sm text-muted-foreground mt-1 truncate max-w-xs">{entry.note}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={entry.burnoutStatus as BurnoutStatus} />
                    <div className={entry.readinessScore >= 70 ? "text-3xl editorial-title text-[#1e6d67]" : entry.readinessScore >= 45 ? "text-3xl editorial-title text-[#b46d2f]" : "text-3xl editorial-title text-[#c45244]"}>
                      {entry.readinessScore}
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:flex sm:flex-wrap sm:gap-4">
                  <span>Stress: {entry.stress}</span>
                  <span>Energy: {entry.energy}</span>
                  <span>Sleep: {entry.sleep}</span>
                  <span>Soreness: {entry.soreness}</span>
                  <span>Workload: {entry.workload}</span>
                  <span>Mood: {entry.mood}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {!isPremium && (
        <Card className="border-[#d2a574] bg-[linear-gradient(135deg,rgba(244,225,203,0.72),rgba(250,246,239,0.96))]">
          <CardContent className="pt-5 pb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Unlock unlimited history</p>
              <p className="text-xs text-slate-700 mt-0.5">Free plan shows the last 7 days. Upgrade to see your full history and edit past entries.</p>
            </div>
            <Button asChild size="sm" className="shrink-0">
              <Link href="/upgrade">Upgrade</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
