"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getChallenge, type Challenge } from "@/lib/challenges"
import { Spinner } from "@/components/ui/spinner"
import { Diamond, Trophy, Swords, ChevronRight } from "lucide-react"

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
      } else if (c.status === "completed") {
        // Already completed — show results
        setChallenge(c)
      } else {
        setChallenge(c)
      }
      setLoading(false)
    }

    load()
  }, [code])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#021f3d] flex flex-col items-center justify-center">
        <Spinner className="w-8 h-8 text-[#378ADD]" />
        <p className="text-[#85B7EB] mt-4 font-medium">loading challenge...</p>
      </div>
    )
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-[#021f3d] flex flex-col items-center justify-center px-6 text-center">
        <Swords className="w-16 h-16 text-[#378ADD]/40 mb-4" />
        <h1 className="text-xl font-extrabold text-white mb-2">challenge not found</h1>
        <p className="text-[#85B7EB]/60 text-sm mb-6">{error}</p>
        <a
          href="/"
          className="bg-[#378ADD] text-white rounded-2xl py-3 px-6 font-bold"
        >
          play solo instead
        </a>
      </div>
    )
  }

  // Challenge already completed — show head-to-head results
  if (challenge.status === "completed") {
    const creatorWon = (challenge.creator_score ?? 0) > (challenge.challenger_score ?? 0)
    const challengerWon = (challenge.challenger_score ?? 0) > (challenge.creator_score ?? 0)
    const tied = challenge.creator_score === challenge.challenger_score

    return (
      <div className="min-h-screen bg-[#021f3d] flex flex-col items-center justify-center px-6 text-center">
        <Trophy className="w-16 h-16 text-[#EF9F27] mb-4" />
        <h1 className="text-2xl font-extrabold text-white mb-1">challenge complete</h1>
        <p className="text-[#85B7EB]/60 text-sm mb-8">{getCategoryDisplay(challenge.category)}</p>

        {/* Head to head */}
        <div className="w-full max-w-sm bg-[#0a2d4a] rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-center flex-1">
              <p className="text-sm font-bold text-[#85B7EB]/60 mb-1">{challenge.creator_name}</p>
              <p className={`text-4xl font-extrabold ${creatorWon ? "text-[#EF9F27]" : "text-white"}`}>
                {challenge.creator_score}/5
              </p>
              {creatorWon && <p className="text-xs font-bold text-[#EF9F27] mt-1">winner</p>}
            </div>
            <div className="px-4">
              <span className="text-[#85B7EB]/30 font-extrabold text-lg">vs</span>
            </div>
            <div className="text-center flex-1">
              <p className="text-sm font-bold text-[#85B7EB]/60 mb-1">{challenge.challenger_name || "friend"}</p>
              <p className={`text-4xl font-extrabold ${challengerWon ? "text-[#EF9F27]" : "text-white"}`}>
                {challenge.challenger_score}/5
              </p>
              {challengerWon && <p className="text-xs font-bold text-[#EF9F27] mt-1">winner</p>}
            </div>
          </div>
          {tied && <p className="text-center text-sm font-bold text-[#85B7EB]">it&apos;s a tie!</p>}
        </div>

        <a
          href="/"
          className="bg-[#378ADD] text-white rounded-2xl py-3 px-6 font-bold flex items-center gap-2"
        >
          play more
          <ChevronRight className="w-5 h-5" strokeWidth={3} />
        </a>
      </div>
    )
  }

  // Challenge is pending or created — show accept screen
  const hasCreatorScore = challenge.creator_score !== null
  return (
    <div className="min-h-screen bg-[#021f3d] flex flex-col items-center justify-center px-6 text-center">
      <Swords className="w-16 h-16 text-[#378ADD] mb-4" />
      <h1 className="text-2xl font-extrabold text-white mb-1">you&apos;ve been challenged!</h1>
      <p className="text-[#85B7EB]/60 text-sm mb-2">
        {hasCreatorScore
          ? `${challenge.creator_name} scored ${challenge.creator_score}/5 in ${getCategoryDisplay(challenge.category)}`
          : `${challenge.creator_name} challenged you in ${getCategoryDisplay(challenge.category)}`
        }
      </p>
      <p className="text-[#85B7EB]/40 text-xs mb-8">
        play the same 5 questions and see who wins
      </p>

      <button
        onClick={() => {
          // Navigate to play page with challenge context
          router.push(`/play?challenge=true&category=${encodeURIComponent(challenge.category)}&challengeCode=${challenge.share_code}`)
        }}
        className="w-full max-w-xs bg-[#378ADD] text-white rounded-2xl py-4 px-6 flex items-center justify-center gap-2 font-extrabold text-lg shadow-lg shadow-[#378ADD]/30 transition-all active:scale-[0.98] hover:brightness-110"
      >
        accept challenge
        <ChevronRight className="w-5 h-5" strokeWidth={3} />
      </button>

      <a
        href="/"
        className="text-[#85B7EB]/50 text-sm font-medium mt-4 hover:text-[#85B7EB] transition-colors"
      >
        or play solo instead
      </a>
    </div>
  )
}
