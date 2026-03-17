"use client"

import { GameCard } from "./game-card"
import { EmptyGamesState } from "./empty-games-state"

// Set this to true to show fake data, false for empty state (new user)
const SHOW_DEMO_DATA = false

const games = SHOW_DEMO_DATA ? [
  {
    id: "1",
    friendName: "Sarah M.",
    friendInitials: "SM",
    avatarColor: "#F97316", // coral/orange
    accentColor: "#F97316", // coral/orange left border
    subject: "SAT Math",
    round: 4,
    userScore: 2,
    friendScore: 1,
    isYourTurn: true,
  },
  {
    id: "2",
    friendName: "Jake T.",
    friendInitials: "JT",
    avatarColor: "#14B8A6", // teal
    accentColor: "#14B8A6", // teal left border
    subject: "SAT Reading",
    round: 7,
    userScore: 3,
    friendScore: 3,
    isYourTurn: false,
  },
  {
    id: "3",
    friendName: "Emma L.",
    friendInitials: "EL",
    avatarColor: "#A855F7", // purple
    accentColor: "#A855F7", // purple left border
    subject: "SAT Writing",
    round: 2,
    userScore: 1,
    friendScore: 0,
    isYourTurn: true,
  },
] : []

export function GamesList() {
  if (games.length === 0) {
    return <EmptyGamesState />
  }

  return (
    <div className="flex flex-col gap-3">
      {games.map((game) => (
        <GameCard key={game.id} {...game} />
      ))}
    </div>
  )
}
