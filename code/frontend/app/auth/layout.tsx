"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sectionRef = useRef<HTMLDivElement>(null)

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
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4 py-8 bg-background">
      {/* Subtle background gradient overlay */}
      <div className="absolute inset-0 w-full h-full overflow-hidden -z-10 opacity-20">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-background to-background" />
      </div>

      {/* Logo/Brand - Top (HealthCare -> Medicore) */}
      <div className="absolute top-6 left-6 z-50">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-sans text-lg font-bold text-primary group-hover:text-primary/80 transition-colors">
            Medicore
          </span>
        </Link>
      </div>

      {/* Content */}
      <div ref={sectionRef} className="w-full max-w-md mx-auto">
        {/* Header Text */}
        <div className="text-center mb-8 reveal opacity-0">
          <h1 className="font-sans text-4xl md:text-5xl font-bold leading-tight text-foreground text-balance mb-3">
            Cổng thông tin bệnh nhân
          </h1>
        </div>

        {/* Auth Form wrapper with reveal animation */}
        <div className="reveal opacity-0 animation-delay-200">
          {children}
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-secondary hover:text-foreground transition-colors text-xs font-medium underline underline-offset-4"
          >
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </main>
  )
}
