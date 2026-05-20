// Supabase Edge Function: send-push-notification
// Notifies a challenge participant's opponent that a round finished.
//
// The caller is authenticated from their JWT and must be a participant
// in the referenced challenge. The recipient and the notification
// content (title / body / url) are derived server-side from the
// challenge row — never accepted from the caller — so this endpoint
// cannot be used to spam arbitrary users or smuggle redirect URLs.
//
// Request body: { challenge_code: string, type: "creator_finished" | "challenger_finished" }
//
// Required secrets (set via: supabase secrets set KEY=VALUE):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
//   (the SUPABASE_* values are auto-provided by Supabase)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!
const VAPID_EMAIL = Deno.env.get("VAPID_EMAIL") || "mailto:maloney@evaine.ai"

// Short category labels (mirrors lib/categories.ts CATEGORY_SHORT).
const CATEGORY_SHORT: Record<string, string> = {
  "Algebra": "Algebra",
  "Reading Comprehension": "Reading",
  "Grammar": "Grammar",
  "Data & Statistics": "Data & Stats",
  "AP Biology": "AP Bio",
  "AP Pre Calculus": "AP Pre Calc",
  "AP US History": "APUSH",
  "AP English Language": "AP English",
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

serve(async (req) => {
  try {
    // --- Authenticate the caller from their JWT ---
    const authHeader = req.headers.get("Authorization") ?? ""
    const callerClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user: caller } } = await callerClient.auth.getUser()
    if (!caller) {
      return json({ error: "Unauthorized" }, 401)
    }

    const { challenge_code, type } = await req.json()
    if (
      typeof challenge_code !== "string" ||
      (type !== "creator_finished" && type !== "challenger_finished")
    ) {
      return json({ error: "Missing or invalid fields" }, 400)
    }

    // --- Service-role client for trusted lookups + delivery ---
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const { data: challenge } = await supabase
      .from("challenges")
      .select("share_code, category, creator_id, creator_name, challenger_id, challenger_name")
      .eq("share_code", challenge_code)
      .single()

    if (!challenge) {
      return json({ error: "Challenge not found" }, 404)
    }

    // --- Authorize: the caller must be a participant in this challenge ---
    if (caller.id !== challenge.creator_id && caller.id !== challenge.challenger_id) {
      return json({ error: "Forbidden" }, 403)
    }

    // --- The recipient is the OTHER participant ---
    const recipientId = caller.id === challenge.creator_id
      ? challenge.challenger_id
      : challenge.creator_id
    if (!recipientId) {
      return json({ sent: false, reason: "no_recipient" })
    }

    // --- Build the notification content server-side ---
    const catName = CATEGORY_SHORT[challenge.category] ?? challenge.category
    const senderName = caller.id === challenge.creator_id
      ? challenge.creator_name
      : (challenge.challenger_name ?? "Your opponent")
    const isCreatorDone = type === "creator_finished"
    const title = isCreatorDone
      ? `${senderName} played your challenge!`
      : `${senderName} finished the ${catName} challenge!`
    const body = isCreatorDone
      ? `They locked in their ${catName} score. Your turn!`
      : "Tap to see who won!"
    // Same-origin relative path only — never an attacker-controlled URL.
    const url = `/challenge/${challenge.share_code}`

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id, subscription")
      .eq("user_id", recipientId)

    if (!subs || subs.length === 0) {
      return json({ sent: false, reason: "no_subscription" })
    }

    const payload = JSON.stringify({ title, body, url, tag: `rally-${Date.now()}` })

    for (const sub of subs) {
      const subscription = JSON.parse(sub.subscription)
      try {
        const result = await sendWebPush(subscription, payload)
        if (result === 410 || result === 404) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id)
        }
      } catch {
        // Individual subscription failure — continue with others
      }
    }

    return json({ sent: true })
  } catch (err) {
    return json({ error: String(err) }, 500)
  }
})

async function sendWebPush(subscription: { endpoint: string; keys: { p256dh: string; auth: string } }, payload: string): Promise<number> {
  const vapidHeaders = await generateVapidHeaders(subscription.endpoint)

  const encrypted = await encryptPayload(
    payload,
    subscription.keys.p256dh,
    subscription.keys.auth
  )

  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      "TTL": "86400",
      "Authorization": vapidHeaders.authorization,
      "Crypto-Key": vapidHeaders.cryptoKey,
    },
    body: encrypted,
  })

  return response.status
}

