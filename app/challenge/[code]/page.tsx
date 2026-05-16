"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getChallenge, isChallengeExpired, getChallengeTimeRemaining, type Challenge } from "@/lib/challenges"
import { createClient } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"
import { Diamond, Trophy, Swords, ChevronRight, ChevronLeft, Clock } from "lucide-react"
import Link from "next/link"
import { ShareChallengeResultButton } from "@/components/rally/share-challenge-result-button"

const CATEGORIES: Record<string, string> = {
  "Algebra": "Algebra",
  "Reading Comprehension": "Reading",
  "Grammar": "Grammar",
  "Data & Statistics": "Data & Stats",
  "AP Biology": "AP Bio",
  "AP Pre Calculus": "AP Pre Calc",
  "AP US History": "APUSH",
  "AP English Language": "AP English",
}

function getCategoryDisplay(id: string): string {
  return CATEGORIES[id] || id
}

export default function ChallengePage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwnChallenge, setIsOwnChallenge] = useState(false)

  useEffect(() => {
    if (!code) return

    async function load() {
      const c = await getChallenge(code)
      if (!c) {
        setError("Challenge not found — the link may be expired or invalid.")
      } else {
        setChallenge(c)
        // Check if the current user is the creator (prevent self-challenge)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user && c.creator_id === user.id) {
          setIsOwnChallenge(true)
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

    // Count correct answers from results for the card
    const creatorCorrect = challenge.creator_results?.filter(r => r.isCorrect).length ?? 0
    const challengerCorrect = challenge.challenger_results?.filter(r => r.isCorrect).length ?? 0

    return (
      <div className="min-h-[100dvh] bg-[#021f3d] flex flex-col items-center justify-start px-5 pt-14 pb-8 text-center relative">
        <Link href="/home" className="absolute top-6 left-5 text-[#85B7EB]/50 text-sm font-medium hover:text-[#85B7EB] transition-colors inline-flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          home
        </Link>

        <div className="flex items-center gap-1.5 mb-1">
          <Trophy className="w-4 h-4 text-[#EF9F27]" />
          <p className="text-[10px] font-extrabold tracking-widest text-[#EF9F27] uppercase">challenge complete</p>
        </div>
        <p className="text-[#85B7EB]/60 text-xs mb-4">{getCategoryDisplay(challenge.category)}</p>

        {/* Share card + share button — the centerpiece. The card screenshots well
            and the share button fires the native share sheet on iOS/Android. */}
        <ShareChallengeResultButton
          creatorName={challenge.creator_name}
          challengerName={challenge.challenger_name || "friend"}
          creatorGems={creatorGems}
          challengerGems={challengerGems}
          creatorCorrect={creatorCorrect}
          challengerCorrect={challengerCorrect}
          category={challenge.category}
          shareCode={challenge.share_code}
        />

        <p className="text-[#85B7EB]/40 text-[10px] mt-4 mb-3 max-w-[280px]">
          harder questions = more gems per answer, so difficulty matters
        </p>

        <a
          href="/home"
          className="text-[#85B7EB]/70 hover:text-[#85B7EB] text-sm font-bold flex items-center gap-1 transition-colors"
        >
          play more <ChevronRight className="w-4 h-4" strokeWidth={3} />
        </a>
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
