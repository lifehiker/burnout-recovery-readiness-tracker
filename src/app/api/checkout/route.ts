import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { stripe, STRIPE_PLANS } from "@/lib/stripe"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { plan } = await req.json()
  const planConfig = STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS]
  if (!planConfig) return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  let subscription = await prisma.subscription.findUnique({ where: { userId: session.user.id } })
  let customerId = subscription?.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email!,
      metadata: { userId: session.user.id },
    })
    customerId = customer.id
    subscription = await prisma.subscription.upsert({
      where: { userId: session.user.id },
      update: { stripeCustomerId: customerId },
      create: { userId: session.user.id, stripeCustomerId: customerId },
    })
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: appUrl + "/dashboard?upgraded=true",
    cancel_url: appUrl + "/upgrade",
    subscription_data: plan === "annual" ? { trial_period_days: 7 } : undefined,
  })
  return NextResponse.json({ url: checkoutSession.url })
}