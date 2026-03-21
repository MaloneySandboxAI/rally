"use client"

import { useState, useEffect } from "react"
import { Send, X, Check } from "lucide-react"

type Reaction = "loving" | "ok" | "broken" | null

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedReaction, setSelectedReaction] = useState<Reaction>(null)
  const [feedback, setFeedback] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        setIsSubmitted(false)
        setIsOpen(false)
        setSelectedReaction(null)
        setFeedback("")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isSubmitted])

  const handleSubmit = () => {
    // Here you would send feedback to your backend
    console.log("Feedback submitted:", { reaction: selectedReaction, feedback })
    setIsSubmitted(true)
  }

  const reactions = [
    { id: "loving" as const, emoji: "😍", label: "loving it" },
    { id: "ok" as const, emoji: "😐", label: "it's ok" },
    { id: "broken" as const, emoji: "😤", label: "something's broken" },
  ]

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[88px] right-4 z-40 flex flex-col items-center justify-center w-11 h-11 rounded-full bg-[#021f3d]/80 border-2 border-[#378ADD] backdrop-blur-sm shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Send feedback"
      >
        <Send className="w-5 h-5 text-[#378ADD]" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={() => !isSubmitted && setIsOpen(false)}
        />
      )}

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "85vh" }}
      >
        {isSubmitted ? (
          /* Success State */
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-16 h-16 rounded-full bg-[#16a34a]/10 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-[#16a34a]" />
            </div>
            <p className="text-lg font-bold text-[#0a1628]">
              {"thanks! we read every one 💙"}
            </p>
          </div>
        ) : (
          /* Feedback Form */
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-[#0a1628]">
                help us improve rally
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Emoji Reactions */}
            <div className="flex justify-center gap-4 mb-6">
              {reactions.map((reaction) => (
                <button
                  key={reaction.id}
                  onClick={() => setSelectedReaction(reaction.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                    selectedReaction === reaction.id
                      ? "bg-[#378ADD]/10 ring-2 ring-[#378ADD]"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-4xl">{reaction.emoji}</span>
                  <span className="text-xs font-semibold text-[#6b7280]">
                    {reaction.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Text Field */}
            <div className="mb-6">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="tell us more (optional)"
                className="w-full h-24 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#0a1628] placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#378ADD] focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!selectedReaction}
              className="w-full py-4 rounded-2xl bg-[#378ADD] text-white font-bold text-lg transition-all hover:bg-[#2d7bc4] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              send feedback
            </button>

            {/* Safe area padding for bottom */}
            <div className="h-4" />
          </div>
        )}
      </div>
    </>
  )
}
