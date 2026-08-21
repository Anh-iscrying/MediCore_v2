"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { apiFetch } from "@/lib/api"

type PatientProfile = {
  id: number
  name: string
  dateOfBirth?: string | null
  gender?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  insuranceNumber?: string | null
  status?: string | null
  patientCode?: string | null
  createdAt?: string | null
}

function formatGender(gender?: string | null) {
  if (gender === "M") return "Nam"
  if (gender === "F") return "Nữ"
  return "Khác"
}

function displayValue(value?: string | null) {
  return value && value.trim() ? value : "Chưa cập nhật"
}

export default function PatientProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<PatientProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true)
      setError("")
      try {
        const data = await apiFetch<PatientProfile>("/patients/me")
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không tải được hồ sơ bệnh nhân")
      } finally {
        setIsLoading(false)
      }
    }

    void loadProfile()
  }, [])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] p-4 md:p-8">
        <div className="rounded-xl border border-border bg-card p-6 text-sm font-semibold text-muted-foreground">
          Đang tải hồ sơ bệnh nhân...
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-[1400px] p-4 md:p-8">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm font-semibold text-destructive">
          {error || "Không tìm thấy hồ sơ bệnh nhân"}
        </div>
      </div>
    )
  }

  const profileFields = [
    { label: "Mã bệnh nhân", value: displayValue(profile.patientCode) },
    { label: "Họ và tên", value: displayValue(profile.name || user?.name) },
    { label: "Ngày sinh", value: displayValue(profile.dateOfBirth) },
    { label: "Giới tính", value: formatGender(profile.gender) }
  ]

  const contactFields = [
    { label: "Số điện thoại", value: displayValue(profile.phone) },
    { label: "Email liên hệ", value: displayValue(user?.email || profile.email) },
    { label: "Địa chỉ thường trú", value: displayValue(profile.address) },
    { label: "Mã bảo hiểm", value: displayValue(profile.insuranceNumber) }
  ]

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-4 md:p-8 select-none">
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="rounded-xl border border-foreground bg-foreground p-6 text-[#9fe870]">
          <h2 className="text-2xl font-sans font-black text-[#9fe870]">Hồ sơ bệnh nhân</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#e8ebe6]">Thông tin lấy từ tài khoản đã xác thực và hồ sơ bệnh nhân trong hệ thống.</p>
          <button className="mt-5 rounded-xl bg-primary border border-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-[#cdffad] transition-colors cursor-pointer">
            Chỉnh sửa hồ sơ
          </button>
        </article>

        <article className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <div className="mb-5">
            <h2 className="text-xl font-sans font-black text-foreground">Thông tin định danh</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Thông tin đăng ký cơ bản của bệnh nhân.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {profileFields.map((field) => (
              <div key={field.label} className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{field.label}</p>
                <p className="mt-1 text-sm font-black text-foreground">{field.value}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-border bg-card p-6">
          <div className="mb-5">
            <h2 className="text-xl font-sans font-black text-foreground">Thông tin liên hệ</h2>
          </div>
          <div className="space-y-3">
            {contactFields.map((field) => (
              <div key={field.label} className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{field.label}</span>
                <span className="text-right text-sm font-semibold text-foreground">{field.value}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-6">
          <div className="mb-5">
            <h2 className="text-xl font-sans font-black text-foreground">Trạng thái hồ sơ</h2>
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-sm font-bold text-foreground">{displayValue(profile.status)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Ngày tạo: {displayValue(profile.createdAt)}</p>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-border bg-card p-6">
          <div className="mb-5">
            <h2 className="text-xl font-sans font-black text-foreground">Bệnh nền & Tiền sử bệnh án</h2>
          </div>
          <div className="rounded-xl border border-border bg-background p-3 text-sm font-semibold text-muted-foreground">
            Chưa có dữ liệu bệnh án.
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-6">
          <div className="mb-5">
            <h2 className="text-xl font-sans font-black text-foreground">Dị ứng thuốc đã biết</h2>
          </div>
          <div className="rounded-xl border border-border bg-background p-3 text-sm font-semibold text-muted-foreground">
            Chưa có dữ liệu dị ứng thuốc.
          </div>
        </article>
      </section>
    </div>
  )
}
