"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import {
  Swords,
  Zap,
  Brain,
  GraduationCap,
  ChevronRight,
  Trophy,
  BarChart3,
  MessageCircle,
  BookOpen,
  ChevronDown,
  Menu,
  X,
} from "lucide-react"

// ============================================================
// RALLY LANDING PAGE
// Polished marketing page for unauthenticated visitors.
// Authenticated users skip straight to /home.
// ============================================================

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-bold text-white text-sm pr-4">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-[#85B7EB]/60 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 -mt-1">
          <p className="text-sm text-[#85B7EB]/60 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [mobileMenu, setMobileMenu] = useState(false)

  // If already logged in, skip straight to the app
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      const isGuest = localStorage.getItem("rally_is_guest") === "true"
      if (user || isGuest) {
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

  const features = [
    {
      icon: Swords,
      color: "#378ADD",
      title: "Head-to-Head Battles",
      desc: "Challenge your friends to real-time quiz battles. Answer faster and more accurately to claim victory.",
    },
    {
      icon: Trophy,
      color: "#F97316",
      title: "Leaderboards",
      desc: "Compete globally or with your school. Climb the ranks and prove you are the ultimate study champion.",
    },
    {
      icon: Brain,
      color: "#A855F7",
      title: "AI-Powered Practice",
      desc: "Our smart algorithm adapts to your strengths and weaknesses, focusing on areas you need most.",
    },
    {
      icon: BookOpen,
      color: "#22C55E",
      title: "Full SAT & APs Coverage",
      desc: "Comprehensive question banks covering all SAT sections and AP subjects with detailed explanations.",
    },
    {
      icon: MessageCircle,
      color: "#14B8A6",
      title: "Instant Feedback",
      desc: "Get immediate explanations for every question. Learn from mistakes in real-time.",
    },
    {
      icon: BarChart3,
      color: "#EC4899",
      title: "Progress Tracking",
      desc: "Detailed analytics show your improvement over time. Watch your scores climb week by week.",
    },
  ]

  const steps = [
    {
      num: "01",
      title: "Sign up in seconds",
      desc: "Create your free account with just your email. No credit card required, ever.",
    },
    {
      num: "02",
      title: "Choose your exam",
      desc: "Select SAT or any AP subject you are preparing for. We will customize your experience.",
    },
    {
      num: "03",
      title: "Challenge friends",
      desc: "Send a challenge link to your study buddies or match with students worldwide.",
    },
    {
      num: "04",
      title: "Battle & learn",
      desc: "Answer questions head-to-head, learn from explanations, and climb the leaderboard.",
    },
  ]

  const faqs = [
    {
      q: "What exams does Rally cover?",
      a: "Rally currently covers the full SAT (Reading, Writing, and Math) plus AP subjects including AP Biology, AP Pre Calculus, AP US History, and AP English Language. We are constantly adding new content.",
    },
    {
      q: "How does the head-to-head battle system work?",
      a: "You send a challenge link to a friend studying the same subject. Both players answer the same questions, and the one who earns the most gems (factoring in difficulty and speed) wins! You earn points for your leaderboard ranking.",
    },
    {
      q: "Can I study solo without competing?",
      a: "Absolutely! You can practice on your own with timed or untimed practice modes. The system adapts to your performance and focuses on areas where you need the most practice.",
    },
    {
      q: "How is Rally different from other SAT prep apps?",
      a: "Rally combines the effectiveness of spaced repetition and active recall with social competition. Studies show that friendly competition increases motivation and retention. Plus, learning with others creates accountability that solo studying cannot match.",
    },
    {
      q: "Is my progress and data safe?",
      a: "Yes, we take privacy seriously. Your data is encrypted and never sold to third parties. You control what is visible on leaderboards, and you can delete your account and data at any time.",
    },
  ]

  return (
    <div className="min-h-screen bg-[#021f3d] text-white overflow-x-hidden">
      {/* ===== HEADER / NAV ===== */}
      <header className="sticky top-0 z-50 bg-[#021f3d]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#378ADD] flex items-center justify-center">
              <span className="text-white font-extrabold text-sm">R</span>
            </div>
            <span className="font-extrabold text-lg text-white">Rally</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[#85B7EB]/70 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-[#85B7EB]/70 hover:text-white transition-colors">How It Works</a>
            <a href="#faq" className="text-sm text-[#85B7EB]/70 hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-[#85B7EB]/70 hover:text-white transition-colors px-4 py-2">
              Log in
            </Link>
            <Link
              href="/login"
              className="bg-[#378ADD] text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:brightness-110 transition-all"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden text-white" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden bg-[#021f3d] border-t border-white/5 px-6 py-4 space-y-3">
            <a href="#features" onClick={() => setMobileMenu(false)} className="block text-sm text-[#85B7EB]/70 py-2">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenu(false)} className="block text-sm text-[#85B7EB]/70 py-2">How It Works</a>
            <a href="#faq" onClick={() => setMobileMenu(false)} className="block text-sm text-[#85B7EB]/70 py-2">FAQ</a>
            <Link href="/login" className="block text-sm font-semibold text-white py-2">Log in</Link>
            <Link href="/login" className="block bg-[#378ADD] text-white rounded-xl px-5 py-2.5 text-sm font-bold text-center">
              Get Started Free
            </Link>
          </div>
        )}
      </header>

      {/* ===== HERO ===== */}
      <section className="relative px-6 pt-16 md:pt-24 pb-16 md:pb-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-[#b8960f]" />
              <span className="text-sm text-white/80">Get started now, no credit card required</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Challenge Friends.{" "}
              <span className="text-[#378ADD]">Ace the SAT & APs.</span>
            </h1>

            <p className="text-lg text-[#85B7EB]/70 max-w-lg mb-8 leading-relaxed">
              Turn studying into a game. Challenge your friends to head-to-head battles,
              climb the leaderboards, and master every topic together.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-[#378ADD] text-white rounded-xl py-3.5 px-7 font-bold text-base shadow-lg shadow-[#378ADD]/30 hover:brightness-110 transition-all"
              >
                Start Studying Free
                <ChevronRight className="w-5 h-5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white rounded-xl py-3.5 px-7 font-bold text-base hover:bg-white/5 transition-all"
              >
                See How It Works
              </a>
            </div>
          </div>

          {/* Right — battle mockup */}
          <div className="relative max-w-md mx-auto w-full">
            <div className="bg-[#0a2d4a] rounded-2xl p-6 border border-[#1a4a6e] shadow-2xl shadow-[#378ADD]/10">
              {/* Battle header */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold text-[#85B7EB]/60 tracking-wider uppercase">Live Battle</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#22C55E]">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                  In Progress
                </span>
              </div>

              {/* Players */}
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-[#1e3a5f] flex items-center justify-center mb-2 mx-auto border-2 border-[#378ADD]">
                    <span className="text-lg font-extrabold text-white">S</span>
                  </div>
                  <div className="text-xs font-bold text-white">Sarah</div>
                  <div className="text-2xl font-extrabold text-white">7</div>
                </div>
                <span className="text-[#85B7EB]/40 font-bold text-lg">VS</span>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-[#14532d] flex items-center justify-center mb-2 mx-auto border-2 border-[#22C55E]">
                    <span className="text-lg font-extrabold text-white">M</span>
                  </div>
                  <div className="text-xs font-bold text-white">Mike</div>
                  <div className="text-2xl font-extrabold text-white">5</div>
                </div>
              </div>

              {/* Question */}
              <div className="bg-[#021f3d] rounded-xl p-4 mb-4">
                <div className="text-[10px] text-[#85B7EB]/50 font-semibold mb-2">SAT Math &middot; Question 8/10</div>
                <p className="text-sm font-bold text-white mb-3">If 3x + 7 = 22, what is the value of x?</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#0a2d4a] border border-[#1a4a6e] rounded-lg py-2 text-center text-xs font-bold text-white">x = 3</div>
                  <div className="bg-[#22C55E] rounded-lg py-2 text-center text-xs font-bold text-white">x = 5</div>
                  <div className="bg-[#0a2d4a] border border-[#1a4a6e] rounded-lg py-2 text-center text-xs font-bold text-white">x = 7</div>
                  <div className="bg-[#0a2d4a] border border-[#1a4a6e] rounded-lg py-2 text-center text-xs font-bold text-white">x = 15</div>
                </div>
              </div>

              {/* Points badge */}
              <div className="flex items-center gap-3 bg-[#378ADD]/15 rounded-xl p-3">
                <Trophy className="w-5 h-5 text-[#b8960f]" />
                <div>
                  <div className="text-[10px] text-[#85B7EB]/50 font-semibold">This Week</div>
                  <div className="text-sm font-bold text-white">+150 points earned</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Everything you need to crush your exams
            </h2>
            <p className="text-[#85B7EB]/60 text-lg max-w-2xl mx-auto">
              Rally combines the power of social competition with proven study methods to help you learn faster and retain more.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-[#0a2d4a]/60 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: f.color + "20" }}
                >
                  <f.icon className="w-6 h-6" style={{ color: f.color }} />
                </div>
                <h3 className="font-bold text-white text-base mb-2">{f.title}</h3>
                <p className="text-sm text-[#85B7EB]/60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="px-6 py-16 md:py-24 bg-[#0a2d4a]/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Start competing in minutes
            </h2>
            <p className="text-[#85B7EB]/60 text-lg max-w-xl mx-auto">
              Getting started with Rally is easy. Follow these simple steps and you will be battling friends in no time.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {steps.map((s) => (
              <div
                key={s.num}
                className="bg-[#021f3d] border border-white/5 rounded-2xl p-6 flex gap-4"
              >
                <div className="text-3xl font-extrabold text-[#b8960f]/60 shrink-0">{s.num}</div>
                <div>
                  <h3 className="font-bold text-white text-base mb-1">{s.title}</h3>
                  <p className="text-sm text-[#85B7EB]/60 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[#378ADD] text-white rounded-xl py-3.5 px-7 font-bold text-base shadow-lg shadow-[#378ADD]/30 hover:brightness-110 transition-all"
            >
              Get Started Free
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Frequently asked questions
            </h2>
            <p className="text-[#85B7EB]/60 text-lg">
              Got questions? We have answers.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((f) => (
              <FAQItem key={f.q} question={f.q} answer={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section className="px-6 py-16 md:py-24 bg-[#0a2d4a]/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to study smarter?
          </h2>
          <p className="text-lg text-[#85B7EB]/60 mb-8 max-w-lg mx-auto">
            Start your first battle today — it&apos;s free to play. Challenge friends and crush your SAT and AP exams together.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-[#378ADD] text-white rounded-xl py-3.5 px-7 font-bold text-base shadow-lg shadow-[#378ADD]/30 hover:brightness-110 transition-all"
            >
              Get Started Free
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-sm text-[#85B7EB]/40 mt-4">
            No credit card required &middot; Free to play &middot; Upgrade anytime
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="px-6 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#378ADD] flex items-center justify-center">
                  <span className="text-white font-extrabold text-sm">R</span>
                </div>
                <span className="font-extrabold text-lg text-white">Rally</span>
              </div>
              <p className="text-sm text-[#85B7EB]/50 leading-relaxed">
                Making test prep social, competitive, and actually fun.
              </p>
            </div>

            {/* Product links */}
            <div>
              <h4 className="font-bold text-white text-sm mb-3">Product</h4>
              <div className="space-y-2">
                <a href="#features" className="block text-sm text-[#85B7EB]/50 hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" className="block text-sm text-[#85B7EB]/50 hover:text-white transition-colors">How It Works</a>
                <Link href="/login" className="block text-sm text-[#85B7EB]/50 hover:text-white transition-colors">SAT Prep</Link>
                <Link href="/login" className="block text-sm text-[#85B7EB]/50 hover:text-white transition-colors">AP Subjects</Link>
              </div>
            </div>

            {/* Company links */}
            <div>
              <h4 className="font-bold text-white text-sm mb-3">Company</h4>
              <div className="space-y-2">
                <span className="block text-sm text-[#85B7EB]/50">About Us</span>
                <span className="block text-sm text-[#85B7EB]/50">Blog</span>
              </div>
            </div>

            {/* Legal links */}
            <div>
              <h4 className="font-bold text-white text-sm mb-3">Legal</h4>
              <div className="space-y-2">
                <Link href="/privacy" className="block text-sm text-[#85B7EB]/50 hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="block text-sm text-[#85B7EB]/50 hover:text-white transition-colors">Terms of Service</Link>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-[#85B7EB]/30">&copy; 2026 Rally. All rights reserved. Free to play &middot; Upgrade anytime</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
