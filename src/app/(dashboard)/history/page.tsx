import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { format, parseISO, subDays } from "date-fns"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/StatusBadge"
import { EmptyState } from "@/components/EmptyState"
import type { BurnoutStatus } from "@/types"

export default async function HistoryPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const subscription = await prisma.subscription.findUnique({ where: { userId: session.user.id } })
  const isPremium = subscription?.status === "active" || subscription?.status === "trialing"

  const sevenDaysAgo = format(subDays(new Date(), 7), "yyyy-MM-dd")

  const entries = await prisma.checkIn.findMany({
    where: {
      userId: session.user.id,
      ...(isPremium ? {} : { date: { gte: sevenDaysAgo } }),
    },
    orderBy: { date: "desc" },
    take: isPremium ? 500 : 7,
  })

  if (entries.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-6">History</h1>
        <EmptyState title="No history yet" description="Complete your first check-in to see your history." action={{ label: "Start Check-In", href: "/checkin" }} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">History</h1>
      <div className="space-y-2">
        {entries.map(entry => (
          <Link key={entry.id} href={"/history/" + entry.id + "/edit"}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{format(parseISO(entry.date), "EEEE, MMMM d, yyyy")}</p>
                    {entry.note && <p className="text-sm text-muted-foreground mt-0.5 truncate max-w-xs">{entry.note}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={entry.burnoutStatus as BurnoutStatus} />
                    <div className={entry.readinessScore >= 70 ? "text-2xl font-bold text-green-600" : entry.readinessScore >= 45 ? "text-2xl font-bold text-yellow-600" : "text-2xl font-bold text-red-600"}>
                      {entry.readinessScore}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
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
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="pt-4 pb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-indigo-900">Unlock unlimited history</p>
              <p className="text-xs text-indigo-700 mt-0.5">Free plan shows the last 7 days. Upgrade to see your full history and edit past entries.</p>
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
