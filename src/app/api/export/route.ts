import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import type { CheckInEntry } from "@/types"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const subscription = await prisma.subscription.findUnique({ where: { userId: session.user.id } })
  const isPremium = subscription?.status === "active" || subscription?.status === "trialing"
  if (!isPremium) return NextResponse.json({ error: "Premium required" }, { status: 403 })
  const entries = await prisma.checkIn.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  })
  const typedEntries = entries as CheckInEntry[]
  const headers = ["date", "stress", "energy", "sleep", "soreness", "workload", "mood", "readinessScore", "burnoutStatus", "note"]
  const rows = typedEntries.map((entry) => [
    entry.date, entry.stress, entry.energy, entry.sleep, entry.soreness, entry.workload, entry.mood, entry.readinessScore, entry.burnoutStatus,
    entry.note ? '"' + entry.note.replace(/"/g, '""') + '"' : ""
  ].join(","))
  const newline = String.fromCharCode(10)
  const csv = [headers.join(","), ...rows].join(newline)
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=burnout-tracker-export.csv",
    },
  })
}
