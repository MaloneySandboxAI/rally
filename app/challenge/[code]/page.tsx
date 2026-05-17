"use client"

import { useState, useEffect, Suspense } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { getChallenge, isChallengeExpired, getChallengeTimeRemaining, type Challenge } from "@/lib/challenges"
import { createClient } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"
import { Diamond, Trophy, Swords, ChevronRight, ChevronLeft, Clock } from "lucide-react"
import Link from "next/link"
import { CATEGORY_SHORT, CATEGORY_COLORS } from "@/lib/categories"
import { RematchButton } from "@/components/rally/rematch-button"
import { storePendingReferral, getPendingReferral } from "@/lib/referrals"
import { recordH2HResult, getH2HRecord, formatH2HRecord, type H2HRecord } from "@/lib/head-to-head"

function getCategoryDisplay(id: string): string {
  return CATEGORY_SHORT[id] || id
}

function ChallengePageContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = params.code as string

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwnChallenge, setIsOwnChallenge] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [h2hRecord, setH2hRecord] = useState<H2HRecord | null>(null)

  useEffect(() => {
    if (!code) return

    // Store referral code from URL if present (challenge link doubles as referral)
    const ref = searchParams.get("ref")
    if (ref && !getPendingReferral()) {
      storePendingReferral(ref)
    }

    async function load() {
      const c = await getChallenge(code)
      if (!c) {
        setError("Challenge not found — the link may be expired or invalid.")
      } else {
        setChallenge(c)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setCurrentUserId(user.id)
          if (c.creator_id === user.id) {
            setIsOwnChallenge(true)
          }

          // Auto-create referral if user is new and doesn't have one
          if (c.creator_id && c.creator_id !== user.id) {
            const { data: existingRef } = await supabase
              .from("referrals")
              .select("id")
              .eq("referred_id", user.id)
              .limit(1)
              .single()
            if (!existingRef) {
              await supabase.from("referrals").insert({
                referrer_id: c.creator_id,
                referred_id: user.id,
                status: "pending",
                source: "challenge",
                challenge_id: c.id,
              }).then(() => {})
            }
          }

          // Record h2h result (only once per challenge — check h2h_recorded flag)
          if (c.status === "completed" && c.creator_id && c.challenger_id) {
            if (!(c as any).h2h_recorded) {
              const creatorScore = c.creator_score ?? 0
              const challengerScore = c.challenger_score ?? 0
              if (creatorScore !== challengerScore) {
                const winnerId = creatorScore > challengerScore ? c.creator_id : c.challenger_id
                const loserId = creatorScore > challengerScore ? c.challenger_id : c.creator_id
                recordH2HResult(winnerId, loserId, c.category)
                supabase.from("challenges").update({ h2h_recorded: true }).eq("share_code", code)
              }
            }

            const opponentId = user.id === c.creator_id ? c.challenger_id : c.creator_id
            getH2HRecord(user.id, opponentId, c.category).then(r => setH2hRecord(r))
          }
        }
      }
      setLoading(false)
    }

    load()
  }, [code])

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#021f3d] flex flex-col items-center justify-center">
        <Spinner className="w-8 h-8 text-[#378ADD]" />
        <p className="text-[#85B7EB] mt-4 font-medium">loading challenge...</p>
      </div>
    )
  }

  if (error || !challenge) {
    return (
      <div className="min-h-[100dvh] bg-[#021f3d] flex flex-col items-center justify-center px-5 text-center relative">
        <Link href="/home" className="absolute top-6 left-5 text-[#85B7EB]/50 text-sm font-medium hover:text-[#85B7EB] transition-colors inline-flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          home
        </Link>
        <Swords className="w-12 h-12 text-[#378ADD]/40 mb-3" />
        <h1 className="text-lg font-extrabold text-white mb-1">challenge not found</h1>
        <p className="text-[#85B7EB]/60 text-xs mb-5">{error}</p>
        <a href="/home" className="bg-[#378ADD] text-white rounded-xl py-3 px-6 font-bold text-sm">
          play solo instead
        </a>
      </div>
    )
  }

  // Challenge completed — show head-to-head gem comparison
  if (challenge.status === "completed") {
    const creatorGems = challenge.creator_score ?? 0
    const challengerGems = challenge.challenger_score ?? 0
    const creatorWon = creatorGems > challengerGems
    const challengerWon = challengerGems > creatorGems
    const tied = creatorGems === challengerGems

    // Count correct answers from results for display
    const creatorCorrect = challenge.creator_results?.filter(r => r.isCorrect).length ?? 0
    const challengerCorrect = challenge.challenger_results?.filter(r => r.isCorrect).length ?? 0

    return (
      <div className="min-h-[100dvh] bg-[#021f3d] flex flex-col items-center justify-center px-5 text-center relative">
        <Link href="/home" className="absolute top-6 left-5 text-[#85B7EB]/50 text-sm font-medium hover:text-[#85B7EB] transition-colors inline-flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          home
        </Link>
        <Trophy className="w-10 h-10 text-[#EF9F27] mb-2" />
        <h1 className="text-lg font-extrabold text-white mb-0.5">challenge complete</h1>
        <p className="text-[#85B7EB]/60 text-xs mb-4">{getCategoryDisplay(challenge.category)}</p>

        <div className="w-full max-w-sm bg-[#0a2d4a] rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-xs font-bold text-[#85B7EB]/60 mb-0.5">{challenge.creator_name}</p>
              <div className="flex items-center justify-center gap-1">
                <Diamond className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                <p className={`text-2xl font-extrabold ${creatorWon ? "text-[#EF9F27]" : "text-white"}`}>
                  {creatorGems}
                </p>
              </div>
              <p className="text-[10px] text-[#85B7EB]/50 mt-0.5">{creatorCorrect}/5 correct</p>
              {creatorWon && <p className="text-[10px] font-bold text-[#EF9F27] mt-0.5">winner</p>}
            </div>
            <div className="px-2">
              <span className="text-[#85B7EB]/30 font-extrabold text-sm">vs</span>
            </div>
            <div className="text-center flex-1">
              <p className="text-xs font-bold text-[#85B7EB]/60 mb-0.5">{challenge.challenger_name || "friend"}</p>
              <div className="flex items-center justify-center gap-1">
                <Diamond className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                <p className={`text-2xl font-extrabold ${challengerWon ? "text-[#EF9F27]" : "text-white"}`}>
                  {challengerGems}
                </p>
              </div>
              <p className="text-[10px] text-[#85B7EB]/50 mt-0.5">{challengerCorrect}/5 correct</p>
              {challengerWon && <p className="text-[10px] font-bold text-[#EF9F27] mt-0.5">winner</p>}
            </div>
          </div>
          {tied && <p className="text-center text-sm font-bold text-[#85B7EB] mt-2">it&apos;s a tie!</p>}
        </div>

        {/* H2H rivalry card */}
        {h2hRecord && currentUserId && (
          <div className="w-full max-w-sm mb-3 px-3.5 py-2.5 rounded-xl border flex items-center gap-2"
            style={{
              backgroundColor: (CATEGORY_COLORS[challenge.category] || "#378ADD") + "10",
              borderColor: (CATEGORY_COLORS[challenge.category] || "#378ADD") + "30",
            }}
          >
            <Swords className="w-4 h-4 shrink-0" style={{ color: CATEGORY_COLORS[challenge.category] || "#378ADD" }} />
            <span className="text-sm font-bold text-white">
              {formatH2HRecord(
                h2hRecord,
                currentUserId === challenge.creator_id
                  ? (challenge.challenger_name || "friend")
                  : challenge.creator_name
              )}
            </span>
          </div>
        )}

        <p className="text-[#85B7EB]/40 text-[10px] mb-4 max-w-[260px]">
          harder questions = more gems per answer, so difficulty matters
        </p>

        <div className="w-full max-w-sm space-y-2.5">
          {currentUserId && (
            <RematchButton
              category={challenge.category}
              opponentName={
                currentUserId === challenge.creator_id
                  ? (challenge.challenger_name || "friend")
                  : challenge.creator_name
              }
            />
          )}
          <a
            href="/home"
            className="w-full bg-[#0a2d4a] text-[#85B7EB] rounded-xl py-3 flex items-center justify-center font-bold text-sm"
          >
            home
          </a>
        </div>
      </div>
    )
  }

  // Check if challenge has expired (48 hours)
  if (challenge.status === "pending" && isChallengeExpired(challenge)) {
    return (
      <div className="min-h-[100dvh] bg-[#021f3d] flex flex-col items-center justify-center px-5 text-center relative">
        <Link href="/home" className="absolute top-6 left-5 text-[#85B7EB]/50 text-sm font-medium hover:text-[#85B7EB] transition-colors inline-flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          home
        </Link>
        <Clock className="w-12 h-12 text-[#85B7EB]/30 mb-3" />
        <h1 className="text-lg font-extrabold text-white mb-1">challenge expired</h1>
        <p className="text-[#85B7EB]/60 text-xs mb-5 max-w-[260px]">
          This challenge from {challenge.creator_name} has expired. Challenges last 48 hours.
        </p>
        <a
          href="/home"
          className="bg-[#378ADD] text-white rounded-xl py-3 px-6 font-bold flex items-center gap-2 text-sm"
        >
          create a new challenge <ChevronRight className="w-4 h-4" strokeWidth={3} />
        </a>
      </div>
    )
  }

  // If creator is viewing their own pending challenge, show status
  if (isOwnChallenge && challenge.status === "pending") {
    const hasPlayed = challenge.creator_score >= 0
    const timeRemaining = getChallengeTimeRemaining(challenge)
    return (
      <div className="min-h-[100dvh] bg-[#021f3d] flex flex-col items-center justify-center px-5 text-center relative">
        <Link href="/home" className="absolute top-6 left-5 text-[#85B7EB]/50 text-sm font-medium hover:text-[#85B7EB] transition-colors inline-flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          home
        </Link>
        <Swords className="w-12 h-12 text-[#378ADD] mb-3" />
        <h1 className="text-xl font-extrabold text-white mb-1">your challenge</h1>
        <p className="text-[#85B7EB]/60 text-sm mb-1.5">
          {getCategoryDisplay(challenge.category)}
        </p>
        {hasPlayed ? (
          <>
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Diamond className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
              <span className="text-2xl font-extrabold text-white">{challenge.creator_score}</span>
              <span className="text-sm text-[#85B7EB]/60">gems</span>
            </div>
            <p className="text-[#85B7EB]/40 text-xs mb-4">
              waiting for your friend to play
            </p>
          </>
        ) : (
          <p className="text-[#85B7EB]/40 text-xs mb-4">
            share the link and play your round
          </p>
        )}
        {timeRemaining && (
          <div className="flex items-center gap-1.5 text-[#EF9F27]/70 text-xs mb-4">
            <Clock className="w-3.5 h-3.5" />
            <span>expires in {timeRemaining.hours}h {timeRemaining.minutes}m</span>
          </div>
        )}
        <a
          href="/home"
          className="bg-[#378ADD] text-white rounded-xl py-3.5 px-6 font-bold flex items-center gap-2 text-sm"
        >
          back to home <ChevronRight className="w-4 h-4" strokeWidth={3} />
        </a>
      </div>
    )
  }

  // Challenge pending — show accept screen for the challenger
  const hasCreatorScore = challenge.creator_score >= 0
  const timeRemaining = getChallengeTimeRemaining(challenge)
  return (
    <div className="min-h-[100dvh] bg-[#021f3d] flex flex-col items-center justify-center px-5 text-center relative">
      <Link href="/home" className="absolute top-6 left-5 text-[#85B7EB]/50 text-sm font-medium hover:text-[#85B7EB] transition-colors inline-flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" />
        home
      </Link>
      <Swords className="w-12 h-12 text-[#378ADD] mb-3" />
      <h1 className="text-xl font-extrabold text-white mb-1">
        {challenge.creator_name} challenged you!
      </h1>
      <p className="text-[#85B7EB]/60 text-sm mb-1.5">
        {hasCreatorScore
          ? <>{challenge.creator_name} scored <Diamond className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B] inline" /> {challenge.creator_score} gems in {getCategoryDisplay(challenge.category)} — can you beat that?</>
          : `head-to-head in ${getCategoryDisplay(challenge.category)}`
        }
      </p>
      <p className="text-[#85B7EB]/40 text-xs mb-2">
        5 questions · adaptive difficulty · most gems wins
      </p>
      {timeRemaining && (
        <div className="flex items-center gap-1.5 text-[#EF9F27]/70 text-xs mb-4">
          <Clock className="w-3.5 h-3.5" />
          <span>expires in {timeRemaining.hours}h {timeRemaining.minutes}m</span>
        </div>
      )}

      <button
        onClick={() => {
          router.push(`/play?challenge=true&category=${encodeURIComponent(challenge.category)}&challengeCode=${challenge.share_code}`)
        }}
        className="w-full max-w-xs bg-[#378ADD] text-white rounded-xl py-3.5 px-5 flex items-center justify-center gap-2 font-extrabold text-base shadow-lg shadow-[#378ADD]/30 active:scale-[0.98]"
      >
        accept challenge
        <ChevronRight className="w-5 h-5" strokeWidth={3} />
      </button>

      <a
        href="/home"
        className="text-[#85B7EB]/50 text-sm font-medium mt-3"
      >
        or play solo instead
      </a>
    </div>
  )
}

export default function ChallengePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] bg-[#021f3d] flex flex-col items-center justify-center">
        <Spinner className="w-8 h-8 text-[#378ADD]" />
        <p className="text-[#85B7EB] mt-4 font-medium">loading challenge...</p>
      </div>
    }>
      <ChallengePageContent />
    </Suspense>
  )
}
