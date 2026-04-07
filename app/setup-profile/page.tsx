"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { User2, Check, AlertCircle, Loader2 } from "lucide-react"
import { processPendingReferral } from "@/lib/referrals"

export default function SetupProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [username, setUsername] = useState("")
  const [checking, setChecking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [existingUsername, setExistingUsername] = useState<string | null>(null)

  // Check if user already has a username — skip if so
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.push("/login")
        return
      }
      // Check if username already exists in users table
      supabase
        .from("users")
        .select("username")
        .eq("id", session.user.id)
        .single()
        .then(({ data }) => {
          if (data?.username) {
            setExistingUsername(data.username)
            // Already has username, skip to age verify
            router.push("/age-verify")
          }
        })
    })
  }, [router, supabase])

  // Debounced username availability check
  useEffect(() => {
    if (username.length < 3) {
      setAvailable(null)
      setError(null)
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("letters, numbers, and underscores only")
      setAvailable(false)
      return
    }
    if (username.length > 20) {
      setError("max 20 characters")
      setAvailable(false)
      return
    }

    setChecking(true)
    setError(null)
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("users")
        .select("username")
        .eq("username", username.toLowerCase())
        .maybeSingle()

      setChecking(false)
      if (data) {
        setAvailable(false)
        setError("username taken")
      } else {
        setAvailable(true)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [username, supabase])

  async function handleSave() {
    if (!available || saving) return
    setSaving(true)
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      setError("not signed in")
      setSaving(false)
      return
    }

    // Save username to users table
    const { error: dbError } = await supabase
      .from("users")
      .update({ username: username.toLowerCase() })
      .eq("id", session.user.id)

    if (dbError) {
      if (dbError.code === "23505") {
        setError("username just taken — try another")
      } else {
        setError("something went wrong — try again")
      }
      setSaving(false)
      return
    }

    // Also store display_name in user_metadata for quick access
    await supabase.auth.updateUser({
      data: { display_name: username },
    })

    // Process any pending referral (from /join?ref=CODE link)
    await processPendingReferral()

    router.push("/age-verify")
  }

  async function handleSkip() {
    // Still process referral even if they skip username
    await processPendingReferral()
    router.push("/age-verify")
  }

  if (existingUsername) return null // redirecting

  return (
    <div className="min-h-screen bg-[#021f3d] flex flex-col items-center justify-center px-6">
      <div className="w-16 h-16 rounded-full bg-[#378ADD]/15 flex items-center justify-center mb-4">
        <User2 className="w-8 h-8 text-[#378ADD]" />
      </div>

      <h1 className="text-2xl font-extrabold text-white mb-1">pick a username</h1>
      <p className="text-[#85B7EB]/60 text-sm mb-6 text-center max-w-xs">
        this is how you&apos;ll appear on leaderboards and in challenges
      </p>

      <div className="w-full max-w-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="your_username"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            maxLength={20}
            className="w-full bg-[#0a2d4a] border border-[#378ADD]/40 rounded-xl px-4 py-3.5 text-white placeholder-[#85B7EB]/30 focus:outline-none focus:border-[#378ADD] text-base font-medium pr-10"
            autoFocus
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {checking && <Loader2 className="w-5 h-5 text-[#85B7EB]/40 animate-spin" />}
            {!checking && available === true && <Check className="w-5 h-5 text-green-400" />}
            {!checking && available === false && <AlertCircle className="w-5 h-5 text-red-400" />}
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-xs mt-2 ml-1">{error}</p>
        )}
        {!error && username.length > 0 && username.length < 3 && (
          <p className="text-[#85B7EB]/40 text-xs mt-2 ml-1">at least 3 characters</p>
        )}

        <button
          onClick={handleSave}
          disabled={!available || saving}
          className="w-full mt-4 bg-[#378ADD] text-white rounded-xl py-3.5 font-bold text-base transition-all active:scale-[0.98] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              saving...
            </>
          ) : (
            "continue"
          )}
        </button>

        <button
          onClick={handleSkip}
          className="w-full mt-3 text-[#85B7EB]/40 text-sm font-medium hover:text-[#85B7EB]/60 transition-colors text-center"
        >
          skip for now
        </button>
      </div>
    </div>
  )
}
