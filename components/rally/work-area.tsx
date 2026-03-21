"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { X, Undo2, Trash2, Calculator as CalculatorIcon, PenLine, StickyNote } from "lucide-react"

// ============================================================
// WORK AREA — bottom sheet with 3 tabs: Notepad, Calculator, Draw
// ============================================================

interface WorkAreaProps {
  isOpen: boolean
  onClose: () => void
}

type TabId = "notepad" | "calc" | "draw"

export function WorkArea({ isOpen, onClose }: WorkAreaProps) {
  const [activeTab, setActiveTab] = useState<TabId>("notepad")
  const sheetRef = useRef<HTMLDivElement>(null)

  // Scroll sheet to top whenever it opens
  useEffect(() => {
    if (isOpen && sheetRef.current) {
      sheetRef.current.scrollTop = 0
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Bottom sheet */}
      <div
        ref={sheetRef}
        className="relative bg-[#0a2d4a] rounded-t-3xl flex flex-col animate-in slide-in-from-bottom duration-300"
        style={{ height: "70vh", maxHeight: "70vh" }}
      >
        {/* Handle + close */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex-1" />
          <div className="w-10 h-1 rounded-full bg-[#85B7EB]/30" />
          <div className="flex-1 flex justify-end">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-[#85B7EB]" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 mb-2">
          {([
            { id: "notepad" as TabId, label: "Notepad", icon: StickyNote },
            { id: "calc" as TabId, label: "Calculator", icon: CalculatorIcon },
            { id: "draw" as TabId, label: "Draw", icon: PenLine },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-[#378ADD] text-white"
                  : "bg-white/5 text-[#85B7EB]/60 hover:bg-white/10"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 px-4 pb-4 overflow-hidden">
          {activeTab === "notepad" && <NotepadTab />}
          {activeTab === "calc" && <CalculatorTab />}
          {activeTab === "draw" && <DrawTab />}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// NOTEPAD TAB — lined text area for typing intermediate work
// ============================================================

function NotepadTab() {
  const [text, setText] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Don't auto-focus — it causes the browser to scroll down past the tabs

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#85B7EB]/50">jot your work here — it clears between questions</span>
        <button
          onClick={() => setText("")}
          className="text-xs text-red-400/70 hover:text-red-400 font-bold flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" /> clear
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={"e.g.\n2x + 3y = 12\ny = (12 - 2x) / 3\nplug into eq 2...\n4x - (12 - 2x)/3 = 5\nx = 2.7"}
        className="flex-1 w-full bg-[#021f3d] border border-[#85B7EB]/15 rounded-xl p-3 text-white text-base font-mono leading-relaxed placeholder-[#85B7EB]/25 resize-none focus:outline-none focus:border-[#378ADD]/50"
        style={{
          backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, rgba(133,183,235,0.08) 27px, rgba(133,183,235,0.08) 28px)",
          backgroundPosition: "0 12px",
        }}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
      />
    </div>
  )
}

// ============================================================
// CALCULATOR TAB — upgraded with parentheses, exponents, sqrt, memory
// ============================================================

function CalculatorTab() {
  const [display, setDisplay] = useState("0")
  const [expression, setExpression] = useState("")
  const [memory, setMemory] = useState<number | null>(null)
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === "0" ? digit : display + digit)
    }
  }, [display, waitingForOperand])

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay("0.")
      setWaitingForOperand(false)
      return
    }
    if (!display.includes(".")) {
      setDisplay(display + ".")
    }
  }, [display, waitingForOperand])

  const clear = useCallback(() => {
    setDisplay("0")
    setExpression("")
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }, [])

  const performOperation = useCallback((nextOperation: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      let newValue: number
      switch (operation) {
        case "+": newValue = previousValue + inputValue; break
        case "-": newValue = previousValue - inputValue; break
        case "×": newValue = previousValue * inputValue; break
        case "÷": newValue = inputValue !== 0 ? previousValue / inputValue : 0; break
        case "^": newValue = Math.pow(previousValue, inputValue); break
        default: newValue = inputValue
      }
      newValue = Math.round(newValue * 1000000) / 1000000
      setDisplay(String(newValue))
      setPreviousValue(newValue)
    }

    setWaitingForOperand(true)
    setOperation(nextOperation)
  }, [display, operation, previousValue])

  const calculate = useCallback(() => {
    if (operation === null || previousValue === null) return
    const inputValue = parseFloat(display)
    let newValue: number
    switch (operation) {
      case "+": newValue = previousValue + inputValue; break
      case "-": newValue = previousValue - inputValue; break
      case "×": newValue = previousValue * inputValue; break
      case "÷": newValue = inputValue !== 0 ? previousValue / inputValue : 0; break
      case "^": newValue = Math.pow(previousValue, inputValue); break
      default: newValue = inputValue
    }
    newValue = Math.round(newValue * 1000000) / 1000000
    setDisplay(String(newValue))
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(true)
  }, [display, operation, previousValue])

  const handleSqrt = useCallback(() => {
    const val = parseFloat(display)
    if (val >= 0) {
      const result = Math.round(Math.sqrt(val) * 1000000) / 1000000
      setDisplay(String(result))
      setWaitingForOperand(true)
    }
  }, [display])

  const btnBase = "rounded-lg font-bold text-base transition-all active:scale-95 flex items-center justify-center"
  const btnNum = `${btnBase} bg-white/10 text-white hover:bg-white/15`
  const btnOp = `${btnBase} bg-[#F59E0B]/20 text-[#F59E0B] hover:bg-[#F59E0B]/30`
  const btnOpActive = `${btnBase} bg-[#F59E0B] text-white`
  const btnFunc = `${btnBase} bg-[#378ADD]/20 text-[#378ADD] hover:bg-[#378ADD]/30`

  return (
    <div className="h-full flex flex-col gap-2">
      {/* Display */}
      <div className="bg-[#021f3d] rounded-xl px-4 py-3">
        {memory !== null && (
          <div className="text-[10px] text-[#EF9F27] font-bold mb-0.5">M = {memory}</div>
        )}
        <div className="text-right text-2xl font-bold text-white truncate">{display}</div>
      </div>

      {/* Memory row */}
      <div className="grid grid-cols-4 gap-1.5">
        <button onClick={() => setMemory(parseFloat(display))} className={`${btnFunc} h-9 text-xs`}>MS</button>
        <button onClick={() => { if (memory !== null) { setDisplay(String(memory)); setWaitingForOperand(true) } }} className={`${btnFunc} h-9 text-xs`}>MR</button>
        <button onClick={() => { if (memory !== null) setMemory(memory + parseFloat(display)) }} className={`${btnFunc} h-9 text-xs`}>M+</button>
        <button onClick={() => setMemory(null)} className={`${btnFunc} h-9 text-xs`}>MC</button>
      </div>

      {/* Main keypad */}
      <div className="grid grid-cols-4 gap-1.5 flex-1">
        {/* Row 1 */}
        <button onClick={clear} className={`${btnBase} bg-red-500/20 text-red-400 hover:bg-red-500/30 h-12`}>C</button>
        <button onClick={handleSqrt} className={`${btnFunc} h-12`}>√</button>
        <button onClick={() => performOperation("^")} className={`${operation === "^" ? btnOpActive : btnFunc} h-12`}>x<sup>y</sup></button>
        <button onClick={() => performOperation("÷")} className={`${operation === "÷" ? btnOpActive : btnOp} h-12`}>÷</button>

        {/* Row 2 */}
        <button onClick={() => inputDigit("7")} className={`${btnNum} h-12`}>7</button>
        <button onClick={() => inputDigit("8")} className={`${btnNum} h-12`}>8</button>
        <button onClick={() => inputDigit("9")} className={`${btnNum} h-12`}>9</button>
        <button onClick={() => performOperation("×")} className={`${operation === "×" ? btnOpActive : btnOp} h-12`}>×</button>

        {/* Row 3 */}
        <button onClick={() => inputDigit("4")} className={`${btnNum} h-12`}>4</button>
        <button onClick={() => inputDigit("5")} className={`${btnNum} h-12`}>5</button>
        <button onClick={() => inputDigit("6")} className={`${btnNum} h-12`}>6</button>
        <button onClick={() => performOperation("-")} className={`${operation === "-" ? btnOpActive : btnOp} h-12`}>−</button>

        {/* Row 4 */}
        <button onClick={() => inputDigit("1")} className={`${btnNum} h-12`}>1</button>
        <button onClick={() => inputDigit("2")} className={`${btnNum} h-12`}>2</button>
        <button onClick={() => inputDigit("3")} className={`${btnNum} h-12`}>3</button>
        <button onClick={() => performOperation("+")} className={`${operation === "+" ? btnOpActive : btnOp} h-12`}>+</button>

        {/* Row 5 */}
        <button onClick={() => setDisplay(String(-parseFloat(display)))} className={`${btnFunc} h-12`}>±</button>
        <button onClick={() => inputDigit("0")} className={`${btnNum} h-12`}>0</button>
        <button onClick={inputDecimal} className={`${btnNum} h-12`}>.</button>
        <button onClick={calculate} className={`${btnBase} bg-[#378ADD] text-white hover:bg-[#378ADD]/80 h-12`}>=</button>
      </div>
    </div>
  )
}

