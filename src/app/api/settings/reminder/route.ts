import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { reminderEnabled, reminderTime } = body

  await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      reminderEnabled: reminderEnabled ?? false,
      reminderTime: reminderTime ?? "08:00",
    },
    update: {
      ...(reminderEnabled !== undefined && { reminderEnabled }),
      ...(reminderTime !== undefined && { reminderTime }),
    },
  })

  return NextResponse.json({ success: true })
}
