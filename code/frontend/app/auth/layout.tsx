"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import Link from "next/link"
import { AuthProvider } from "@/components/auth/auth-provider"

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
    <AuthProvider>
      <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4 py-8 bg-background">
      {/* Premium background mesh overlay */}
      <div className="absolute inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[100px] dark:bg-primary/5" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/12 blur-[120px] dark:bg-primary/5" />
        <div className="absolute top-[35%] left-[25%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-[90px]" />
      </div>

      {/* Logo/Brand - Top (HealthCare -> Medicore) */}
      <div className="absolute top-6 left-6 z-50">
        <Link href="/" className="flex items-center gap-1 group">
          <span className="font-sans text-lg font-bold tracking-tight text-foreground group-hover:opacity-80 transition-opacity">
            Medicore<span className="text-primary">.</span>
          </span>
        </Link>
      </div>

      {/* Content */}
      <div ref={sectionRef} className="w-full max-w-md mx-auto">
        {/* Header Text */}
        <div className="text-center mb-8 reveal opacity-0">
          <h1 className="font-sans text-4xl md:text-5xl font-black leading-tight text-foreground tracking-tighter text-balance mb-3">
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
            className="text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold underline underline-offset-4"
          >
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
      </main>
    </AuthProvider>
  )
}
