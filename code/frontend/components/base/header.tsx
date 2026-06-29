"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/base/ui/button"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-6">
      <nav className="max-w-7xl mx-auto bg-card/80 backdrop-blur-md border border-border/60 rounded-3xl shadow-xl shadow-black/10 dark:shadow-black/30">
        <div className="flex items-center justify-between h-20 px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-sans text-foreground text-xl font-bold tracking-tight transition-opacity group-hover:opacity-90">
              Medicore<span className="text-primary">.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#specialties"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              Chuyên Khoa
            </Link>
            <Link
              href="#ai-care"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              Hỗ trợ AI
            </Link>
            <Link
              href="#tech"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              Công nghệ
            </Link>
            <Link
              href="#doctors"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              Bác sĩ
            </Link>
            <Link
              href="#mission"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              Thông tin
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              href="/auth/login"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              Đăng nhập
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-102 font-bold uppercase tracking-widest text-[11px] rounded-full px-6 py-3 transition-all duration-200">
                Đặt lịch hẹn
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Panel */}
        {isOpen && (
          <div className="md:hidden py-6 px-6 border-t border-border flex flex-col gap-5 bg-card/95 backdrop-blur-md rounded-b-3xl">
            <Link
              href="#specialties"
              className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Chuyên Khoa
            </Link>
            <Link
              href="#ai-care"
              className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Hỗ trợ AI
            </Link>
            <Link
              href="#tech"
              className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Công nghệ
            </Link>
            <Link
              href="#doctors"
              className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Bác sĩ
            </Link>
            <Link
              href="#mission"
              className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Thông tin
            </Link>
            <div className="h-px bg-border my-2" />
            <div className="flex flex-col gap-3">
              <Link href="/auth/login" onClick={() => setIsOpen(false)} className="w-full text-center py-3 text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
                Đăng nhập
              </Link>
              <Link href="/auth/signup" onClick={() => setIsOpen(false)} className="w-full">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-widest text-[11px] rounded-full w-full py-4">
                  Đặt lịch hẹn
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
