"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AgeVerifyPage() {
  const router = useRouter()
  const [birthYear, setBirthYear] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If already verified, go home
    const verified = localStorage.getItem("rally_age_verified")
    if (verified === "true") {
      router.replace("/home")
      return
    }
    setLoading(false)
  }, [router])

  function handleVerify() {
    setError(null)
    const year = parseInt(birthYear, 10)
    const currentYear = new Date().getFullYear()

    if (!year || year < 1900 || year > currentYear) {
      setError("Please enter a valid birth year.")
      return
    }

    const age = currentYear - year
    if (age < 13) {
      // Under 13 — block access, sign out, don't store anything
      setError("Sorry, you must be 13 or older to use Rally.")
      const supabase = createClient()
      supabase.auth.signOut()
      localStorage.removeItem("rally_is_guest")
      localStorage.removeItem("rally_age_verified")
      setTimeout(() => router.replace("/login"), 3000)
      return
    }

    // Age verified — store flag and continue
    localStorage.setItem("rally_age_verified", "true")
    router.replace("/home")
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-[#021f3d] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-extrabold text-white mb-2 text-center">
          one quick thing
        </h1>
        <p className="text-[#85B7EB]/70 text-sm text-center mb-8">
          To comply with privacy regulations, we need to verify your age before you can play.
        </p>

        <label className="text-[#85B7EB] text-sm font-semibold block mb-2">
          What year were you born?
        </label>
        <input
          type="number"
          placeholder="e.g. 2008"
          value={birthYear}
          onChange={e => setBirthYear(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleVerify()}
          min="1900"
          max={new Date().getFullYear()}
          className="w-full bg-[#0a2d4a] border border-[#378ADD]/40 rounded-xl px-4 py-3.5 text-white text-lg placeholder-[#85B7EB]/30 focus:outline-none focus:border-[#378ADD] mb-3 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          autoFocus
        />

        <p className="text-[#85B7EB]/40 text-xs mb-6">
          By continuing, you agree to our{" "}
          <a href="/terms" className="text-[#378ADD] underline">Terms of Service</a>
          {" "}and{" "}
          <a href="/privacy" className="text-[#378ADD] underline">Privacy Policy</a>.
        </p>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}

        <button
          onClick={handleVerify}
          disabled={!birthYear.trim()}
          className="w-full bg-[#378ADD] text-white rounded-2xl py-4 font-bold text-base transition-all hover:brightness-110 disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
