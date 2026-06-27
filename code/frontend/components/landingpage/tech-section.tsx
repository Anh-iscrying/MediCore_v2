"use client"

import { useEffect, useRef } from "react"
import { ScrollBlurText } from "@/components/base/scroll-blur-text"
import { Cpu, ShieldCheck, Activity, Zap } from "lucide-react"

const technologies = [
  {
    title: "Robotic-Assisted Surgical Systems",
    description: "Employs high-precision surgical robotic arms for minimally invasive procedures, resulting in shorter recovery periods and minimal scarring.",
    highlight: "Sub-millimeter accuracy",
  },
  {
    title: "AI-Powered Diagnostic Imaging",
    description: "Deep learning models instantly screen MRI and CT scans, highlighting micro-anomalies and predicting potential risks years in advance.",
    highlight: "Early risk screening",
  },
  {
    title: "Biometric Wearable Remote Monitoring",
    description: "Wearable sensor bands log real-time telemetry like ECG, oxygen saturation, and body temperature directly to our physician dashboards.",
    highlight: "Real-time telemetry",
  },
]

export function TechSection() {
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
    <section ref={sectionRef} id="tech" className="py-24 lg:py-32 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 lg:mb-20">
          <div className="max-w-2xl text-left">
            <p className="text-xs uppercase tracking-[0.25em] text-primary font-bold mb-4">
              ADVANCED CLINICAL INNOVATION
            </p>
            <ScrollBlurText
              text="State-of-the-Art Medical Technology"
              className="font-sans text-4xl text-foreground font-extrabold tracking-tight mb-6 md:text-5xl"
            />
          </div>
          <p className="text-muted-foreground text-base max-w-sm mt-4 md:mt-0 leading-relaxed">
            Combining scientific expertise with clinical-grade infrastructure for superior diagnostic outcomes.
          </p>
        </div>

        {/* List of Technologies (Spotify Tracklist Style) */}
        <div className="flex flex-col border border-border rounded-lg overflow-hidden bg-card" style={{
          boxShadow: 'rgba(0,0,0,0.05) 0px 8px 8px'
        }}>
          {technologies.map((tech, index) => (
            <div
              key={tech.title}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-border last:border-0 hover:bg-muted group transition-all duration-200 cursor-pointer"
            >
              <div className="flex gap-5 items-start">
                {/* Index / Hover Icon */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 flex items-center justify-center font-bold text-sm transition-all duration-300 border border-border">
                  {index + 1}
                </div>

                <div>
                  <h3 className="text-foreground font-bold text-base md:text-lg mb-1.5 flex items-center gap-3">
                    {tech.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">
                    {tech.description}
                  </p>
                </div>
              </div>

              {/* Status / Highlight Tag */}
              <div className="flex items-center gap-3 pl-13 md:pl-0">
                <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 whitespace-nowrap">
                  {tech.highlight}
                </span>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
