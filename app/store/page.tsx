"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Store, Diamond, Heart, Zap, BarChart3, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useGems } from "@/lib/gem-context"

const PRO_BENEFITS = [
  { icon: Heart,     text: "unlimited hearts — never run out" },
  { icon: Zap,       text: "unlimited solo rounds per day" },
  { icon: Diamond,   text: "2x gem earning on all answers" },
  { icon: BarChart3, text: "detailed analytics and progress tracking" },
]

export default function StorePage() {
  const router = useRouter()
  const { totalGems, refillHearts } = useGems()
  const [refillMessage, setRefillMessage] = useState<string | null>(null)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    localStorage.removeItem("rally_is_guest")
    router.replace("/login")
  }

  function handleRefillHearts() {
    const success = refillHearts()
    setRefillMessage(success ? "hearts refilled!" : "not enough gems")
    setTimeout(() => setRefillMessage(null), 2500)
  }

  return (
    <div className="min-h-screen bg-[#021f3d] pb-28">
      <header className="sticky top-0 z-10 bg-[#021f3d] px-5 pt-6 pb-4 border-b border-[#0a2d4a]">
        <Link href="/" className="text-[#85B7EB]/50 text-sm font-medium hover:text-[#85B7EB] transition-colors block mb-3">
          ← home
        </Link>
        <div className="flex items-center gap-3">
          <Store className="w-6 h-6 text-[#378ADD]" />
          <h1 className="text-2xl font-extrabold text-white">store</h1>
        </div>
      </header>

      <main className="px-5 pt-6 max-w-lg mx-auto flex flex-col gap-6">

        {/* ── Hearts refill ── */}
        <section className="bg-[#0a2d4a] rounded-2xl p-5">
          <h2 className="text-lg font-extrabold text-white mb-1">refill hearts</h2>
          <p className="text-[#85B7EB]/60 text-sm mb-4">Get back 5 hearts to keep practicing solo.</p>
          <button
            onClick={handleRefillHearts}
            className="w-full bg-[#F59E0B] text-[#0a1628] rounded-2xl py-3 font-extrabold flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <Diamond className="w-5 h-5 fill-current" />
            refill 5 hearts · 200 gems
          </button>
          {refillMessage && (
            <p className={`text-center text-sm mt-3 font-semibold ${refillMessage === "hearts refilled!" ? "text-green-400" : "text-red-400"}`}>
              {refillMessage}
            </p>
          )}
          <p className="text-[#85B7EB]/40 text-xs text-center mt-2">you have {totalGems} gems</p>
        </section>

        {/* ── Pro upgrade ── */}
        <section className="bg-gradient-to-b from-[#1a3a5c] to-[#0a2d4a] rounded-2xl p-5 border border-[#378ADD]/40">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-extrabold text-white">rally Pro</h2>
            <span className="text-xs font-bold bg-[#378ADD]/20 text-[#378ADD] px-2 py-0.5 rounded-full">coming soon</span>
          </div>
          <p className="text-[#85B7EB]/60 text-sm mb-5">Unlock the full Rally experience.</p>

          {/* Benefits list */}
          <ul className="flex flex-col gap-3 mb-6">
            {PRO_BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#378ADD]/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#378ADD]" />
                </div>
                <span className="text-[#85B7EB] text-sm">{text}</span>
              </li>
            ))}
          </ul>

          {/* Pricing */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1 bg-[#021f3d] rounded-xl p-4 text-center border border-[#378ADD]/20">
              <p className="text-2xl font-extrabold text-white">$7.99</p>
              <p className="text-xs text-[#85B7EB]/60 mt-0.5">per month</p>
            </div>
            <div className="flex-1 bg-[#021f3d] rounded-xl p-4 text-center border border-[#378ADD]/40 relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#F59E0B] text-[#0a1628] text-[10px] font-bold px-2 py-0.5 rounded-full">
                best value
              </div>
              <p className="text-2xl font-extrabold text-white">$59.99</p>
              <p className="text-xs text-[#85B7EB]/60 mt-0.5">per year</p>
            </div>
          </div>

          {/* CTA — coming soon state */}
          <button
            disabled
            className="w-full bg-[#378ADD]/40 text-white/60 rounded-2xl py-4 font-extrabold text-lg cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            upgrade to Pro — coming soon
          </button>
        </section>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="text-[#85B7EB]/40 text-sm hover:text-[#85B7EB]/70 transition-colors text-center py-2"
        >
          sign out
        </button>
      </main>
    </div>
  )
}
