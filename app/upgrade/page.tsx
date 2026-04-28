"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Rocket, Check, Swords, Diamond, Zap, ChevronLeft, Loader2, Crown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { toast } from "sonner"

function UpgradeContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get("reason") // "gem_cap" | "challenges" | null
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual")
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        setUserEmail(session.user.email || null)
      }
    })
  }, [])

  const handleUpgrade = async () => {
    if (!userId || !userEmail) return
    setLoading(true)

    try {
      const priceId = selectedPlan === "monthly"
        ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID

      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, userId, userEmail }),
      })

      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      console.error("Upgrade error:", err)
      toast.error("Something went wrong — please try again")
      setLoading(false)
    }
  }

  const headline = reason === "gem_cap"
    ? "you hit today\u2019s gem limit"
    : reason === "challenges"
    ? "challenges are a premium feature"
    : "unlock everything"

  const subtext = reason === "gem_cap"
    ? "upgrade to earn unlimited gems every day"
    : reason === "challenges"
    ? "challenge friends and earn 4x gems"
    : "for less than a coffee a month"

  return (
    <div className="min-h-[100dvh] bg-[#021f3d] flex flex-col">
      {/* Header */}
      <header className="px-5 pt-6 pb-2">
        <Link href="/home" className="text-[#85B7EB]/50 text-sm font-medium hover:text-[#85B7EB] transition-colors inline-flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          back
        </Link>
      </header>

      <main className="flex-1 px-5 pb-10 flex flex-col items-center">
        {/* Hero */}
        <div className="mt-6 mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#378ADD] to-[#A855F7] flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1">
            {headline}
          </h1>
          <p className="text-[#85B7EB]/60 text-sm">{subtext}</p>
        </div>

        {/* Plan toggle */}
        <div className="w-full max-w-sm flex gap-2 mb-6">
          <button
            onClick={() => setSelectedPlan("monthly")}
            className={`flex-1 rounded-xl py-3.5 px-4 border-2 transition-all ${
              selectedPlan === "monthly"
                ? "border-[#378ADD] bg-[#378ADD]/10"
                : "border-[#0a2d4a] bg-[#0a2d4a]"
            }`}
          >
            <p className="text-white font-bold text-sm">monthly</p>
            <p className="text-[#85B7EB]/60 text-xs">$6/mo</p>
          </button>

          <button
            onClick={() => setSelectedPlan("annual")}
            className={`flex-1 rounded-xl py-3.5 px-4 border-2 transition-all relative ${
              selectedPlan === "annual"
                ? "border-[#378ADD] bg-[#378ADD]/10"
                : "border-[#0a2d4a] bg-[#0a2d4a]"
            }`}
          >
            <span className="absolute -top-2.5 right-3 bg-[#14B8A6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              best value
            </span>
            <p className="text-white font-bold text-sm">annual</p>
            <p className="text-[#85B7EB]/60 text-xs">$50/yr ($4.17/mo)</p>
          </button>
        </div>

        {/* Features */}
        <div className="w-full max-w-sm space-y-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#14B8A6]/15 flex items-center justify-center shrink-0">
              <Diamond className="w-4 h-4 text-[#14B8A6]" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">unlimited solo practice</p>
              <p className="text-[#85B7EB]/40 text-xs">no daily gem cap</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#A855F7]/15 flex items-center justify-center shrink-0">
              <Swords className="w-4 h-4 text-[#A855F7]" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">challenge friends</p>
              <p className="text-[#85B7EB]/40 text-xs">head-to-head with 4x gems</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F97316]/15 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-[#F97316]" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">7-day free trial</p>
              <p className="text-[#85B7EB]/40 text-xs">cancel anytime, no charge</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleUpgrade}
          disabled={loading || !userId}
          className="w-full max-w-sm py-4 rounded-2xl bg-gradient-to-r from-[#378ADD] to-[#A855F7] text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#378ADD]/30 active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>start free trial</>
          )}
        </button>

        <p className="text-[#85B7EB]/30 text-xs mt-3 text-center max-w-sm">
          {selectedPlan === "monthly" ? "$6/month" : "$50/year"} after 7-day free trial.
          Cancel anytime in settings.
        </p>

        {/* Restore */}
        <button
          onClick={() => window.location.href = "/account"}
          className="mt-6 text-[#85B7EB]/40 text-xs underline"
        >
          already subscribed? restore purchase
        </button>
      </main>
    </div>
  )
}

export default function UpgradePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] bg-[#021f3d] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#378ADD] animate-spin" />
      </div>
    }>
      <UpgradeContent />
    </Suspense>
  )
}
