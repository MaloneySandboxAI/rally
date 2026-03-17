"use client"

export function EmptyGamesState() {
  return (
    <div className="flex flex-col items-center text-center py-8">
      <div className="text-5xl mb-4">
        <span role="img" aria-label="target">&#127919;</span>
      </div>
      <h3 className="text-white font-extrabold text-lg mb-2">no active games yet</h3>
      <p className="text-[#85B7EB]/70 text-sm max-w-[240px]">
        challenge a friend to get started — or practice solo below
      </p>
    </div>
  )
}
