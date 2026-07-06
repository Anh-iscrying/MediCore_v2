"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/base/ui/button"

const navLinks = [
  { label: "Chuyên khoa", href: "#specialties" },
  { label: "Hỗ trợ AI", href: "#ai-care" },
  { label: "Công nghệ", href: "#tech" },
  { label: "Bác sĩ", href: "#doctors" },
  { label: "Thông tin", href: "#mission" },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4">
      <nav className="mx-auto max-w-7xl rounded-[24px] border border-border/70 bg-card/90 shadow-lg shadow-black/5 backdrop-blur-md dark:shadow-black/30">
        <div className="flex h-16 items-center justify-between px-5 lg:px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-sans text-xl font-black tracking-tight text-foreground transition-opacity group-hover:opacity-90">
              Medicore<span className="text-primary">.</span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-5 md:flex">
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Đăng nhập
            </Link>
            <Button
              asChild
              className="h-11 rounded-[24px] bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:scale-[1.02]"
            >
              <Link href="/dashboard/appointments">Đặt lịch khám</Link>
            </Button>
          </div>

          <button
            className="rounded-full p-2 text-foreground transition-colors hover:bg-muted md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Mở hoặc đóng menu"
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
          >
            {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {isOpen && (
          <div id="mobile-navigation" className="flex flex-col gap-5 rounded-b-[24px] border-t border-border bg-card/95 px-6 py-6 backdrop-blur-md md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="my-1 h-px bg-border" />
            <div className="flex flex-col gap-3">
              <Link
                href="/auth/login"
                onClick={() => setIsOpen(false)}
                className="w-full rounded-[24px] py-3 text-center text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Đăng nhập
              </Link>
              <Button asChild className="h-12 w-full rounded-[24px] bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                <Link href="/dashboard/appointments" onClick={() => setIsOpen(false)}>
                  Đặt lịch khám
                </Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
