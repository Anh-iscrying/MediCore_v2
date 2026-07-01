"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface BookingSuccessToastProps {
  message: string | null
  title?: string
  variant?: "success" | "danger"
}

export function BookingSuccessToast({ message, title, variant = "success" }: BookingSuccessToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (message) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [message])

  if (!message || !isVisible) return null

  // Determine default titles
  const defaultTitle = variant === "danger" ? "Đã xảy ra lỗi" : "Thao tác thành công"
  const activeTitle = title || defaultTitle

  // Colors and shapes based on Wise style guide
  const isDanger = variant === "danger"
  const badgeBg = isDanger ? "bg-[#320707] text-[#ffffff] border-[#d03238]/20" : "bg-[#e2f6d5] text-[#054d28] border-[#2ead4b]/20"

  return (
    <div 
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "w-full max-w-sm rounded-xl border border-[#0e0f0c] bg-card p-4",
        "animate-in slide-in-from-bottom-5 fade-in duration-300",
        "transition-all duration-300"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon Indicator */}
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border", badgeBg)}>
          {isDanger ? (
            <AlertCircle className="h-5 w-5" />
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-sans font-black text-foreground leading-tight tracking-tight">
            {activeTitle}
          </p>
          {message !== activeTitle && (
            <p className="mt-1 text-xs text-muted-foreground leading-normal">
              {message}
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-foreground hover:bg-background rounded-full p-1 transition-colors cursor-pointer"
          title="Đóng"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
