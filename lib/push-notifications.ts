"use client"

import { createClient } from "@/lib/supabase/client"

const PUSH_PROMPTED_KEY = "rally_push_prompted"

export function isPushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window
}

export function wasPushPrompted(): boolean {
  if (typeof window === "undefined") return true
  return localStorage.getItem(PUSH_PROMPTED_KEY) === "true"
}

export function markPushPrompted(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(PUSH_PROMPTED_KEY, "true")
  }
}

export async function subscribeToPush(): Promise<boolean> {
  if (!isPushSupported()) return false

  try {
    const permission = await Notification.requestPermission()
    if (permission !== "granted") return false

    const registration = await navigator.serviceWorker.register("/sw.js")
    await navigator.serviceWorker.ready

    const subscription = await registration.pushManager.subscribe({
      userApplicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    })

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return false

    await supabase.from("push_subscriptions").upsert(
      {
        user_id: session.user.id,
        subscription: JSON.stringify(subscription),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )

    return true
  } catch (err) {
    console.error("[push] Subscription failed:", err)
    return false
  }
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!isPushSupported()) return

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    const subscription = await registration?.pushManager.getSubscription()
    if (subscription) await subscription.unsubscribe()

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await supabase.from("push_subscriptions").delete().eq("user_id", session.user.id)
    }
  } catch (err) {
    console.error("[push] Unsubscribe failed:", err)
  }
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null
  try {
    const registration = await navigator.serviceWorker.getRegistration()
    return (await registration?.pushManager.getSubscription()) ?? null
  } catch {
    return null
  }
}
