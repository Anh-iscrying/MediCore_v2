"use client"

import { AuthForm } from "@/components/auth/auth-form"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  const handleSubmit = () => {
    // Simulate successful login
    router.push("/dashboard")
  }

  return <AuthForm type="login" onSubmit={handleSubmit} />
}
