"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/base/ui/button"
import { Mail, Lock, User, ArrowRight } from "lucide-react"

export type AuthFormData = {
  email: string
  password: string
  name: string
  confirmPassword: string
}

interface AuthFormProps {
  type: "login" | "signup"
  error?: string
  onSubmit?: (data: AuthFormData) => Promise<void> | void
}

export function AuthForm({ type, error, onSubmit }: AuthFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = "Email là bắt buộc"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc"
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
    }

    if (type === "signup") {
      if (!formData.name) {
        newErrors.name = "Tên là bắt buộc"
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu"
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      await onSubmit?.(formData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-card rounded-xl border border-border shadow-xl shadow-black/[0.04] dark:shadow-2xl dark:shadow-black/50 p-8 transition-all">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-sans text-2xl lg:text-3xl font-black text-foreground tracking-tight mb-2">
            {type === "login" ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {type === "login"
              ? "Đăng nhập để truy cập hồ sơ y tế và lịch hẹn của bạn."
              : "Hãy tham gia mạng lưới bệnh viện của chúng tôi để được chăm sóc sức khỏe cá nhân hóa."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field - Signup only */}
          {type === "signup" && (
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
                Họ và tên
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/70" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-foreground transition-all duration-150"
                />
              </div>
              {errors.name && <p className="text-destructive text-xs mt-2">{errors.name}</p>}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
              Địa chỉ email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/70" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-foreground transition-all duration-150"
              />
            </div>
            {errors.email && <p className="text-destructive text-xs mt-2">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/70" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-foreground transition-all duration-150"
              />
            </div>
            {errors.password && <p className="text-destructive text-xs mt-2">{errors.password}</p>}
          </div>

          {/* Confirm Password - Signup only */}
          {type === "signup" && (
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
                Nhập lại mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/70" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-foreground transition-all duration-150"
                />
              </div>
              {errors.confirmPassword && <p className="text-destructive text-xs mt-2">{errors.confirmPassword}</p>}
            </div>
          )}

          {/* Forgot Password - Login only */}
          {type === "login" && (
            <div className="flex justify-end pt-1">
              <Link href="/auth/forgot-password" className="text-xs text-foreground hover:text-primary transition-colors font-bold underline underline-offset-4 decoration-2 decoration-primary/40 hover:decoration-primary">
                Quên mật khẩu?
              </Link>
            </div>
          )}

          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
              {error}
            </p>
          )}

          {/* Submit Button - Pill shaped */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-foreground hover:bg-[#cdffad] active:scale-[0.98] rounded-xl py-3.5 font-bold tracking-wider uppercase text-sm group mt-6 transition-all duration-200 cursor-pointer"
          >
            {isLoading ? (
              <span className="opacity-70">Đang xử lý...</span>
            ) : (
              <>
                {type === "login" ? "Đăng nhập" : "Tạo tài khoản"}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          {type === "login" ? (
            <>
              Bạn chưa có tài khoản?{" "}
              <Link href="/auth/signup" className="text-foreground hover:text-primary font-black transition-colors underline underline-offset-4 decoration-2 decoration-primary/40 hover:decoration-primary">
                Đăng ký
              </Link>
            </>
          ) : (
            <>
              Bạn đã có tài khoản?{" "}
              <Link href="/auth/login" className="text-foreground hover:text-primary font-black transition-colors underline underline-offset-4 decoration-2 decoration-primary/40 hover:decoration-primary">
                Đăng nhập
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 text-center text-xs text-muted-foreground space-y-2">
        <p>Bằng cách tiếp tục, bạn đồng ý với Điều khoản dịch vụ của chúng tôi.</p>
        <p>Dữ liệu sức khỏe của bạn được bảo vệ và mã hóa.</p>
      </div>
    </div>
  )
}
