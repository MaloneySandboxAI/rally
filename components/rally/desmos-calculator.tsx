"use client"

import { useRef, useEffect, useState, useCallback } from "react"

// Embeds the real SAT graphing calculator (Desmos).
// Toggles between Graphing and Scientific modes, just like Bluebook.

interface DesmosCalculatorProps {
  isVisible: boolean
}

export function DesmosCalculator({ isVisible }: DesmosCalculatorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const calcRef = useRef<Desmos.Calculator | null>(null)
  const [mode, setMode] = useState<"graphing" | "scientific">("graphing")
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  // Poll for the async Desmos script to finish loading
  useEffect(() => {
    function checkDesmos() {
      if (typeof Desmos !== "undefined") {
        setLoaded(true)
        return true
      }
      return false
    }
    if (checkDesmos()) return

    const interval = setInterval(() => {
      if (checkDesmos()) clearInterval(interval)
    }, 200)

    const timeout = setTimeout(() => {
      clearInterval(interval)
      if (typeof Desmos === "undefined") setError(true)
    }, 8000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  const initCalc = useCallback(() => {
    if (!containerRef.current || !loaded) return

    if (calcRef.current) {
      calcRef.current.destroy()
      calcRef.current = null
    }

    try {
      if (mode === "graphing") {
        calcRef.current = Desmos.GraphingCalculator(containerRef.current, {
          expressions: true,
          settingsMenu: false,
          zoomButtons: true,
          expressionsTopbar: true,
          border: false,
          lockViewport: false,
          qwertyKeyboard: true,
          autosize: true,
        })
      } else {
        calcRef.current = Desmos.ScientificCalculator(containerRef.current, {})
      }
    } catch {
      setError(true)
    }
  }, [loaded, mode])

  useEffect(() => {
    initCalc()
    return () => {
      if (calcRef.current) {
        calcRef.current.destroy()
        calcRef.current = null
      }
    }
  }, [initCalc])

  // Desmos can't measure its container when hidden — nudge it on tab switch
  useEffect(() => {
    if (isVisible && calcRef.current) {
      const t = setTimeout(() => calcRef.current?.resize(), 50)
      return () => clearTimeout(t)
    }
  }, [isVisible])

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 text-[#85B7EB]/60">
        <p className="text-sm font-medium">calculator unavailable</p>
        <p className="text-xs">check your internet connection</p>
      </div>
    )
  }

  if (!loaded) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-[#85B7EB]/60 text-sm">
          <div className="w-4 h-4 border-2 border-[#378ADD]/40 border-t-[#378ADD] rounded-full animate-spin" />
          loading calculator…
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col gap-2">
      {/* Mode toggle — matches SAT Bluebook which offers both */}
      <div className="flex gap-1 flex-shrink-0">
        <button
          onClick={() => setMode("graphing")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mode === "graphing"
              ? "bg-[#378ADD]/25 text-[#378ADD] border border-[#378ADD]/40"
              : "bg-white/5 text-[#85B7EB]/50 hover:bg-white/10"
          }`}
        >
          graphing
        </button>
        <button
          onClick={() => setMode("scientific")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mode === "scientific"
              ? "bg-[#378ADD]/25 text-[#378ADD] border border-[#378ADD]/40"
              : "bg-white/5 text-[#85B7EB]/50 hover:bg-white/10"
          }`}
        >
          scientific
        </button>
      </div>

      <div
        ref={containerRef}
        className="flex-1 rounded-xl overflow-hidden border border-[#378ADD]/15"
        style={{ minHeight: 0 }}
      />

      <p className="text-[9px] text-[#85B7EB]/30 text-center flex-shrink-0">
        powered by Desmos · same calculator used on the SAT
      </p>
    </div>
  )
}
