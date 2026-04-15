import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ hasCompletedOnboarding: false, isPremium: false })
  const [settings, subscription] = await Promise.all([
    prisma.userSettings.findUnique({ where: { userId: session.user.id } }),
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
  ])
  const isPremium = subscription?.status === "active" || subscription?.status === "trialing"
  return NextResponse.json({ hasCompletedOnboarding: settings?.hasCompletedOnboarding ?? false, isPremium })
}
