"use client"

import { AuthForm } from "@/components/auth/auth-form"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const router = useRouter()

  const handleSubmit = () => {
    // Simulate successful signup
    router.push("/dashboard")
  }

  return <AuthForm type="signup" onSubmit={handleSubmit} />
}
