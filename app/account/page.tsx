"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Trash2, LogOut, Shield, FileText, ChevronRight, Crown, CreditCard, Loader2, Users, Copy, Check, XCircle, Lock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { usePremium } from "@/lib/premium-context"
import { createParentToken, getParentToken, revokeParentToken, updateParentSnapshot } from "@/lib/parent-dashboard"

export default function AccountPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string>("Guest")
  const [isGuest, setIsGuest] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const { isPremium, subscription } = usePremium()
  const [userId, setUserId] = useState<string | null>(null)
  const [parentToken, setParentToken] = useState<string | null>(null)
  const [parentLinkLoading, setParentLinkLoading] = useState(false)
  const [parentLinkCopied, setParentLinkCopied] = useState(false)
  const [revoking, setRevoking] = useState(false)

  useEffect(() => {
    const guest = localStorage.getItem("rally_is_guest") === "true"
    setIsGuest(guest)

    if (!guest) {
      const supabase = createClient()
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setEmail(session.user.email || null)
          setUserId(session.user.id)
          const meta = session.user.user_metadata
          setDisplayName(
            meta?.display_name || meta?.full_name || meta?.name || session.user.email?.split("@")[0] || "Player"
          )
        }
      })
      // Load parent dashboard token
      getParentToken().then(t => setParentToken(t))
    }
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    localStorage.removeItem("rally_is_guest")
    router.replace("/login")
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "DELETE") return
    setDeleting(true)

    // Clear all Rally localStorage data
    const keysToRemove = [
      "rally_gems", "rally_stats", "rally_difficulty_level",
      "rally_round_history", "rally_streak", "rally_last_played",
      "rally_hearts", "rally_hearts_date", "rally_rounds_today",
      "rally_rounds_date", "rally_is_pro", "rally_streak_freeze",
      "rally_is_guest", "rally_last_login", "rally_age_verified",
    ]
    keysToRemove.forEach(key => localStorage.removeItem(key))

    if (!isGuest) {
      // Sign out from Supabase (this removes the session)
      // Note: Full server-side data deletion requires Supabase admin API
      // Users can also email maloney@evaine.ai for complete data removal
      const supabase = createClient()
      await supabase.auth.signOut()
    }

    router.replace("/login")
  }

  async function handleManageSubscription() {
    if (!userId) return
    setPortalLoading(true)
    try {
      const res = await fetch("/api/stripe/customer-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      console.error("Portal error:", err)
      setPortalLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#021f3d] pb-24">
      <header className="sticky top-0 z-10 bg-[#021f3d] px-5 pt-6 pb-4 border-b border-[#0a2d4a]">
        <Link href="/" className="text-[#85B7EB]/50 text-sm font-medium hover:text-[#85B7EB] transition-colors block mb-3">
          ← home
        </Link>
        <div className="flex items-center gap-3">
          <User className="w-6 h-6 text-[#378ADD]" />
          <h1 className="text-2xl font-extrabold text-white">account</h1>
        </div>
      </header>

      <main className="px-5 py-6 max-w-lg mx-auto space-y-6">
        {/* Profile section */}
        <div className="bg-[#0a2d4a] rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#378ADD]/20 flex items-center justify-center">
              <User className="w-6 h-6 text-[#378ADD]" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">{displayName}</p>
              <p className="text-[#85B7EB]/50 text-sm">
                {isGuest ? "Guest account" : email}
              </p>
            </div>
          </div>
        </div>

        {/* Subscription section */}
        {!isGuest && (
          <div className="bg-[#0a2d4a] rounded-2xl overflow-hidden">
            {isPremium ? (
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="w-full flex items-center justify-between px-5 py-4 active:bg-[#378ADD]/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-[#378ADD]" />
                  <div className="text-left">
                    <span className="text-white font-semibold text-sm block">Manage Subscription</span>
                    <span className="text-[#85B7EB]/40 text-xs">
                      {subscription?.subscriptionStatus === "trialing" ? "Free trial" : "Premium"} &middot; {subscription?.subscriptionPeriod || "active"}
                    </span>
                  </div>
                </div>
                {portalLoading ? (
                  <Loader2 className="w-4 h-4 text-[#85B7EB]/30 animate-spin" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#85B7EB]/30" />
                )}
              </button>
            ) : (
              <Link
                href="/upgrade"
                className="flex items-center justify-between px-5 py-4 active:bg-[#378ADD]/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-[#F97316]" />
                  <div>
                    <span className="text-white font-semibold text-sm block">Upgrade to Premium</span>
                    <span className="text-[#85B7EB]/40 text-xs">Unlimited gems &middot; Challenge friends</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#85B7EB]/30" />
              </Link>
            )}
          </div>
        )}

        {/* Parent dashboard */}
        {!isGuest && (
          <div className="bg-[#0a2d4a] rounded-2xl overflow-hidden">
            {isPremium ? (
              <div className="px-5 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-[#14B8A6]" />
                  <div>
                    <span className="text-white font-semibold text-sm block">Parent Progress Report</span>
                    <span className="text-[#85B7EB]/40 text-xs">
                      {parentToken ? "Link active — parent can view your progress" : "Share a read-only link with your parent"}
                    </span>
                  </div>
                </div>

                {parentToken ? (
                  <div className="space-y-2">
                    {/* Show link + copy button */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#021f3d] rounded-lg px-3 py-2 text-xs text-[#85B7EB]/60 truncate font-mono">
                        {typeof window !== "undefined" ? `${window.location.origin}/parent/${parentToken}` : `.../${parentToken}`}
                      </div>
                      <button
                        onClick={async () => {
                          const url = `${window.location.origin}/parent/${parentToken}`
                          await navigator.clipboard.writeText(url)
                          setParentLinkCopied(true)
                          // Also snapshot progress when they copy the link
                          updateParentSnapshot()
                          setTimeout(() => setParentLinkCopied(false), 2000)
                        }}
                        className="w-9 h-9 rounded-lg bg-[#378ADD]/20 flex items-center justify-center shrink-0"
                      >
                        {parentLinkCopied
                          ? <Check className="w-4 h-4 text-green-400" />
                          : <Copy className="w-4 h-4 text-[#378ADD]" />}
                      </button>
                    </div>
                    {/* Revoke button */}
                    <button
                      onClick={async () => {
                        setRevoking(true)
                        const success = await revokeParentToken()
                        if (success) setParentToken(null)
                        setRevoking(false)
                      }}
                      disabled={revoking}
                      className="text-xs text-red-400/60 hover:text-red-400 font-medium flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      {revoking ? "revoking..." : "revoke link"}
                    </button>
                    <p className="text-[10px] text-[#85B7EB]/30">
                      Your parent sees category levels, streaks, and accuracy — never individual questions or who you play with.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      setParentLinkLoading(true)
                      const token = await createParentToken()
                      if (token) {
                        setParentToken(token)
                        // Snapshot current progress immediately
                        await updateParentSnapshot()
                      }
                      setParentLinkLoading(false)
                    }}
                    disabled={parentLinkLoading}
                    className="w-full bg-[#14B8A6]/15 text-[#14B8A6] rounded-xl py-2.5 text-sm font-bold active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {parentLinkLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Users className="w-4 h-4" />
                    )}
                    {parentLinkLoading ? "creating..." : "generate parent link"}
                  </button>
                )}
              </div>
            ) : (
              <Link
                href="/upgrade"
                className="flex items-center justify-between px-5 py-4 active:bg-[#378ADD]/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#85B7EB]/40" />
                  <div>
                    <span className="text-white font-semibold text-sm block flex items-center gap-1.5">
                      Parent Progress Report
                      <Lock className="w-3 h-3 text-[#85B7EB]/30" />
                    </span>
                    <span className="text-[#85B7EB]/40 text-xs">Premium feature — share progress with a parent</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#85B7EB]/30" />
              </Link>
            )}
          </div>
        )}

        {/* Legal links */}
        <div className="bg-[#0a2d4a] rounded-2xl overflow-hidden">
          <Link href="/privacy" className="flex items-center justify-between px-5 py-4 border-b border-[#021f3d]/50 active:bg-[#378ADD]/10 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#378ADD]" />
              <span className="text-white font-semibold text-sm">Privacy Policy</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#85B7EB]/30" />
          </Link>
          <Link href="/terms" className="flex items-center justify-between px-5 py-4 active:bg-[#378ADD]/10 transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#378ADD]" />
              <span className="text-white font-semibold text-sm">Terms of Service</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#85B7EB]/30" />
          </Link>
        </div>

        {/* Actions */}
        <div className="bg-[#0a2d4a] rounded-2xl overflow-hidden">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-5 py-4 border-b border-[#021f3d]/50 active:bg-[#378ADD]/10 transition-colors"
          >
            <LogOut className="w-5 h-5 text-[#85B7EB]" />
            <span className="text-[#85B7EB] font-semibold text-sm">Sign out</span>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-3 px-5 py-4 active:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-semibold text-sm">Delete account</span>
          </button>
        </div>

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 space-y-4">
            <h3 className="text-red-400 font-bold text-base">Delete your account?</h3>
            <p className="text-[#85B7EB]/60 text-sm">
              This will permanently delete all your local data (gems, stats, streaks) and sign you out.
              {!isGuest && " For complete removal of server-side data, you can also email maloney@evaine.ai."}
            </p>
            <div>
              <label className="text-[#85B7EB]/50 text-xs block mb-1">
                Type DELETE to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                className="w-full bg-[#021f3d] border border-red-500/30 rounded-xl px-4 py-3 text-white placeholder-[#85B7EB]/30 focus:outline-none focus:border-red-500 text-sm"
                placeholder="DELETE"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteConfirmText("")
                }}
                className="flex-1 border border-[#378ADD]/30 text-[#85B7EB] rounded-xl py-3 font-bold text-sm transition-all hover:bg-[#378ADD]/10"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                className="flex-1 bg-red-500 text-white rounded-xl py-3 font-bold text-sm transition-all hover:brightness-110 disabled:opacity-40"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        )}

        <p className="text-[#85B7EB]/30 text-xs text-center mt-8">
          Need help? Contact{" "}
          <a href="mailto:maloney@evaine.ai" className="text-[#378ADD] underline">maloney@evaine.ai</a>
        </p>
      </main>
    </div>
  )
}
