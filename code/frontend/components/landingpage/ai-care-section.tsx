"use client"

import { useEffect, useRef } from "react"
import { ScrollBlurText } from "@/components/base/scroll-blur-text"
import { Send, CheckCircle2 } from "lucide-react"

export function AICareSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-up")
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = sectionRef.current?.querySelectorAll(".reveal")
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="ai-care" className="py-24 lg:py-32 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Visual Chat Mockup on the Left */}
          <div className="reveal opacity-0 order-2 lg:order-1 flex justify-center">
            <div className="w-full max-w-[380px] bg-card rounded-xl border border-border overflow-hidden shadow-2xl shadow-black/5 dark:shadow-black/20 flex flex-col h-[480px]">
              
              {/* Chat Header */}
              <div className="bg-muted px-5 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border shrink-0 text-xs font-bold text-primary">
                    AI
                  </div>
                  <div>
                    <div className="text-foreground text-xs font-bold uppercase tracking-wider">HealthCare AI</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                      <span className="text-[10px] text-muted-foreground">Available 24/7</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 flex flex-col justify-end text-xs">
                
                {/* User Message */}
                <div className="bg-primary text-primary-foreground p-3.5 rounded-lg rounded-tr-none self-end max-w-[80%] leading-relaxed">
                  I&apos;m having a mild headache and fatigue. What should I do?
                </div>

                {/* AI Triage Message */}
                <div className="bg-muted border border-border text-foreground p-3.5 rounded-lg rounded-tl-none self-start max-w-[80%] leading-relaxed flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-background flex items-center justify-center border border-border shrink-0 text-[8px] font-bold text-primary">
                    AI
                  </div>
                  <div>
                    Based on your symptoms, it is recommended to rest and hydrate. Keep track of any changes in temperature. 
                  </div>
                </div>

                {/* AI suggestion message */}
                <div className="bg-primary text-primary-foreground p-3.5 rounded-lg rounded-tl-none self-start max-w-[80%] font-semibold leading-relaxed shadow-lg shadow-black/5">
                  Would you like me to schedule a virtual check-in with Dr. Vance (Neurology) for tomorrow morning?
                </div>

                {/* Typing indicators */}
                <div className="flex items-center gap-1.5 pt-2 pl-2">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-border bg-muted flex gap-2.5">
                <div className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
                  <span>Type a message...</span>
                </div>
                <button className="size-8 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-primary-foreground transition-colors cursor-pointer">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Descriptive Content on the Right */}
          <div className="reveal opacity-0 order-1 lg:order-2 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.25em] text-primary font-bold mb-4">
              AI Customer Care
            </p>
            <ScrollBlurText
              text="24/7 Intelligent Support"
              className="font-sans text-4xl text-foreground font-extrabold tracking-tight mb-6 md:text-5xl"
            />
            <p className="text-muted-foreground text-base leading-relaxed mb-10">
              Our intelligent AI health companion is available round-the-clock to answer medical queries, evaluate symptoms, and book doctor appointments instantly.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div>
                  <h4 className="text-foreground font-bold text-base mb-1">Instant Symptom Triage</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Evaluate symptoms immediately and receive safety guidelines tailored to your current vitals and conditions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div>
                  <h4 className="text-foreground font-bold text-base mb-1">Smart Scheduling</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Instantly match and schedule appointments with the correct board-certified specialist without long queue times.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div>
                  <h4 className="text-foreground font-bold text-base mb-1">Continuous Follow-ups</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Receive post-consultation prescription schedules, check-up alerts, and progress logging prompts automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
