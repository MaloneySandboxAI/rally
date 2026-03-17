"use client"

import { useState, useEffect } from "react"
import { X, Check, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface ChallengeWaitlistSheetProps {
  isOpen: boolean
  onClose: () => void
  variant?: "challenge" | "referral"
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function ChallengeWaitlistSheet({ isOpen, onClose, variant = "challenge" }: ChallengeWaitlistSheetProps) {
  const [friendEmail, setFriendEmail] = useState("")
  const [yourEmail, setYourEmail] = useState("")
  const [friendEmailError, setFriendEmailError] = useState("")
  const [yourEmailError, setYourEmailError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        setIsSubmitted(false)
        onClose()
        setFriendEmail("")
        setYourEmail("")
        setFriendEmailError("")
        setYourEmailError("")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isSubmitted, onClose])

  // Clear errors when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setFriendEmailError("")
      setYourEmailError("")
    }
  }, [isOpen])

  const handleSubmit = async () => {
    // Reset errors
    setFriendEmailError("")
    setYourEmailError("")

    // Validate emails
    let hasError = false

    if (!friendEmail) {
      setFriendEmailError("please enter an email")
      hasError = true
    } else if (!isValidEmail(friendEmail)) {
      setFriendEmailError("please enter a valid email")
      hasError = true
    }

    if (variant === "challenge") {
      if (!yourEmail) {
        setYourEmailError("please enter your email")
        hasError = true
      } else if (!isValidEmail(yourEmail)) {
        setYourEmailError("please enter a valid email")
        hasError = true
      }
    }

    if (hasError) return

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase.from("waitlist").insert({
        challenger_email: variant === "challenge" ? yourEmail : null,
        friend_email: friendEmail,
        source: variant,
      })

      if (error) {
        console.error("Supabase insert error:", error)
        toast.error("something went wrong - try again", {
          style: {
            background: '#dc2626',
            border: 'none',
            color: '#ffffff',
          },
        })
        setIsSubmitting(false)
        return
      }

      toast.success("you're on the list! you'll both get 500 bonus gems when challenges go live", {
        style: {
          background: '#16a34a',
          border: 'none',
          color: '#ffffff',
        },
        duration: 3000,
      })
      
      setIsSubmitted(true)
    } catch (error) {
      console.error("Error submitting to waitlist:", error)
      toast.error("something went wrong - try again", {
        style: {
          background: '#dc2626',
          border: 'none',
          color: '#ffffff',
        },
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const title = variant === "challenge" 
    ? "challenges are coming soon" 
    : "invite a friend to Rally"

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={() => !isSubmitted && !isSubmitting && onClose()}
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
            <p className="text-lg font-bold text-[#0a1628] text-center">
              {"you're on the list!"}
            </p>
            <p className="text-sm text-[#6b7280] mt-2 text-center">
              {"you'll both get 500 bonus gems when challenges go live"}
            </p>
          </div>
        ) : (
          /* Form */
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-extrabold text-[#0a1628] flex items-center gap-2">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                aria-label="Close"
                disabled={isSubmitting}
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Subtitle */}
            <p className="text-sm text-[#6b7280] mb-6">
              {variant === "challenge"
                ? "enter your friend's email and we'll notify you both the moment head-to-head is live"
                : "enter your friend's email and we'll let them know about Rally"}
            </p>

            {/* Friend Email Field */}
            <div className="mb-4">
              <input
                type="email"
                value={friendEmail}
                onChange={(e) => {
                  setFriendEmail(e.target.value)
                  setFriendEmailError("")
                }}
                placeholder="your friend's email address"
                className={`w-full px-4 py-3 rounded-xl bg-gray-50 border text-[#0a1628] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#378ADD] focus:border-transparent ${
                  friendEmailError ? "border-red-500" : "border-gray-200"
                }`}
                disabled={isSubmitting}
              />
              {friendEmailError && (
                <p className="text-red-500 text-xs mt-1 ml-1">{friendEmailError}</p>
              )}
            </div>

            {/* Your Email Field - only for challenge variant */}
            {variant === "challenge" && (
              <div className="mb-6">
                <input
                  type="email"
                  value={yourEmail}
                  onChange={(e) => {
                    setYourEmail(e.target.value)
                    setYourEmailError("")
                  }}
                  placeholder="your email (so we can notify you too)"
                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border text-[#0a1628] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#378ADD] focus:border-transparent ${
                    yourEmailError ? "border-red-500" : "border-gray-200"
                  }`}
                  disabled={isSubmitting}
                />
                {yourEmailError && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{yourEmailError}</p>
                )}
              </div>
            )}

            {/* Bonus Gem Note */}
            <div className="flex items-center justify-center gap-2 text-sm text-[#F59E0B] mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold">500 bonus gems when they join</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-[#378ADD] text-white font-bold text-lg transition-all hover:bg-[#2d7bc4] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? "sending..." : "notify us both"}
              {!isSubmitting && <span className="text-lg">→</span>}
            </button>

            {/* Safe area padding for bottom */}
            <div className="h-4" />
          </div>
        )}
      </div>
    </>
  )
}
