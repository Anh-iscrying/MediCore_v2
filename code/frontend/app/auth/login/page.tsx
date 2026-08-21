"use client"

import { useState } from "react"
import { AuthForm, type AuthFormData } from "@/components/auth/auth-form"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [error, setError] = useState("")

  const handleSubmit = async (data: AuthFormData) => {
    setError("")
    try {
      await login({ email: data.email, password: data.password })
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại")
    }
  }

  return <AuthForm type="login" error={error} onSubmit={handleSubmit} />
}

