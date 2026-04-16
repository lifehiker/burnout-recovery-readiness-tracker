import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { calculateReadinessScore, getBurnoutStatus } from "@/lib/scoring"
import { format } from "date-fns"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const date = req.nextUrl.searchParams.get("date") ?? format(new Date(), "yyyy-MM-dd")
  const entry = await prisma.checkIn.findUnique({
    where: { userId_date: { userId: session.user.id, date } }
  })
  return NextResponse.json(entry ?? {})
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const { stress, energy, sleep, soreness, workload, mood, note } = body
  for (const [key, val] of Object.entries({ stress, energy, sleep, soreness, workload, mood })) {
    if (typeof val !== "number" || val < 1 || val > 5) {
      return NextResponse.json({ error: "Invalid value for " + key }, { status: 400 })
    }
  }
  const date = format(new Date(), "yyyy-MM-dd")
  const [subscription, existingToday, totalEntries] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
    prisma.checkIn.findUnique({
      where: { userId_date: { userId: session.user.id, date } },
      select: { id: true },
    }),
    prisma.checkIn.count({ where: { userId: session.user.id } }),
  ])
  const isPremium = subscription?.status === "active" || subscription?.status === "trialing"
  const isNewDayForFreeUser = !isPremium && !existingToday && totalEntries >= 7

  if (isNewDayForFreeUser) {
    return NextResponse.json(
      {
        error: "Free plan limit reached",
        code: "FREE_PLAN_LIMIT_REACHED",
        message: "Upgrade to keep logging new check-ins after your first 7 days.",
      },
      { status: 403 }
    )
  }

  const readinessScore = calculateReadinessScore(stress, energy, sleep, soreness, workload, mood)
  const recent = await prisma.checkIn.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 7,
    select: { readinessScore: true },
  })
  const avg7 =
    recent.length > 0
      ? recent.reduce((sum: number, entry: { readinessScore: number }) => sum + entry.readinessScore, 0) / recent.length
      : null
  const burnoutStatus = getBurnoutStatus(readinessScore, avg7, null)
  const entry = await prisma.checkIn.upsert({
    where: { userId_date: { userId: session.user.id, date } },
    update: { stress, energy, sleep, soreness, workload, mood, note: note?.slice(0, 200) ?? null, readinessScore, burnoutStatus },
    create: { userId: session.user.id, date, stress, energy, sleep, soreness, workload, mood, note: note?.slice(0, 200) ?? null, readinessScore, burnoutStatus },
  })
  return NextResponse.json(entry)
}
