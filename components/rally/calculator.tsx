"use client"

import { useState, useCallback } from "react"
import { Calculator as CalculatorIcon, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface CalculatorProps {
  isOpen: boolean
  onClose: () => void
}

export function Calculator({ isOpen, onClose }: CalculatorProps) {
  const [display, setDisplay] = useState("0")
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
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }, [])

  const performOperation = useCallback((nextOperation: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue
      let newValue: number

      switch (operation) {
        case "+":
          newValue = currentValue + inputValue
          break
        case "-":
          newValue = currentValue - inputValue
          break
        case "×":
          newValue = currentValue * inputValue
          break
        case "÷":
          newValue = inputValue !== 0 ? currentValue / inputValue : 0
          break
        default:
          newValue = inputValue
      }

      // Round to avoid floating point issues
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
      case "+":
        newValue = previousValue + inputValue
        break
      case "-":
        newValue = previousValue - inputValue
        break
      case "×":
        newValue = previousValue * inputValue
        break
      case "÷":
        newValue = inputValue !== 0 ? previousValue / inputValue : 0
        break
      default:
        newValue = inputValue
    }

    // Round to avoid floating point issues
    newValue = Math.round(newValue * 1000000) / 1000000
    setDisplay(String(newValue))
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(true)
  }, [display, operation, previousValue])

  const CalcButton = ({ 
    value, 
    onClick, 
    className = "" 
  }: { 
    value: string
    onClick: () => void
    className?: string 
  }) => (
    <button
      onClick={onClick}
      className={`h-14 rounded-xl font-bold text-xl transition-all active:scale-95 ${className}`}
    >
      {value}
    </button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#0a2d4a] border-[#378ADD]/30 text-white max-w-[320px] p-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <CalculatorIcon className="w-5 h-5 text-[#378ADD]" />
            Calculator
          </DialogTitle>
          <DialogDescription className="sr-only">
            Basic calculator for math questions
          </DialogDescription>
        </DialogHeader>
        
        {/* Display */}
        <div className="bg-[#021f3d] rounded-xl p-4 mb-3">
          <div className="text-right text-3xl font-bold text-white truncate">
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2">
          {/* Row 1 */}
          <CalcButton 
            value="C" 
            onClick={clear} 
            className="bg-red-500/20 text-red-400 hover:bg-red-500/30" 
          />
          <CalcButton 
            value="±" 
            onClick={() => setDisplay(String(-parseFloat(display)))} 
            className="bg-[#378ADD]/20 text-[#378ADD] hover:bg-[#378ADD]/30" 
          />
          <CalcButton 
            value="%" 
            onClick={() => setDisplay(String(parseFloat(display) / 100))} 
            className="bg-[#378ADD]/20 text-[#378ADD] hover:bg-[#378ADD]/30" 
          />
          <CalcButton 
            value="÷" 
            onClick={() => performOperation("÷")} 
            className={`${operation === "÷" ? "bg-[#F59E0B] text-white" : "bg-[#F59E0B]/20 text-[#F59E0B]"} hover:bg-[#F59E0B]/40`}
          />

          {/* Row 2 */}
          <CalcButton value="7" onClick={() => inputDigit("7")} className="bg-white/10 text-white hover:bg-white/20" />
          <CalcButton value="8" onClick={() => inputDigit("8")} className="bg-white/10 text-white hover:bg-white/20" />
          <CalcButton value="9" onClick={() => inputDigit("9")} className="bg-white/10 text-white hover:bg-white/20" />
          <CalcButton 
            value="×" 
            onClick={() => performOperation("×")} 
            className={`${operation === "×" ? "bg-[#F59E0B] text-white" : "bg-[#F59E0B]/20 text-[#F59E0B]"} hover:bg-[#F59E0B]/40`}
          />

          {/* Row 3 */}
          <CalcButton value="4" onClick={() => inputDigit("4")} className="bg-white/10 text-white hover:bg-white/20" />
          <CalcButton value="5" onClick={() => inputDigit("5")} className="bg-white/10 text-white hover:bg-white/20" />
          <CalcButton value="6" onClick={() => inputDigit("6")} className="bg-white/10 text-white hover:bg-white/20" />
          <CalcButton 
            value="-" 
            onClick={() => performOperation("-")} 
            className={`${operation === "-" ? "bg-[#F59E0B] text-white" : "bg-[#F59E0B]/20 text-[#F59E0B]"} hover:bg-[#F59E0B]/40`}
          />

          {/* Row 4 */}
          <CalcButton value="1" onClick={() => inputDigit("1")} className="bg-white/10 text-white hover:bg-white/20" />
          <CalcButton value="2" onClick={() => inputDigit("2")} className="bg-white/10 text-white hover:bg-white/20" />
          <CalcButton value="3" onClick={() => inputDigit("3")} className="bg-white/10 text-white hover:bg-white/20" />
          <CalcButton 
            value="+" 
            onClick={() => performOperation("+")} 
            className={`${operation === "+" ? "bg-[#F59E0B] text-white" : "bg-[#F59E0B]/20 text-[#F59E0B]"} hover:bg-[#F59E0B]/40`}
          />

          {/* Row 5 */}
          <CalcButton value="0" onClick={() => inputDigit("0")} className="col-span-2 bg-white/10 text-white hover:bg-white/20" />
          <CalcButton value="." onClick={inputDecimal} className="bg-white/10 text-white hover:bg-white/20" />
          <CalcButton 
            value="=" 
            onClick={calculate} 
            className="bg-[#378ADD] text-white hover:bg-[#378ADD]/80"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Calculator trigger button for the question screen
export function CalculatorButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded-full bg-[#0a2d4a] flex items-center justify-center transition-all active:scale-95 hover:bg-[#0a2d4a]/80"
      aria-label="Open calculator"
    >
      <CalculatorIcon className="w-5 h-5 text-[#378ADD]" />
    </button>
  )
}
