"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

// ============================================================
// FREE CALCULATOR — open-source SAT-style calculator
// ------------------------------------------------------------
// Drop-in replacement for DesmosCalculator. Same `isVisible` prop,
// same dark Rally theme, same WorkArea integration.
//
// Stack (all MIT / Apache 2.0 — safe for commercial use):
//   - MathLive       virtual-keyboard equation input
//   - math.js        expression parsing + evaluation
//   - function-plot  2D function graphing
//
// Bundle impact: ~1.5MB, but only loaded when the calculator tab
// opens (dynamic import). Doesn't touch the main bundle.
// ============================================================

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "math-field": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "virtual-keyboard-mode"?: string
        "math-virtual-keyboard-policy"?: string
      }
    }
  }
  interface MathfieldElement extends HTMLElement {
    value: string
  }
}

interface FreeCalculatorProps {
  isVisible: boolean
}

interface Expression {
  id: number
  color: string
  latex: string
}

interface ResultState {
  display?: string
  error?: boolean
}

const COLORS = ["#378ADD", "#22C55E", "#F97316", "#EC4899", "#A855F7", "#F59E0B"]

let _exprIdCounter = 1
const nextId = () => _exprIdCounter++

function latexToMathJs(latex: string): string {
  if (!latex) return ""
  let s = latex
  s = s.replace(/\\left/g, "").replace(/\\right/g, "")
  s = s.replace(/\\,/g, " ").replace(/\\!/g, "").replace(/\\ /g, " ")
  s = s
    .replace(/\\cdot/g, "*")
    .replace(/\\times/g, "*")
    .replace(/\\ast/g, "*")
    .replace(/\\div/g, "/")
  s = s.replace(/[·×∗]/g, "*").replace(/÷/g, "/")
  s = s.replace(/\\pi/g, "pi")
  let prev: string
  do {
    prev = s
    s = s.replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "(($1)/($2))")
  } while (s !== prev)
  do {
    prev = s
    s = s.replace(/\\sqrt\s*\{([^{}]*)\}/g, "sqrt($1)")
  } while (s !== prev)
  s = s.replace(/\\sqrt\[([^\]]+)\]\s*\{([^{}]*)\}/g, "nthRoot($2,$1)")
  s = s.replace(/\\sin/g, "sin").replace(/\\cos/g, "cos").replace(/\\tan/g, "tan")
  s = s.replace(/\\arcsin/g, "asin").replace(/\\arccos/g, "acos").replace(/\\arctan/g, "atan")
  s = s.replace(/\\log/g, "log10").replace(/\\ln/g, "log").replace(/\\exp/g, "exp")
  s = s.replace(/\\abs/g, "abs")
  do {
    prev = s
    s = s.replace(/\^\s*\{([^{}]*)\}/g, "^($1)")
  } while (s !== prev)
  s = s.replace(/(\d)([a-zA-Z(])/g, "$1*$2")
  s = s.replace(/(\))(\d|[a-zA-Z(])/g, "$1*$2")
  s = s.replace(/^\s*[yY]\s*=\s*/, "")
  s = s.replace(/^\s*[a-zA-Z]\s*\(\s*x\s*\)\s*=\s*/, "")
  return s.trim()
}

