"use client"

import { useState } from "react"
import { AuthForm, type AuthFormData } from "@/components/auth/auth-form"
import { useAuth } from "@/components/auth/auth-provider"
import * as authApi from "@/lib/auth"
import { useRouter } from "next/navigation"

type SignupStep = "form" | "otp"

export default function SignupPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [error, setError] = useState("")
  const [step, setStep] = useState<SignupStep>("form")
  const [pendingData, setPendingData] = useState<AuthFormData | null>(null)

  const handleSubmit = async (data: AuthFormData) => {
    setError("")
    try {
      await authApi.requestSignupOtp(data.email)
      setPendingData(data)
      setStep("otp")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi mã OTP")
    }
  }

  const handleVerifyOtp = async (otp: string) => {
    if (!pendingData) return

    setError("")
    try {
      const response = await authApi.verifySignupOtp(pendingData.email, otp)
      const signupVerificationToken = response.verificationToken
      if (!signupVerificationToken) {
        throw new Error("Không nhận được mã xác thực đăng ký")
      }

      await register({
        email: pendingData.email,
        password: pendingData.password,
        name: pendingData.name,
        signupVerificationToken,
      })
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xác thực OTP thất bại")
    }
  }

  const handleResendOtp = async () => {
    if (!pendingData) return

    setError("")
    try {
      await authApi.requestSignupOtp(pendingData.email)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi lại mã OTP")
    }
  }

  return (
    <AuthForm
      type="signup"
      error={error}
      onSubmit={handleSubmit}
      otpEmail={pendingData?.email}
      otpStep={step === "otp"}
      onVerifyOtp={handleVerifyOtp}
      onResendOtp={handleResendOtp}
      onBackToForm={() => {
        setStep("form")
        setError("")
      }}
    />
  )
}
