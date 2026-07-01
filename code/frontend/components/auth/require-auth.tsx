"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "PATIENT")) {
      router.replace("/auth/login")
    }
  }, [isLoading, router, user])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-sm font-semibold text-muted-foreground">
        Đang kiểm tra phiên đăng nhập...
      </div>
    )
  }

  if (!user || user.role !== "PATIENT") {
    return null
  }

  return children
}
