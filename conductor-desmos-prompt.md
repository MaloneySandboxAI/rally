# Conductor Prompt: Replace Built-in Calculator with Desmos Graphing Calculator

## Goal
Replace the current basic calculator tab in the WorkArea bottom sheet with an embedded Desmos graphing calculator — the same calculator students use on the real SAT (Bluebook). This gives students authentic test-day practice with the tool they'll actually have.

## Context
- Rally is an SAT/AP prep app (Next.js 14, App Router, TypeScript, Tailwind)
- The WorkArea component (`components/rally/work-area.tsx`) is a bottom sheet with 3 tabs: Notepad, Calculator, Draw
- The current "Calculator" tab is a custom-built basic calculator (~350 lines of code in the same file)
- Categories have an `isMath` flag in `lib/categories.ts` — Algebra, Data & Statistics, and AP Pre Calculus are math categories
- The WorkArea is used on the play page (`app/play/page.tsx`) during gameplay
- The app already passes `isMathCategory` from the category config

## What to Build

### 1. Add Desmos Script to App Layout

In `app/layout.tsx`, add the Desmos API script tag in the `<head>`:

```html
<script src="https://www.desmos.com/api/v1.12/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6" async></script>
```

Use the **demo API key** `dcb31709b452b1cf9dc26972add0fda6` for now (this is the public demo key from Desmos docs). Add `async` so it doesn't block page load.

Also add a TypeScript type declaration. Create `types/desmos.d.ts`:

```typescript
declare namespace Desmos {
  interface Calculator {
    destroy(): void
    resize(): void
    setBlank(): void
    getState(): unknown
    setState(state: unknown): void
  }

  interface CalculatorOptions {
    expressions?: boolean
    settingsMenu?: boolean
    zoomButtons?: boolean
    expressionsTopbar?: boolean
    pointsOfInterest?: boolean
    trace?: boolean
    border?: boolean
    lockViewport?: boolean
    expressionsCollapsed?: boolean
    administerSecretFolders?: boolean
    images?: boolean
    folders?: boolean
    notes?: boolean
    sliders?: boolean
    links?: boolean
    qwertyKeyboard?: boolean
    restrictedFunctions?: boolean
    forceEnableGeometryFunctions?: boolean
    pasteGraphLink?: boolean
    pasteTableData?: boolean
    clearIntoDegreeMode?: boolean
    autosize?: boolean
    plotSingleVariableImplicitEquations?: boolean
    plotImplicits?: boolean
    plotInequalities?: boolean
  }

  function GraphingCalculator(
    element: HTMLElement,
    options?: CalculatorOptions
  ): Calculator

  function ScientificCalculator(
    element: HTMLElement,
    options?: Record<string, unknown>
  ): Calculator

  function FourFunctionCalculator(
    element: HTMLElement,
    options?: Record<string, unknown>
  ): Calculator
}
```

### 2. Create Desmos Calculator Component

Create `components/rally/desmos-calculator.tsx`:

```typescript
"use client"

import { useRef, useEffect, useState, useCallback } from "react"

// ============================================================
// DESMOS CALCULATOR — embeds the real SAT graphing calculator
// Toggles between Graphing and Scientific modes, just like Bluebook.
// ============================================================

interface DesmosCalculatorProps {
  /** Whether this tab is currently visible (controls resize calls). */
  isVisible: boolean
}

export function DesmosCalculator({ isVisible }: DesmosCalculatorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const calcRef = useRef<Desmos.Calculator | null>(null)
  const [mode, setMode] = useState<"graphing" | "scientific">("graphing")
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  // Check if Desmos script has loaded
  useEffect(() => {
    function checkDesmos() {
      if (typeof Desmos !== "undefined") {
        setLoaded(true)
        return true
      }
      return false
    }
    if (checkDesmos()) return

    // Poll briefly in case the async script hasn't loaded yet
    const interval = setInterval(() => {
      if (checkDesmos()) clearInterval(interval)
    }, 200)

    // Give up after 8 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval)
      if (typeof Desmos === "undefined") setError(true)
    }, 8000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  // Initialize or switch calculator
  const initCalc = useCallback(() => {
    if (!containerRef.current || !loaded) return

    // Destroy previous instance
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

  // Resize when tab becomes visible (Desmos needs this when container was hidden)
  useEffect(() => {
    if (isVisible && calcRef.current) {
      // Small delay to let the container settle after tab switch
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

      {/* Desmos mounts here */}
      <div
        ref={containerRef}
        className="flex-1 rounded-xl overflow-hidden border border-[#378ADD]/15"
        style={{ minHeight: 0 }}
      />

      {/* Attribution */}
      <p className="text-[9px] text-[#85B7EB]/30 text-center flex-shrink-0">
        powered by Desmos · same calculator used on the SAT
      </p>
    </div>
  )
}
```

