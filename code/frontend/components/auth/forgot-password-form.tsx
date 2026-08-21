"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/base/ui/button"
import { Mail, Lock, KeyRound, ArrowRight, CheckCircle2 } from "lucide-react"

type Step = "email" | "otp" | "reset" | "success"

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showMockNotification, setShowMockNotification] = useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setErrors({ email: "Email là bắt buộc" })
      return
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: "Email không hợp lệ" })
      return
    }

    setErrors({})
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setShowMockNotification(true)
      setStep("otp")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp) {
      setErrors({ otp: "Mã OTP là bắt buộc" })
      return
    } else if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setErrors({ otp: "Mã OTP phải gồm 6 chữ số" })
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      // Mock validation: accept "123456" for demo purposes
      if (otp === "123456") {
        setErrors({})
        setShowMockNotification(false)
        setStep("reset")
      } else {
        setErrors({ otp: "Mã OTP không chính xác." })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!password) {
      newErrors.password = "Mật khẩu là bắt buộc"
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu"
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200))
      setStep("success")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">

      <div className="bg-card rounded-lg border border-border shadow-2xl shadow-black/50 p-8" style={{
        boxShadow: 'rgba(0,0,0,0.5) 0px 8px 24px'
      }}>
        {/* STEP 1: ENTER EMAIL */}
        {step === "email" && (
          <>
            <div className="mb-8">
              <h1 className="font-sans text-2xl lg:text-3xl font-bold text-foreground mb-2">
                Quên mật khẩu?
              </h1>
              <p className="text-secondary text-sm leading-relaxed">
                Nhập email đã đăng ký. Chúng tôi sẽ gửi mã OTP để xác thực tài khoản của bạn.
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
                  Địa chỉ email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors({})
                    }}
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    style={{
                      boxShadow: 'rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset'
                    }}
                  />
                </div>
                {errors.email && <p className="text-destructive text-xs mt-2">{errors.email}</p>}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-3 font-bold tracking-wider uppercase text-sm group mt-6 transition-all"
              >
                {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
                {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
          </>
        )}

        {/* STEP 2: ENTER OTP */}
        {step === "otp" && (
          <>
            <div className="mb-8">
              <h1 className="font-sans text-2xl lg:text-3xl font-bold text-foreground mb-2">
                Xác thực OTP
              </h1>
              <p className="text-secondary text-sm leading-relaxed">
                Mã xác thực gồm 6 chữ số đã được gửi đến email <strong className="text-foreground">{email}</strong>.
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div>
                <label htmlFor="otp" className="block text-xs font-semibold text-foreground mb-3 uppercase tracking-wider text-center">
                  Nhập mã xác thực
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.slice(0, 6))
                      if (errors.otp) setErrors({})
                    }}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full py-3 text-center font-mono text-2xl tracking-[0.75em] bg-muted border border-border rounded-lg text-foreground placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    style={{
                      boxShadow: 'rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset'
                    }}
                  />
                </div>
                {errors.otp && <p className="text-destructive text-xs text-center mt-2">{errors.otp}</p>}
              </div>

              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setOtp("")
                    setErrors({})
                    setShowMockNotification(true)
                  }}
                  className="text-primary hover:underline font-semibold"
                >
                  Gửi lại mã
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email")
                    setErrors({})
                    setShowMockNotification(false)
                  }}
                  className="text-secondary hover:text-foreground transition-colors"
                >
                  Thay đổi email
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-3 font-bold tracking-wider uppercase text-sm group mt-6 transition-all"
              >
                {isLoading ? "Đang xác minh..." : "Xác minh mã OTP"}
                {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
          </>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === "reset" && (
          <>
            <div className="mb-8">
              <h1 className="font-sans text-2xl lg:text-3xl font-bold text-foreground mb-2">
                Mật khẩu mới
              </h1>
              <p className="text-secondary text-sm leading-relaxed">
                Tạo mật khẩu mới và bảo mật hơn cho tài khoản của bạn.
              </p>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) setErrors((prev) => ({ ...prev, password: "" }))
                    }}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    style={{
                      boxShadow: 'rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset'
                    }}
                  />
                </div>
                {errors.password && <p className="text-destructive text-xs mt-2">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
                  Nhập lại mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }))
                    }}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    style={{
                      boxShadow: 'rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset'
                    }}
                  />
                </div>
                {errors.confirmPassword && <p className="text-destructive text-xs mt-2">{errors.confirmPassword}</p>}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-3 font-bold tracking-wider uppercase text-sm group mt-6 transition-all"
              >
                {isLoading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
          </>
        )}

        {/* STEP 4: SUCCESS */}
        {step === "success" && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="mb-8">
              <h1 className="font-sans text-2xl lg:text-3xl font-bold text-foreground mb-2">
                Đổi mật khẩu thành công
              </h1>
              <p className="text-secondary text-sm leading-relaxed">
                Mật khẩu của bạn đã được thay đổi thành công. Hãy sử dụng mật khẩu mới để đăng nhập lại hệ thống.
              </p>
            </div>

            <Link href="/auth/login" className="block w-full">
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-3 font-bold tracking-wider uppercase text-sm"
              >
                Đăng nhập ngay
              </Button>
            </Link>
          </div>
        )}

        {/* Global Footer (only visible when not in success step) */}
        {step !== "success" && (
          <div className="mt-6 pt-6 border-t border-border text-center text-xs text-secondary">
            Quay lại{" "}
            <Link href="/auth/login" className="text-primary hover:text-primary/80 font-bold transition-colors">
              Đăng nhập
            </Link>
            {" hoặc "}
            <Link href="/auth/signup" className="text-primary hover:text-primary/80 font-bold transition-colors">
              Đăng ký mới
            </Link>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="mt-6 text-center text-xs text-secondary space-y-2">
        <p>Bằng cách tiếp tục, bạn đồng ý với Điều khoản dịch vụ của chúng tôi.</p>
        <p>Dữ liệu sức khỏe của bạn được bảo vệ và mã hóa.</p>
      </div>
    </div>
  )
}