export function FreeCalculator({ isVisible }: FreeCalculatorProps) {
  const plotRef = useRef<HTMLDivElement>(null)
  const mfRefs = useRef<Map<number, MathfieldElement | null>>(new Map())
  const libsRef = useRef<{
    math: typeof import("mathjs")
    functionPlot: typeof import("function-plot").default
  } | null>(null)

  const [expressions, setExpressions] = useState<Expression[]>(() => [
    { id: nextId(), color: COLORS[0], latex: "" },
  ])
  const [results, setResults] = useState<Record<number, ResultState>>({})
  const [libsLoaded, setLibsLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      import("mathlive"),
      import("mathjs"),
      import("function-plot"),
    ])
      .then(([_ml, math, fp]) => {
        if (cancelled) return
        libsRef.current = {
          math,
          functionPlot: (fp as unknown as { default: typeof import("function-plot").default }).default ?? (fp as unknown as typeof import("function-plot").default),
        }
        setLibsLoaded(true)
      })
      .catch((err) => {
        console.error("Calculator: failed to load libraries", err)
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const recompute = useCallback(() => {
    if (!libsRef.current) return
    const { math, functionPlot } = libsRef.current

    const newResults: Record<number, ResultState> = {}
    const plotData: Array<{ fn: string; color: string; graphType: "polyline" }> = []

    for (const expr of expressions) {
      const raw = (expr.latex || "").trim()
      if (!raw) {
        newResults[expr.id] = {}
        continue
      }
      const mathStr = latexToMathJs(raw)
      if (!mathStr) {
        newResults[expr.id] = {}
        continue
      }

      const hasX = /\bx\b/.test(mathStr)
      if (hasX) {
        try {
          math.parse(mathStr)
          plotData.push({ fn: mathStr, color: expr.color, graphType: "polyline" })
          newResults[expr.id] = {}
        } catch {
          newResults[expr.id] = { error: true }
        }
      } else {
        try {
          const value = math.evaluate(mathStr)
          const display =
            typeof value === "number"
              ? Number.isInteger(value)
                ? String(value)
                : String(+value.toFixed(8))
              : String(value)
          newResults[expr.id] = { display: `= ${display}` }
        } catch {
          newResults[expr.id] = {}
        }
      }
    }

    setResults(newResults)

    const target = plotRef.current
    if (!target) return
    target.innerHTML = ""
    if (plotData.length === 0) return
    const rect = target.getBoundingClientRect()
    try {
      functionPlot({
        target,
        width: rect.width || 320,
        height: rect.height || 240,
        grid: true,
        xAxis: { domain: [-10, 10] },
        yAxis: { domain: [-10, 10] },
        data: plotData,
      })
    } catch (err) {
      console.warn("Calculator: plot render error", err)
    }
  }, [expressions])

  useEffect(() => {
    if (libsLoaded) recompute()
  }, [libsLoaded, recompute])

  useEffect(() => {
    if (!libsLoaded) return
    const teardowns: Array<() => void> = []
    for (const expr of expressions) {
      const mf = mfRefs.current.get(expr.id)
      if (!mf) continue

      if (mf.value !== expr.latex) mf.value = expr.latex

      const onInput = () => {
        const newLatex = mf.value
        setExpressions((cur) =>
          cur.map((e) => (e.id === expr.id ? { ...e, latex: newLatex } : e)),
        )
      }
      const onKeydown = (e: Event) => {
        const ke = e as KeyboardEvent
        if (ke.key === "Enter") {
          ke.preventDefault()
          addExpression()
        }
      }
      mf.addEventListener("input", onInput)
      mf.addEventListener("keydown", onKeydown)
      teardowns.push(() => {
        mf.removeEventListener("input", onInput)
        mf.removeEventListener("keydown", onKeydown)
      })
    }
    return () => teardowns.forEach((fn) => fn())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expressions, libsLoaded])

  useEffect(() => {
    if (isVisible && libsLoaded) {
      const t = setTimeout(() => recompute(), 50)
      return () => clearTimeout(t)
    }
  }, [isVisible, libsLoaded, recompute])

  const addExpression = useCallback(() => {
    setExpressions((cur) => {
      const color = COLORS[cur.length % COLORS.length]
      return [...cur, { id: nextId(), color, latex: "" }]
    })
  }, [])

  const removeExpression = useCallback((id: number) => {
    setExpressions((cur) => (cur.length > 1 ? cur.filter((e) => e.id !== id) : cur))
    mfRefs.current.delete(id)
  }, [])

  const hasAnyPlot = useMemo(
    () => expressions.some((e) => /\bx\b/.test(latexToMathJs(e.latex))),
    [expressions],
  )

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 text-[#85B7EB]/60">
        <p className="text-sm font-medium">calculator unavailable</p>
        <p className="text-xs">check your internet connection</p>
      </div>
    )
  }

  if (!libsLoaded) {
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
    <div className="h-full flex flex-col gap-2 min-h-0">
      <div className="flex-shrink-0 max-h-[45%] overflow-y-auto rounded-xl border border-[#378ADD]/15 bg-white/5">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#378ADD]/15">
          <span className="text-xs font-bold text-[#85B7EB]/80">expressions</span>
          <button
            type="button"
            onClick={addExpression}
            className="text-xs font-bold px-2 py-1 rounded-md bg-[#378ADD]/25 text-[#378ADD] hover:bg-[#378ADD]/40 transition-all"
          >
            + add
          </button>
        </div>
        <div className="p-2 flex flex-col gap-1.5">
          {expressions.map((expr) => {
            const r = results[expr.id] ?? {}
            return (
              <div
                key={expr.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5 border border-white/5 focus-within:border-[#378ADD]/40"
              >
                <span
                  aria-hidden
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: expr.color }}
                />
                <math-field
                  ref={(el: MathfieldElement | null) => {
                    if (el) mfRefs.current.set(expr.id, el)
                    else mfRefs.current.delete(expr.id)
                  }}
                  virtual-keyboard-mode="manual"
                  style={{
                    flex: "1 1 auto",
                    minWidth: 0,
                    fontSize: "15px",
                    background: "transparent",
                    color: "#fff",
                    border: "none",
                    outline: "none",
                  }}
                />
                {r.display && (
                  <span className="text-xs font-bold text-[#378ADD] whitespace-nowrap font-mono">
                    {r.display}
                  </span>
                )}
                {r.error && (
                  <span className="text-xs text-red-400 whitespace-nowrap">?</span>
                )}
                {expressions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExpression(expr.id)}
                    aria-label="Remove expression"
                    className="text-[#85B7EB]/40 hover:text-red-400 text-sm leading-none flex-shrink-0 px-1"
                  >
                    ×
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex-1 relative rounded-xl overflow-hidden border border-[#378ADD]/15 bg-[#021f3d] min-h-0">
        <div ref={plotRef} className="w-full h-full" />
        {!hasAnyPlot && (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[#85B7EB]/40 pointer-events-none px-4 text-center">
            type an expression with <code className="mx-1 text-[#378ADD]/70">x</code> to plot
          </div>
        )}
      </div>

      <p className="text-[9px] text-[#85B7EB]/40 text-center flex-shrink-0">
        practicing for the SAT?{" "}
        <a
          href="https://www.desmos.com/calculator"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#378ADD] hover:underline"
        >
          open the official Desmos →
        </a>
      </p>
    </div>
  )
}