### 3. Update WorkArea to Use Desmos Calculator

In `components/rally/work-area.tsx`:

**A) Add a new prop `isMath` to WorkAreaProps:**

```typescript
interface WorkAreaProps {
  isOpen: boolean
  onClose: () => void
  questionText?: string
  questionKey?: string | number
  /** Whether the current category is math — controls which calculator to show. */
  isMath?: boolean
}
```

**B) Import the Desmos component at the top:**

```typescript
import { DesmosCalculator } from "@/components/rally/desmos-calculator"
```

**C) Replace the Calculator tab content:**

Find the calculator tab content section (around line 157-165):

```typescript
<div className={activeTab === "calc" ? "h-full" : "hidden"}>
  <CalculatorTab
    display={calcDisplay} setDisplay={setCalcDisplay}
    expression={calcExpression} setExpression={setCalcExpression}
    memory={calcMemory} setMemory={setCalcMemory}
    previousValue={calcPreviousValue} setPreviousValue={setCalcPreviousValue}
    operation={calcOperation} setOperation={setCalcOperation}
    waitingForOperand={calcWaitingForOperand} setWaitingForOperand={setCalcWaitingForOperand}
  />
</div>
```

Replace with:

```typescript
<div className={activeTab === "calc" ? "h-full" : "hidden"}>
  {isMath ? (
    <DesmosCalculator isVisible={activeTab === "calc"} />
  ) : (
    <CalculatorTab
      display={calcDisplay} setDisplay={setCalcDisplay}
      expression={calcExpression} setExpression={setCalcExpression}
      memory={calcMemory} setMemory={setCalcMemory}
      previousValue={calcPreviousValue} setPreviousValue={setCalcPreviousValue}
      operation={calcOperation} setOperation={setCalcOperation}
      waitingForOperand={calcWaitingForOperand} setWaitingForOperand={setCalcWaitingForOperand}
    />
  )}
</div>
```

This way:
- **Math categories** (Algebra, Data & Stats, AP Pre Calc) get the full Desmos graphing/scientific calculator — same as the real SAT
- **Non-math categories** (Reading, Grammar, AP Bio, APUSH, AP English) keep the simple built-in calculator for quick arithmetic

**D) Update the function signature to accept the new prop:**

```typescript
export function WorkArea({ isOpen, onClose, questionText, questionKey, isMath }: WorkAreaProps) {
```

### 4. Pass `isMath` from Play Page

In `app/play/page.tsx`, find where WorkArea is rendered (around line 1051):

```tsx
<WorkArea
  isOpen={showWorkArea}
  onClose={() => setShowWorkArea(false)}
  questionText={question?.question}
  questionKey={question?.id ?? currentQuestion}
/>
```

Add the `isMath` prop:

```tsx
<WorkArea
  isOpen={showWorkArea}
  onClose={() => setShowWorkArea(false)}
  questionText={question?.question}
  questionKey={question?.id ?? currentQuestion}
  isMath={isMathCategory}
/>
```

The `isMathCategory` variable is already defined at line 92 from the category config.

## Important Notes

- **DO NOT remove the existing CalculatorTab component** from work-area.tsx — it's still used for non-math categories
- **DO NOT remove the lifted calculator state** (calcDisplay, calcExpression, etc.) — still needed for the basic calculator
- The Desmos script loads async, so the component handles the loading state gracefully with a spinner
- The `resize()` call on tab switch is critical — Desmos can't measure its container when hidden, so it needs a nudge when it becomes visible
- Keep the existing tab structure (Notepad / Calculator / Draw) — just swap what renders inside the Calculator tab based on `isMath`
- The demo API key `dcb31709b452b1cf9dc26972add0fda6` is fine for development; we'll swap it for a production key later

## Files to Create
1. `types/desmos.d.ts` — TypeScript declarations for Desmos API

2. `components/rally/desmos-calculator.tsx` — Desmos embed component

## Files to Modify
1. `app/layout.tsx` — Add Desmos script tag in `<head>`
2. `components/rally/work-area.tsx` — Add `isMath` prop, import DesmosCalculator, conditionally render Desmos vs basic calc
3. `app/play/page.tsx` — Pass `isMath={isMathCategory}` to WorkArea

## Testing
1. Open a math category (Algebra) → open tools → Calculator tab should show Desmos graphing calculator
2. Toggle between graphing and scientific modes — both should work
3. Open a non-math category (Grammar) → Calculator tab should show the original basic calculator
4. Switch between Notepad/Calculator/Draw tabs — Desmos should resize properly on each switch back
5. Close and reopen WorkArea — calculator should reinitialize cleanly
