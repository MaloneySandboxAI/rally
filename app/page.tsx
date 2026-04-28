"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Swords, Zap, Brain, GraduationCap, ChevronRight } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  // If already logged in, skip straight to the app
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      const isGuest = localStorage.getItem("rally_is_guest") === "true"
      if (session || isGuest) {
        router.replace("/home")
      } else {
        setChecking(false)
      }
    })
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen bg-[#021f3d] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#378ADD] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#021f3d] text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-12 max-w-2xl mx-auto text-center">
        {/* Logo */}
        <h1 className="text-7xl font-extrabold text-[#378ADD] tracking-tight mb-4">
          rally
        </h1>
        <p className="text-2xl font-extrabold text-white mb-3 leading-tight">
          SAT & AP prep that<br />
          <span className="text-[#378ADD]">hits differently</span>
        </p>
        <p className="text-base text-[#85B7EB]/70 max-w-md mx-auto mb-8 leading-relaxed">
          Challenge your teen to a head-to-head SAT prep game. Adaptive questions,
          real-time scoring, and a gem economy that makes studying actually fun.
        </p>

        {/* CTA */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-[#378ADD] text-white rounded-2xl py-4 px-8 font-extrabold text-lg shadow-lg shadow-[#378ADD]/30 transition-all active:scale-[0.97] hover:brightness-110"
        >
          Start playing free
          <ChevronRight className="w-5 h-5" />
        </Link>
        <p className="text-[#85B7EB]/40 text-sm mt-3">No credit card needed</p>
      </section>

      {/* App Preview — stylized phone mockup */}
      <section className="px-6 pb-12 max-w-md mx-auto">
        <div className="relative bg-[#0a2d4a] rounded-[2rem] p-4 border border-[#1a4a6e] shadow-2xl shadow-[#378ADD]/10">
          {/* Fake status bar */}
          <div className="flex items-center justify-between px-2 mb-4">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#378ADD]/40" />
              <div className="w-2 h-2 rounded-full bg-[#378ADD]/40" />
              <div className="w-2 h-2 rounded-full bg-[#378ADD]/40" />
            </div>
            <div className="text-[10px] text-[#85B7EB]/40 font-bold">rallyplaylive.com</div>
            <div className="w-8" />
          </div>

          {/* Mock category cards */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {[
              { name: "Algebra", color: "#378ADD", level: "3.2" },
              { name: "Reading", color: "#14B8A6", level: "2.8" },
              { name: "Grammar", color: "#A855F7", level: "4.1" },
              { name: "Data & Stats", color: "#F97316", level: "2.5" },
            ].map((cat) => (
              <div
                key={cat.name}
                className="bg-[#021f3d] rounded-xl p-3 flex flex-col items-center"
              >
                <div className="relative w-11 h-11 mb-1.5">
                  <svg className="w-11 h-11 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke={cat.color + "20"} strokeWidth="5" />
                    <circle
                      cx="32" cy="32" r="26"
                      fill="none" stroke={cat.color} strokeWidth="5" strokeLinecap="round"
                      strokeDasharray={`${(parseFloat(cat.level) / 5) * 163.36} ${163.36}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-extrabold text-white">{cat.level}</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-white">{cat.name}</span>
              </div>
            ))}
          </div>

          {/* Mock challenge banner */}
          <div className="bg-[#378ADD]/20 border border-[#378ADD]/30 rounded-xl p-3 flex items-center gap-3">
            <Swords className="w-5 h-5 text-[#378ADD] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white">Mom challenged you!</div>
              <div className="text-[10px] text-[#85B7EB]/60">Algebra · tap to play</div>
            </div>
            <div className="bg-[#378ADD] rounded-lg px-2.5 py-1 text-[10px] font-extrabold text-white">GO</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-14 max-w-lg mx-auto">
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#378ADD]/15 flex items-center justify-center shrink-0">
              <Swords className="w-5 h-5 text-[#378ADD]" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base mb-1">Challenge your teen</h3>
              <p className="text-sm text-[#85B7EB]/60 leading-relaxed">
                Send a challenge link and go head-to-head on SAT questions. Earn 4x gems in
                challenge mode. Nothing motivates like a little friendly competition.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#14B8A6]/15 flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5 text-[#14B8A6]" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base mb-1">Adaptive difficulty</h3>
              <p className="text-sm text-[#85B7EB]/60 leading-relaxed">
                Questions get harder as you improve. Start easy, level up fast. The app meets
                you where you are and pushes you forward.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#A855F7]/15 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-[#A855F7]" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base mb-1">Gems & speed bonuses</h3>
              <p className="text-sm text-[#85B7EB]/60 leading-relaxed">
                Earn gems for correct answers and bonuses for fast thinking. Harder questions
                pay more. It actually feels like a game.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/15 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base mb-1">SAT + AP exams</h3>
              <p className="text-sm text-[#85B7EB]/60 leading-relaxed">
                1,000+ questions across Algebra, Reading, Grammar, Data & Stats — plus AP Biology,
                Pre Calc, US History, and English Language.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 pb-16 text-center max-w-lg mx-auto">
        <div className="bg-[#0a2d4a] rounded-2xl p-8 border border-[#1a4a6e]">
          <p className="text-xl font-extrabold text-white mb-2">Ready to rally?</p>
          <p className="text-sm text-[#85B7EB]/60 mb-6">
            Challenge your teen tonight. It takes 30 seconds to start.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-[#378ADD] text-white rounded-2xl py-3.5 px-7 font-extrabold text-base shadow-lg shadow-[#378ADD]/30 transition-all active:scale-[0.97] hover:brightness-110"
          >
            Start playing free
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 pb-8 text-center">
        <div className="flex justify-center gap-4 text-[#85B7EB]/30 text-xs">
          <Link href="/privacy" className="hover:text-[#85B7EB]/60 transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-[#85B7EB]/60 transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>
  )
}
