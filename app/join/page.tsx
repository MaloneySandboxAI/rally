"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Sparkles, Diamond, Loader2 } from "lucide-react"
import { storePendingReferral } from "@/lib/referrals"
import { GEM_ECONOMY } from "@/lib/gem-context"

export default function JoinPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refCode = searchParams.get("ref")

  useEffect(() => {
    if (refCode) {
      // Store the referral code so we can use it after signup
      storePendingReferral(refCode)
    }
  }, [refCode])

  return (
    <div className="min-h-[100dvh] bg-[#021f3d] flex flex-col items-center justify-center px-6">
      {/* Logo / branding area */}
      <div className="w-20 h-20 rounded-full bg-[#F59E0B]/15 flex items-center justify-center mb-6">
        <Diamond className="w-10 h-10 text-[#F59E0B] fill-[#F59E0B]" />
      </div>

      <h1 className="text-3xl font-extrabold text-white mb-2 text-center">
        you&apos;ve been invited to Rally
      </h1>

      <p className="text-[#85B7EB]/70 text-base text-center max-w-sm mb-2">
        the SAT prep app that makes studying feel like a game
      </p>

      {/* Bonus gem callout */}
      <div className="flex items-center gap-2 bg-[#F59E0B]/15 rounded-full px-4 py-2 mb-8">
        <Sparkles className="w-4 h-4 text-[#F59E0B]" />
        <span className="text-[#F59E0B] font-bold text-sm">
          {GEM_ECONOMY.referralBonus} bonus gems when you sign up & play
        </span>
      </div>

      {/* CTA */}
      <button
        onClick={() => router.push("/login")}
        className="w-full max-w-sm bg-[#378ADD] text-white rounded-2xl py-4 font-bold text-lg transition-all hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2"
      >
        get started
        <span className="text-lg">→</span>
      </button>

      <button
        onClick={() => router.push("/")}
        className="mt-4 text-[#85B7EB]/40 text-sm font-medium hover:text-[#85B7EB]/60 transition-colors"
      >
        already have an account? sign in
      </button>
    </div>
  )
}
