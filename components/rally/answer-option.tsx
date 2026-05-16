"use client"

import { Check, X } from "lucide-react"
import { FloatingGemIndicator } from "./countdown-timer"
import { MathText } from "./math-text"

export interface AnswerOptionProps {
  option: string
  index: number
  letter: string
  pendingAnswer: number | null
  selectedAnswer: number | null
  correctAnswer: number
  explanation: string
  onSelect: (index: number) => void
  showGemAnimation: boolean
  gemAmount: number
  isSpeedBonus: boolean
  isTimeout: boolean
  isUntimed?: boolean
}

export function AnswerOption({
  option, index, letter, pendingAnswer, selectedAnswer, correctAnswer,
  explanation, onSelect, showGemAnimation, gemAmount, isSpeedBonus, isTimeout, isUntimed,
}: AnswerOptionProps) {
  const isPending = pendingAnswer === index && selectedAnswer === null
  const isSelected = selectedAnswer === index
  const isCorrect = index === correctAnswer
  const hasConfirmed = selectedAnswer !== null
  const showAsCorrect = hasConfirmed && isCorrect
  const showAsWrong = isSelected && !isCorrect

  const getBackgroundColor = () => {
    if (showAsCorrect) return "#16a34a"
    if (showAsWrong) return "#dc2626"
    if (isPending) return "#378ADD"
    return "#ffffff"
  }

  const getTextColor = () => {
    if (showAsCorrect || showAsWrong || isPending) return "#ffffff"
    return "#0a1628"
  }

  const getLetterBgColor = () => {
    if (showAsCorrect || showAsWrong) return "rgba(255,255,255,0.2)"
    if (isPending) return "rgba(255,255,255,0.25)"
    return "#378ADD"
  }

  return (
    <div className="relative">
      <button
        onClick={() => onSelect(index)}
        disabled={hasConfirmed}
        className={`w-full rounded-xl py-2 px-3 flex items-center gap-2.5 transition-all duration-200 ${
          hasConfirmed ? "cursor-default" : "active:scale-[0.98] hover:shadow-lg cursor-pointer"
        } ${isPending ? "ring-2 ring-white/30 shadow-lg shadow-[#378ADD]/30" : ""}`}
        style={{ backgroundColor: getBackgroundColor(), color: getTextColor() }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs"
          style={{ backgroundColor: getLetterBgColor(), color: "#ffffff" }}
        >
          {letter}
        </div>
        <span className="text-sm font-bold flex-1 text-left leading-snug"><MathText text={option} /></span>
        {showAsCorrect && <Check className="w-5 h-5 flex-shrink-0" strokeWidth={3} />}
        {showAsWrong && <X className="w-5 h-5 flex-shrink-0" strokeWidth={3} />}
      </button>

      {showGemAnimation && (
        <FloatingGemIndicator amount={gemAmount} isSpeedBonus={isSpeedBonus} />
      )}

      {showAsCorrect && (
        <p className={`mt-1 px-4 text-xs text-[#85B7EB] italic leading-snug animate-in fade-in slide-in-from-top-2 duration-300 ${isUntimed ? "" : "line-clamp-2"}`}>
          {explanation}
        </p>
      )}
      {isUntimed && showAsWrong && (
        <p className="mt-1 px-4 text-xs text-red-300/70 italic leading-snug animate-in fade-in slide-in-from-top-2 duration-300">
          {explanation}
        </p>
      )}
    </div>
  )
}
