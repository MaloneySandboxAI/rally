"use client"

import { ArrowRight } from "lucide-react"

interface GameCardProps {
  friendName: string
  friendInitials: string
  avatarColor: string
  accentColor: string
  subject: string
  round: number
  userScore: number
  friendScore: number
  isYourTurn: boolean
}

export function GameCard({
  friendName,
  friendInitials,
  avatarColor,
  accentColor,
  subject,
  round,
  userScore,
  friendScore,
  isYourTurn,
}: GameCardProps) {
  // Determine game status
  const getStatus = () => {
    if (userScore > friendScore) return "winning"
    if (userScore < friendScore) return "losing"
    return "tied"
  }

  const status = getStatus()

  // Status label colors
  const getStatusColor = () => {
    switch (status) {
      case "winning":
        return "#16a34a" // green
      case "losing":
        return "#dc2626" // red
      case "tied":
        return "#d97706" // amber
    }
  }

  return (
    <button 
      className={`w-full bg-white rounded-2xl p-4 flex items-center gap-4 transition-all active:scale-[0.98] border-l-4 shadow-lg shadow-black/10`}
      style={{ borderLeftColor: accentColor }}
      aria-label={`Game with ${friendName}, ${subject}, Round ${round}, Score ${userScore} to ${friendScore}, ${isYourTurn ? "Your turn" : "Their turn"}`}
    >
      {/* Avatar */}
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: avatarColor }}
      >
        <span className="text-sm font-extrabold text-white">
          {friendInitials}
        </span>
      </div>
      
      {/* Game Info */}
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[#0a1628] truncate">
            {friendName}
          </span>
          <TurnBadge isYourTurn={isYourTurn} />
        </div>
        <p className="text-sm text-[#6b7280] mt-0.5">
          {subject} · Round {round}
        </p>
      </div>
      
      {/* Score */}
      <div className="text-right shrink-0 flex flex-col items-end">
        <span className="text-[24px] font-[800] leading-tight text-[#0a1628]">
          {userScore}–{friendScore}
        </span>
        <span 
          className="text-[10px] font-bold uppercase tracking-wide mt-0.5"
          style={{ color: getStatusColor() }}
        >
          {status}
        </span>
      </div>
    </button>
  )
}

function TurnBadge({ isYourTurn }: { isYourTurn: boolean }) {
  if (isYourTurn) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#378ADD] text-white">
        your turn
        <ArrowRight className="w-3 h-3" />
      </span>
    )
  }
  
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#e5e7eb] text-[#4b5563]">
      their turn
    </span>
  )
}
