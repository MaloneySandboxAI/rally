import Stripe from "stripe"
import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Disable body parsing — Stripe needs the raw body for signature verification
export const runtime = "nodejs"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("[stripe webhook] Invalid signature:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createServerClient()

  // Extract supabase user ID from Stripe metadata
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getUserId = (obj: any): string | null =>
    obj?.metadata?.supabase_user_id || null

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = getUserId(session)
        if (!userId) break

        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        await supabase.from("users").update({
          subscription_status: sub.status === "trialing" ? "trialing" : "active",
          subscription_period:
            sub.items.data[0].price.recurring?.interval === "year"
              ? "annual"
              : "monthly",
          current_period_ends_at: new Date(sub.current_period_end * 1000).toISOString(),
          trial_ends_at: sub.trial_end
            ? new Date(sub.trial_end * 1000).toISOString()
            : null,
        }).eq("id", userId)
        break
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription
        const userId = getUserId(sub)
        if (!userId) break

        await supabase.from("users").update({
          subscription_status: sub.status === "trialing" ? "trialing" : sub.status,
          subscription_period:
            sub.items.data[0].price.recurring?.interval === "year"
              ? "annual"
              : "monthly",
          current_period_ends_at: new Date(sub.current_period_end * 1000).toISOString(),
        }).eq("id", userId)
        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        const userId = getUserId(sub)
        if (!userId) break

        await supabase.from("users").update({
          subscription_status: "canceled",
          subscription_period: null,
          current_period_ends_at: null,
        }).eq("id", userId)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.customer) break

        const customer = await stripe.customers.retrieve(invoice.customer as string)
        const userId = getUserId(customer)
        if (!userId) break

        await supabase.from("users").update({
          subscription_status: "past_due",
        }).eq("id", userId)
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.subscription) break

        const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
        const userId = getUserId(sub)
        if (!userId) break

        await supabase.from("users").update({
          subscription_status: "active",
          current_period_ends_at: new Date(sub.current_period_end * 1000).toISOString(),
        }).eq("id", userId)
        break
      }
    }
  } catch (err) {
    console.error(`[stripe webhook] Error handling ${event.type}:`, err)
    // Return 200 anyway so Stripe doesn't retry
  }

  return NextResponse.json({ received: true })
}
