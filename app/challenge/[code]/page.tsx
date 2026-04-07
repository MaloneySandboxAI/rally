"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getChallenge, isChallengeExpired, getChallengeTimeRemaining, type Challenge } from "@/lib/challenges"
import { Spinner } from "@/components/ui/spinner"
import { Diamond, Trophy, Swords, ChevronRight, Clock } from "lucide-react"

const CATEGORIES: Record<string, string> = {
  "Algebra": "Algebra",
  "Reading Comprehension": "Reading",
  "Grammar": "Grammar",
  "Data & Statistics": "Data & Stats",
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

  useEffect(() => {
    if (!code) return

    async function load() {
      const c = await getChallenge(code)
      if (!c) {
        setError("Challenge not found — the link may be expired or invalid.")
      } else {
        setChallenge(c)
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
      <div className="min-h-[100dvh] bg-[#021f3d] flex flex-col items-center justify-center px-5 text-center">
        <Swords className="w-12 h-12 text-[#378ADD]/40 mb-3" />
        <h1 className="text-lg font-extrabold text-white mb-1">challenge not found</h1>
        <p className="text-[#85B7EB]/60 text-xs mb-5">{error}</p>
        <a href="/" className="bg-[#378ADD] text-white rounded-xl py-3 px-6 font-bold text-sm">
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
      <div className="min-h-[100dvh] bg-[#021f3d] flex flex-col items-center justify-center px-5 text-center">
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

        <p className="text-[#85B7EB]/40 text-[10px] mb-4 max-w-[260px]">
          harder questions = more gems per answer, so difficulty matters
        </p>

        <a
          href="/"
          className="bg-[#378ADD] text-white rounded-xl py-3 px-6 font-bold flex items-center gap-2 text-sm"
        >
          play more <ChevronRight className="w-4 h-4" strokeWidth={3} />
        </a>
      </div>
    )
  }

  // Check if challenge has expired (48 hours)
  if (challenge.status === "pending" && isChallengeExpired(challenge)) {
    return (
      <div className="min-h-[100dvh] bg-[#021f3d] flex flex-col items-center justify-center px-5 text-center">
        <Clock className="w-12 h-12 text-[#85B7EB]/30 mb-3" />
        <h1 className="text-lg font-extrabold text-white mb-1">challenge expired</h1>
        <p className="text-[#85B7EB]/60 text-xs mb-5 max-w-[260px]">
          This challenge from {challenge.creator_name} has expired. Challenges last 48 hours.
        </p>
        <a
          href="/"
          className="bg-[#378ADD] text-white rounded-xl py-3 px-6 font-bold flex items-center gap-2 text-sm"
        >
          create a new challenge <ChevronRight className="w-4 h-4" strokeWidth={3} />
        </a>
      </div>
    )
  }

  // Challenge pending — show accept screen
  const hasCreatorScore = challenge.creator_score >= 0
  const timeRemaining = getChallengeTimeRemaining(challenge)
  return (
    <div className="min-h-[100dvh] bg-[#021f3d] flex flex-col items-center justify-center px-5 text-center">
      <Swords className="w-12 h-12 text-[#378ADD] mb-3" />
      <h1 className="text-xl font-extrabold text-white mb-1">you&apos;ve been challenged!</h1>
      <p className="text-[#85B7EB]/60 text-sm mb-1.5">
        {hasCreatorScore
          ? <>{challenge.creator_name} earned <Diamond className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B] inline" /> {challenge.creator_score} gems in {getCategoryDisplay(challenge.category)}</>
          : `${challenge.creator_name} challenged you in ${getCategoryDisplay(challenge.category)}`
        }
      </p>
      <p className="text-[#85B7EB]/40 text-xs mb-2">
        play 5 questions at your level · most gems wins
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
        href="/"
        className="text-[#85B7EB]/50 text-sm font-medium mt-3"
      >
        or play solo instead
      </a>
    </div>
  )
}
