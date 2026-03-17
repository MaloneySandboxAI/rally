"use client"

import { Gamepad2, BarChart3, Trophy, Store } from "lucide-react"

type NavItem = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { id: "games", label: "games", icon: Gamepad2 },
  { id: "stats", label: "stats", icon: BarChart3 },
  { id: "ranks", label: "ranks", icon: Trophy },
  { id: "store", label: "store", icon: Store },
]

export function BottomNav() {
  const activeTab = "games"

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 pb-safe">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.id === activeTab
          
          return (
            <button
              key={item.id}
              className="flex flex-col items-center gap-1 min-w-[64px] transition-colors"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon 
                className={`w-6 h-6 ${
                  isActive ? "text-[#378ADD]" : "text-[#4a6080]"
                }`} 
              />
              <span 
                className={`text-xs font-bold ${
                  isActive ? "text-[#378ADD]" : "text-[#4a6080]"
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
