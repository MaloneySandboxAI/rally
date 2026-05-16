"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { isPushSupported, wasPushPrompted, markPushPrompted, subscribeToPush, getExistingSubscription } from "@/lib/push-notifications"

export function PushPrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!isPushSupported() || wasPushPrompted()) return
    getExistingSubscription().then(sub => {
      if (!sub) setShow(true)
    })
  }, [])

  if (!show) return null

  const handleEnable = async () => {
    markPushPrompted()
    await subscribeToPush()
    setShow(false)
  }

  const handleDismiss = () => {
    markPushPrompted()
    setShow(false)
  }

  return (
    <div className="bg-[#0a2d4a] border border-[#378ADD]/30 rounded-xl px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <Bell className="w-5 h-5 text-[#378ADD] shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white">get notified when friends play</p>
        <p className="text-[10px] text-[#85B7EB]/50">know instantly when challenge results are in</p>
      </div>
      <button
        onClick={handleEnable}
        className="bg-[#378ADD] text-white text-xs font-bold rounded-lg px-3 py-1.5 shrink-0 active:scale-[0.95]"
      >
        enable
      </button>
      <button onClick={handleDismiss} className="text-[#85B7EB]/30 shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