// ============================================================
// DRAW TAB — finger-friendly canvas with thick strokes, undo, clear
// ============================================================

function DrawTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([])
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)

  // Size canvas to container
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.fillStyle = "#021f3d"
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Draw faint grid
    ctx.strokeStyle = "rgba(133,183,235,0.08)"
    ctx.lineWidth = 1
    for (let x = 0; x < rect.width; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rect.height); ctx.stroke()
    }
    for (let y = 0; y < rect.height; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rect.width, y); ctx.stroke()
    }
  }, [])

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    if ("touches" in e) {
      const touch = e.touches[0]
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  const saveState = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setStrokeHistory(prev => [...prev.slice(-20), data]) // keep last 20 states
  }

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    saveState()
    const pos = getPos(e)
    if (!pos) return
    lastPointRef.current = pos
    setIsDrawing(true)
  }

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    if (!isDrawing) return
    const canvas = canvasRef.current
    const pos = getPos(e)
    const lastPos = lastPointRef.current
    if (!canvas || !pos || !lastPos) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 3
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.beginPath()
    ctx.moveTo(lastPos.x, lastPos.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()

    lastPointRef.current = pos
  }

  const endDraw = () => {
    setIsDrawing(false)
    lastPointRef.current = null
  }

  const handleUndo = () => {
    const canvas = canvasRef.current
    if (!canvas || strokeHistory.length === 0) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const prev = strokeHistory[strokeHistory.length - 1]
    ctx.putImageData(prev, 0, 0)
    setStrokeHistory(prev2 => prev2.slice(0, -1))
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    saveState()
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = container.getBoundingClientRect()
    ctx.fillStyle = "#021f3d"
    ctx.fillRect(0, 0, rect.width, rect.height)
    // Redraw grid
    ctx.strokeStyle = "rgba(133,183,235,0.08)"
    ctx.lineWidth = 1
    for (let x = 0; x < rect.width; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rect.height); ctx.stroke()
    }
    for (let y = 0; y < rect.height; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rect.width, y); ctx.stroke()
    }
  }

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#85B7EB]/50">draw with your finger</span>
        <div className="flex gap-2">
          <button
            onClick={handleUndo}
            disabled={strokeHistory.length === 0}
            className="text-xs text-[#378ADD] hover:text-[#378ADD]/80 font-bold flex items-center gap-1 disabled:opacity-30"
          >
            <Undo2 className="w-3.5 h-3.5" /> undo
          </button>
          <button
            onClick={handleClear}
            className="text-xs text-red-400/70 hover:text-red-400 font-bold flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> clear
          </button>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 rounded-xl overflow-hidden border border-[#85B7EB]/15 touch-none">
        <canvas
          ref={canvasRef}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          className="w-full h-full cursor-crosshair"
        />
      </div>
    </div>
  )
}

// Trigger button for the game screen — more prominent than old calculator button
export function WorkAreaButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 bg-[#0a2d4a] border border-[#378ADD]/30 rounded-full px-3 py-1.5 transition-all active:scale-95 hover:bg-[#0a2d4a]/80"
      aria-label="Open work area"
    >
      <div className="flex items-center gap-0.5">
        <CalculatorIcon className="w-3.5 h-3.5 text-[#378ADD]" />
        <PenLine className="w-3.5 h-3.5 text-[#378ADD]" />
      </div>
      <span className="text-xs font-bold text-[#378ADD]">tools</span>
    </button>
  )
}
