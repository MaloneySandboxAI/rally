import Link from "next/link"
import { Store } from "lucide-react"

export default function StorePage() {
  return (
    <div className="min-h-screen bg-[#021f3d] pb-24">
      <header className="sticky top-0 z-10 bg-[#021f3d] px-5 pt-6 pb-4 border-b border-[#0a2d4a]">
        <Link href="/" className="text-[#85B7EB]/50 text-sm font-medium hover:text-[#85B7EB] transition-colors block mb-3">
          ← home
        </Link>
        <div className="flex items-center gap-3">
          <Store className="w-6 h-6 text-[#378ADD]" />
          <h1 className="text-2xl font-extrabold text-white">store</h1>
        </div>
      </header>
      <main className="px-5 py-10 max-w-lg mx-auto flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#0a2d4a] flex items-center justify-center mb-2">
          <Store className="w-8 h-8 text-[#378ADD]" />
        </div>
        <h2 className="text-xl font-extrabold text-white">store coming soon</h2>
        <p className="text-[#85B7EB]/60 text-sm max-w-xs">
          Spend your gems on boosts, streak shields, and more. Coming soon.
        </p>
        <Link
          href="/"
          className="mt-4 bg-[#378ADD] text-white rounded-2xl py-3 px-8 font-bold text-sm transition-all hover:brightness-110"
        >
          keep earning gems
        </Link>
      </main>
    </div>
  )
}
