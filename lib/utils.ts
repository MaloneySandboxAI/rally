import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Get the display-friendly base URL (no protocol prefix) for share cards */
export function getBaseUrl(override?: string): string {
  if (override) return override.replace(/^https?:\/\//, "")
  if (typeof window !== "undefined") {
    const envUrl = process.env.NEXT_PUBLIC_APP_URL
    return (envUrl || window.location.origin).replace(/^https?:\/\//, "")
  }
  return "rallyplaylive.com"
}
