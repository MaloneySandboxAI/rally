"use client"

import { Gamepad2, BarChart3, Trophy, Store, GraduationCap } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

type NavItem = {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { id: "games", label: "games", href: "/", icon: Gamepad2 },
  { id: "stats", label: "stats", href: "/stats", icon: BarChart3 },
  { id: "ranks", label: "ranks", href: "/ranks", icon: Trophy },
  { id: "ap", label: "AP Tests", href: "/ap", icon: GraduationCap },
  { id: "store", label: "store", href: "/store", icon: Store },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 pb-safe">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.id}
              href={item.href}
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
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
