"use client"

import { useState } from "react"
import { AuthForm, type AuthFormData } from "@/components/auth/auth-form"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [error, setError] = useState("")

  const handleSubmit = async (data: AuthFormData) => {
    setError("")
    try {
      await register({ email: data.email, password: data.password, name: data.name })
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại")
    }
  }

  return <AuthForm type="signup" error={error} onSubmit={handleSubmit} />
}

