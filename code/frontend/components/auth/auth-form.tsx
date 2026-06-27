"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/base/ui/button"
import { Mail, Lock, User, ArrowRight } from "lucide-react"

interface AuthFormProps {
  type: "login" | "signup"
  onSubmit?: (data: Record<string, string>) => void
}

export function AuthForm({ type, onSubmit }: AuthFormProps) {
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
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (type === "signup") {
      if (!formData.name) {
        newErrors.name = "Name is required"
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password"
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onSubmit?.(formData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-card rounded-lg border border-border shadow-2xl shadow-black/50 p-8" style={{
        boxShadow: 'rgba(0,0,0,0.5) 0px 8px 24px'
      }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-sans text-2xl lg:text-3xl font-bold text-foreground mb-2">
            {type === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-secondary text-sm leading-relaxed">
            {type === "login"
              ? "Access your medical records and appointments"
              : "Join our hospital network for personalized healthcare"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field - Signup only */}
          {type === "signup" && (
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  style={{
                    boxShadow: 'rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset'
                  }}
                />
              </div>
              {errors.name && <p className="text-destructive text-xs mt-2">{errors.name}</p>}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                style={{
                  boxShadow: 'rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset'
                }}
              />
            </div>
            {errors.email && <p className="text-destructive text-xs mt-2">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                style={{
                  boxShadow: 'rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset'
                }}
              />
            </div>
            {errors.password && <p className="text-destructive text-xs mt-2">{errors.password}</p>}
          </div>

          {/* Confirm Password - Signup only */}
          {type === "signup" && (
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  style={{
                    boxShadow: 'rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset'
                  }}
                />
              </div>
              {errors.confirmPassword && <p className="text-destructive text-xs mt-2">{errors.confirmPassword}</p>}
            </div>
          )}

          {/* Forgot Password - Login only */}
          {type === "login" && (
            <div className="flex justify-end pt-1">
              <Link href="#" className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">
                Forgot password?
              </Link>
            </div>
          )}

          {/* Submit Button - Pill shaped */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-3 font-bold tracking-wider uppercase text-sm group mt-6 transition-all"
          >
            {isLoading ? (
              <span className="opacity-70">Processing...</span>
            ) : (
              <>
                {type === "login" ? "Sign In" : "Create Account"}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 pt-6 border-t border-border text-center text-xs text-secondary">
          {type === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-primary hover:text-primary/80 font-bold transition-colors">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:text-primary/80 font-bold transition-colors">
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 text-center text-xs text-secondary space-y-2">
        <p>By proceeding, you agree to our Terms of Service</p>
        <p>Your health data is protected and encrypted</p>
      </div>
    </div>
  )
}