async function generateVapidHeaders(endpoint: string): Promise<{ authorization: string; cryptoKey: string }> {
  const audience = new URL(endpoint).origin
  const expiration = Math.floor(Date.now() / 1000) + 12 * 60 * 60

  const header = base64UrlEncode(JSON.stringify({ typ: "JWT", alg: "ES256" }))
  const payload = base64UrlEncode(JSON.stringify({
    aud: audience,
    exp: expiration,
    sub: VAPID_EMAIL,
  }))

  const unsignedToken = `${header}.${payload}`
  const privateKeyBytes = base64UrlDecode(VAPID_PRIVATE_KEY)

  const key = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBytes,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  ).catch(() => {
    // Try JWK import as fallback for raw key format
    return crypto.subtle.importKey(
      "raw",
      privateKeyBytes,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign"]
    )
  })

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(unsignedToken)
  )

  const token = `${unsignedToken}.${base64UrlEncode(new Uint8Array(signature))}`

  return {
    authorization: `vapid t=${token}, k=${VAPID_PUBLIC_KEY}`,
    cryptoKey: `p256ecdsa=${VAPID_PUBLIC_KEY}`,
  }
}

async function encryptPayload(payload: string, p256dhKey: string, authSecret: string): Promise<Uint8Array> {
  const payloadBytes = new TextEncoder().encode(payload)

  // Generate local ECDH key pair
  const localKey = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  )

  const localPublicKeyRaw = await crypto.subtle.exportKey("raw", localKey.publicKey)
  const localPublicKeyBytes = new Uint8Array(localPublicKeyRaw)

  // Import subscriber's public key
  const subscriberKey = await crypto.subtle.importKey(
    "raw",
    base64UrlDecode(p256dhKey),
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  )

  // Derive shared secret
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: "ECDH", public: subscriberKey },
    localKey.privateKey,
    256
  )

  const authBytes = base64UrlDecode(authSecret)

  // HKDF to derive content encryption key and nonce
  const ikm = await hkdf(new Uint8Array(sharedSecret), authBytes, concatBuffers(
    new TextEncoder().encode("WebPush: info\0"),
    base64UrlDecode(p256dhKey),
    localPublicKeyBytes
  ), 32)

  const salt = crypto.getRandomValues(new Uint8Array(16))
  const prk = await hkdf(ikm, salt, new TextEncoder().encode("Content-Encoding: aes128gcm\0"), 16)
  const nonce = await hkdf(ikm, salt, new TextEncoder().encode("Content-Encoding: nonce\0"), 12)

  // Encrypt with AES-128-GCM
  const key = await crypto.subtle.importKey("raw", prk, "AES-GCM", false, ["encrypt"])
  const padded = concatBuffers(payloadBytes, new Uint8Array([2]))
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    key,
    padded
  )

  // Construct aes128gcm body: salt(16) + rs(4) + idlen(1) + keyid(65) + encrypted
  const rs = new Uint8Array(4)
  new DataView(rs.buffer).setUint32(0, 4096)

  return concatBuffers(salt, rs, new Uint8Array([65]), localPublicKeyBytes, new Uint8Array(encrypted))
}

async function hkdf(ikm: Uint8Array, salt: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", ikm, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  const prk = new Uint8Array(await crypto.subtle.sign("HMAC", key, salt.length > 0 ? salt : new Uint8Array(32)))
  const prkKey = await crypto.subtle.importKey("raw", prk, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  const infoWithCounter = concatBuffers(info, new Uint8Array([1]))
  const result = new Uint8Array(await crypto.subtle.sign("HMAC", prkKey, infoWithCounter))
  return result.slice(0, length)
}

function concatBuffers(...buffers: Uint8Array[]): Uint8Array {
  const total = buffers.reduce((sum, b) => sum + b.length, 0)
  const result = new Uint8Array(total)
  let offset = 0
  for (const b of buffers) {
    result.set(b, offset)
    offset += b.length
  }
  return result
}

function base64UrlEncode(data: string | Uint8Array): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data
  const base64 = btoa(String.fromCharCode(...bytes))
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64 + "=".repeat((4 - base64.length % 4) % 4)
  const binary = atob(padded)
  return new Uint8Array([...binary].map(c => c.charCodeAt(0)))
}
