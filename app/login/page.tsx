"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [email, setEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleGoogleSignIn() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  async function handleAppleSignIn() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  async function handleEmailSignIn() {
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setEmailSent(true)
    }
  }

  function handleGuestPlay() {
    localStorage.setItem("rally_is_guest", "true")
    router.push("/age-verify")
  }

  return (
    <div className="min-h-screen bg-[#021f3d] flex flex-col items-center justify-center px-6">
      {/* Logo + wordmark */}
      <div className="mb-10 text-center">
        <h1 className="text-6xl font-extrabold text-[#378ADD] tracking-tight mb-2">rally</h1>
        <p className="text-[#85B7EB] text-base font-medium">
          challenge your friends · SAT prep that hits differently
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-4">
        {/* Google */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white text-[#0a1628] rounded-2xl py-4 px-5 flex items-center justify-center gap-3 font-bold text-base shadow-lg transition-all active:scale-[0.98] hover:brightness-95 disabled:opacity-60"
        >
          {/* Google icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Apple */}
        <button
          onClick={handleAppleSignIn}
          disabled={loading}
          className="w-full bg-black text-white rounded-2xl py-4 px-5 flex items-center justify-center gap-3 font-bold text-base shadow-lg transition-all active:scale-[0.98] hover:brightness-125 disabled:opacity-60 border border-white/10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Continue with Apple
        </button>

        {/* Email */}
        {!emailSent ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowEmailInput(v => !v)}
              className="w-full border-2 border-[#378ADD] text-[#378ADD] rounded-2xl py-4 px-5 flex items-center justify-center gap-3 font-bold text-base transition-all active:scale-[0.98] hover:bg-[#378ADD]/10"
            >
              <Mail className="w-5 h-5" />
              Continue with email
            </button>

            {showEmailInput && (
              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleEmailSignIn()}
                  className="w-full bg-[#0a2d4a] border border-[#378ADD]/40 rounded-xl px-4 py-3 text-white placeholder-[#85B7EB]/40 focus:outline-none focus:border-[#378ADD]"
                  autoFocus
                />
                <button
                  onClick={handleEmailSignIn}
                  disabled={loading || !email.trim()}
                  className="w-full bg-[#378ADD] text-white rounded-xl py-3 font-bold transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send sign-in link"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#0a2d4a] border border-[#378ADD]/30 rounded-2xl px-5 py-4 text-center">
            <p className="text-white font-semibold text-base">
              check your email — we sent you a sign-in link
            </p>
            <p className="text-[#85B7EB]/70 text-sm mt-1">{email}</p>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        {/* Guest */}
        <button
          onClick={handleGuestPlay}
          className="text-[#85B7EB]/50 text-sm font-medium mt-2 hover:text-[#85B7EB] transition-colors text-center"
        >
          Play as guest →
        </button>
      </div>

      {/* Legal links */}
      <div className="mt-8 flex gap-4 text-[#85B7EB]/30 text-xs">
        <a href="/privacy" className="hover:text-[#85B7EB]/60 transition-colors">Privacy Policy</a>
        <span>·</span>
        <a href="/terms" className="hover:text-[#85B7EB]/60 transition-colors">Terms of Service</a>
      </div>
    </div>
  )
}
