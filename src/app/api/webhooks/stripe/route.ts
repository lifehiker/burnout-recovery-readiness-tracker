import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }
  const getSubscription = async (stripeSubscriptionId: string) => {
    return stripe.subscriptions.retrieve(stripeSubscriptionId)
  }
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode === "subscription" && session.subscription) {
        const sub = await getSubscription(session.subscription as string)
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: session.customer as string },
          data: {
            stripeSubscriptionId: sub.id,
            stripePriceId: sub.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
            status: sub.status,
          },
        })
      }
      break
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          stripePriceId: sub.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
          status: sub.status,
        },
      })
      break
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { status: "canceled" },
      })
      break
    }
  }
  return NextResponse.json({ received: true })
}