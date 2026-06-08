import Stripe from "stripe"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { createRouteHandlerClient } from "@/lib/supabase/route"
import { NextResponse } from "next/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const { priceId, userId, userEmail } = await req.json()

    if (!priceId || !userId || !userEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the authenticated user matches the requested userId
    const authClient = await createRouteHandlerClient()
    const { data: { user: authUser } } = await authClient.auth.getUser()
    if (!authUser || authUser.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServiceRoleClient()

    // Get or create Stripe customer
    const { data: user } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single()

    let customerId = user?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { supabase_user_id: userId },
      })
      customerId = customer.id

      await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", userId)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 7,
        metadata: { supabase_user_id: userId },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`,
      metadata: { supabase_user_id: userId },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("[stripe] checkout session error:", err)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
