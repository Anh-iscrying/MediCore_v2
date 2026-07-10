"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/base/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { AuthenticatedUserMenu } from "@/components/base/user/authenticated-user-menu"
import { Avatar, AvatarFallback } from "@/components/base/ui/avatar"

const navLinks = [
  { label: "Chuyên khoa", href: "#specialties" },
  { label: "Hỗ trợ AI", href: "#ai-care" },
  { label: "Công nghệ", href: "#tech" },
  { label: "Bác sĩ", href: "#doctors" },
  { label: "Thông tin", href: "#mission" },
]

function getInitials(name: string) {
  if (!name) return "BN"
  const parts = name.trim().split(" ")
  if (parts.length >= 2) {
    return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isLoading, logout } = useAuth()

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

          <div className="hidden items-center gap-3 md:flex">
            {!isLoading && user ? (
              <AuthenticatedUserMenu />
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground mr-2"
                >
                  Đăng nhập
                </Link>
                <Button
                  asChild
                  className="h-11 rounded-[24px] bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:scale-[1.02]"
                >
                  <Link href="/dashboard/appointments">Đặt lịch khám</Link>
                </Button>
              </>
            )}
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
              {!isLoading && user ? (
                <div className="flex flex-col gap-2.5 p-3.5 bg-secondary/40 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 border border-primary/20 bg-[#86efac]">
                      <AvatarFallback className="bg-[#86efac] text-foreground text-sm font-black">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-foreground truncate">{user.name}</span>
                      <span className="text-[11px] text-muted-foreground truncate">{user.email}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    <Button variant="outline" size="sm" asChild className="rounded-xl font-semibold text-xs h-9 cursor-pointer" onClick={() => setIsOpen(false)}>
                      <Link href="/dashboard">
                        <Settings className="size-3.5 mr-1 text-muted-foreground" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-xl font-semibold text-xs text-destructive hover:bg-destructive/10 hover:text-destructive h-9 cursor-pointer" onClick={() => { logout(); setIsOpen(false); }}>
                      <LogOut className="size-3.5 mr-1" />
                      Đăng xuất
                    </Button>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
