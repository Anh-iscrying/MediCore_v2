"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/base/ui/button"
import { Mail, Lock, KeyRound, ArrowRight, CheckCircle2 } from "lucide-react"
import * as authApi from "@/lib/auth"

type Step = "email" | "otp" | "reset" | "success"

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

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
      await authApi.requestPasswordResetOtp(email)
      setStep("otp")
    } catch (err) {
      setErrors({ email: err instanceof Error ? err.message : "Không thể gửi mã OTP" })
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

    setErrors({})
    setIsLoading(true)
    try {
      const response = await authApi.verifyPasswordResetOtp(email, otp)
      if (!response.resetToken) {
        throw new Error("Không nhận được mã đặt lại mật khẩu")
      }
      setResetToken(response.resetToken)
      setStep("reset")
    } catch (err) {
      setErrors({ otp: err instanceof Error ? err.message : "Mã OTP không chính xác hoặc đã hết hạn" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setOtp("")
    setErrors({})
    setIsLoading(true)
    try {
      await authApi.requestPasswordResetOtp(email)
    } catch (err) {
      setErrors({ otp: err instanceof Error ? err.message : "Không thể gửi lại mã OTP" })
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
      await authApi.resetPassword(email, resetToken, password)
      setStep("success")
    } catch (err) {
      setErrors({ password: err instanceof Error ? err.message : "Không thể cập nhật mật khẩu" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-card rounded-xl border border-border shadow-xl shadow-black/[0.04] dark:shadow-2xl dark:shadow-black/50 p-8 transition-all">
        {step === "email" && (
          <>
            <div className="mb-8">
              <h1 className="font-sans text-2xl lg:text-3xl font-black text-foreground tracking-tight mb-2">
                Quên mật khẩu?
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Nhập email đã đăng ký. Chúng tôi sẽ gửi mã OTP để xác thực tài khoản của bạn.
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
                  Địa chỉ email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/70" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors({})
                    }}
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-foreground transition-all duration-150"
                  />
                </div>
                {errors.email && <p className="text-destructive text-xs mt-2">{errors.email}</p>}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-foreground hover:bg-[#cdffad] active:scale-[0.98] rounded-xl py-3.5 font-bold tracking-wider uppercase text-sm group mt-6 transition-all duration-200 cursor-pointer"
              >
                {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
                {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
          </>
        )}

        {step === "otp" && (
          <>
            <div className="mb-8">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="font-sans text-2xl lg:text-3xl font-black text-foreground tracking-tight mb-2">
                Xác thực OTP
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Mã xác thực gồm 6 chữ số đã được gửi đến email <strong className="text-foreground font-bold">{email}</strong>.
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div>
                <label htmlFor="otp" className="block text-xs font-semibold text-foreground mb-3 uppercase tracking-wider text-center">
                  Nhập mã xác thực
                </label>
                <input
                  type="text"
                  id="otp"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    if (errors.otp) setErrors({})
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full py-3 text-center font-mono text-2xl tracking-[0.75em] bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-foreground transition-all duration-150"
                />
                {errors.otp && <p className="text-destructive text-xs text-center mt-2">{errors.otp}</p>}
              </div>

              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-foreground hover:text-primary transition-colors font-bold underline underline-offset-4 decoration-2 decoration-primary/40 hover:decoration-primary cursor-pointer disabled:opacity-60"
                >
                  Gửi lại mã
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email")
                    setOtp("")
                    setErrors({})
                  }}
                  disabled={isLoading}
                  className="text-muted-foreground hover:text-foreground font-semibold transition-colors underline underline-offset-4 cursor-pointer disabled:opacity-60"
                >
                  Thay đổi email
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-foreground hover:bg-[#cdffad] active:scale-[0.98] rounded-xl py-3.5 font-bold tracking-wider uppercase text-sm group mt-6 transition-all duration-200 cursor-pointer"
              >
                {isLoading ? "Đang xác minh..." : "Xác minh mã OTP"}
                {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
          </>
        )}

        {step === "reset" && (
          <>
            <div className="mb-8">
              <h1 className="font-sans text-2xl lg:text-3xl font-black text-foreground tracking-tight mb-2">
                Mật khẩu mới
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Tạo mật khẩu mới và bảo mật hơn cho tài khoản của bạn.
              </p>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/70" />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) setErrors((prev) => ({ ...prev, password: "" }))
                    }}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-foreground transition-all duration-150"
                  />
                </div>
                {errors.password && <p className="text-destructive text-xs mt-2">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
                  Nhập lại mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/70" />
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }))
                    }}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-foreground transition-all duration-150"
                  />
                </div>
                {errors.confirmPassword && <p className="text-destructive text-xs mt-2">{errors.confirmPassword}</p>}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-foreground hover:bg-[#cdffad] active:scale-[0.98] rounded-xl py-3.5 font-bold tracking-wider uppercase text-sm group mt-6 transition-all duration-200 cursor-pointer"
              >
                {isLoading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
          </>
        )}

        {step === "success" && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="mb-8">
              <h1 className="font-sans text-2xl lg:text-3xl font-black text-foreground tracking-tight mb-2">
                Đổi mật khẩu thành công
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Mật khẩu của bạn đã được thay đổi thành công. Hãy sử dụng mật khẩu mới để đăng nhập lại hệ thống.
              </p>
            </div>

            <Link href="/auth/login" className="block w-full">
              <Button className="w-full bg-primary text-foreground hover:bg-[#cdffad] active:scale-[0.98] rounded-xl py-3.5 font-bold tracking-wider uppercase text-sm cursor-pointer transition-all duration-200">
                Đăng nhập ngay
              </Button>
            </Link>
          </div>
        )}

        {step !== "success" && (
          <div className="mt-6 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            Quay lại{" "}
            <Link href="/auth/login" className="text-foreground hover:text-primary font-black transition-colors underline underline-offset-4 decoration-2 decoration-primary/40 hover:decoration-primary">
              Đăng nhập
            </Link>
            {" hoặc "}
            <Link href="/auth/signup" className="text-foreground hover:text-primary font-black transition-colors underline underline-offset-4 decoration-2 decoration-primary/40 hover:decoration-primary">
              Đăng ký mới
            </Link>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-xs text-muted-foreground space-y-2">
        <p>Bằng cách tiếp tục, bạn đồng ý với Điều khoản dịch vụ của chúng tôi.</p>
        <p>Dữ liệu sức khỏe của bạn được bảo vệ và mã hóa.</p>
      </div>
    </div>
  )
}
