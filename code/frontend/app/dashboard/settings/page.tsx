"use client"

import { useState, type FormEvent } from "react"
import { LockKeyhole } from "lucide-react"

import { changePassword } from "@/lib/auth"

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)
    setError(null)

    if (!currentPassword) {
      setError("Vui lòng nhập mật khẩu hiện tại.")
      return
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.")
      return
    }

    setIsSubmitting(true)
    try {
      await changePassword(currentPassword, newPassword)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setMessage("Đổi mật khẩu thành công.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đổi mật khẩu.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-[900px] space-y-8 p-4 md:p-8 select-none">
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-sans font-black tracking-tight text-foreground">Đổi mật khẩu</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cập nhật mật khẩu đăng nhập cho tài khoản bệnh nhân của bạn.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-5">
          <div>
            <label htmlFor="currentPassword" className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Mật khẩu hiện tại
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="w-full rounded-md border border-[#0e0f0c] bg-card px-4 py-3 text-sm font-medium text-[#0e0f0c] outline-none transition-colors focus:border-primary"
              autoComplete="current-password"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Mật khẩu mới
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-md border border-[#0e0f0c] bg-card px-4 py-3 text-sm font-medium text-[#0e0f0c] outline-none transition-colors focus:border-primary"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Xác nhận mật khẩu mới
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-md border border-[#0e0f0c] bg-card px-4 py-3 text-sm font-medium text-[#0e0f0c] outline-none transition-colors focus:border-primary"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-xl border border-[#2ead4b]/20 bg-[#e2f6d5] px-4 py-3 text-sm font-semibold text-[#054d28]">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-primary hover:bg-[#cdffad] px-6 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors cursor-pointer border border-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Đang cập nhật..." : "Đổi mật khẩu"}
          </button>
        </form>
      </section>
    </div>
  )
}
