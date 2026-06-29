"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { apiFetch } from "@/lib/api"

const cardShadow = { boxShadow: "0px 2px 4px rgba(0,0,0,0.2), 0px 8px 16px -4px rgba(0,0,0,0.4)" }

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
        <div className="rounded-lg border border-[#e6dfd8] bg-[#efe9de] p-6 text-sm font-semibold text-[#6c6a64]" style={cardShadow}>
          Đang tải hồ sơ bệnh nhân...
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-[1400px] p-4 md:p-8">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-sm font-semibold text-destructive" style={cardShadow}>
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
    <div className="mx-auto max-w-[1400px] space-y-8 p-4 md:p-8">
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="rounded-lg border border-[#cc785c] bg-[#cc785c] p-6 text-white" style={cardShadow}>
          <h2 className="text-2xl font-serif font-medium">Hồ sơ bệnh nhân</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/95">Thông tin lấy từ tài khoản đã xác thực và hồ sơ bệnh nhân trong hệ thống.</p>
          <button className="mt-5 rounded-md bg-[#faf9f5] border border-[#faf9f5] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#cc785c] hover:bg-[#efe9de] transition-colors cursor-pointer">
            Chỉnh sửa hồ sơ
          </button>
        </article>

        <article className="rounded-lg border border-[#e6dfd8] bg-[#efe9de] p-6 lg:col-span-2" style={cardShadow}>
          <div className="mb-5">
            <h2 className="text-xl font-serif font-medium text-foreground">Thông tin định danh</h2>
            <p className="text-sm text-[#6c6a64] mt-0.5">Thông tin đăng ký cơ bản của bệnh nhân.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {profileFields.map((field) => (
              <div key={field.label} className="rounded-lg border border-[#e6dfd8] bg-[#faf9f5] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#6c6a64]">{field.label}</p>
                <p className="mt-1 text-sm font-bold text-foreground">{field.value}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className="rounded-lg border border-[#e6dfd8] bg-[#efe9de] p-6" style={cardShadow}>
          <div className="mb-5">
            <h2 className="text-xl font-serif font-medium text-foreground">Thông tin liên hệ</h2>
          </div>
          <div className="space-y-3">
            {contactFields.map((field) => (
              <div key={field.label} className="flex items-start justify-between gap-4 border-b border-[#e6dfd8] pb-3 last:border-0 last:pb-0">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6c6a64]">{field.label}</span>
                <span className="text-right text-sm font-semibold text-foreground">{field.value}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-[#e6dfd8] bg-[#efe9de] p-6" style={cardShadow}>
          <div className="mb-5">
            <h2 className="text-xl font-serif font-medium text-foreground">Trạng thái hồ sơ</h2>
          </div>
          <div className="rounded-lg border border-[#e6dfd8] bg-[#faf9f5] p-4">
            <p className="text-sm font-bold text-foreground">{displayValue(profile.status)}</p>
            <p className="mt-1 text-sm text-[#6c6a64]">Ngày tạo: {displayValue(profile.createdAt)}</p>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className="rounded-lg border border-[#e6dfd8] bg-[#efe9de] p-6" style={cardShadow}>
          <div className="mb-5">
            <h2 className="text-xl font-serif font-medium text-foreground">Bệnh nền & Tiền sử bệnh án</h2>
          </div>
          <div className="rounded-md border border-[#e6dfd8] bg-[#faf9f5] p-3 text-sm font-semibold text-[#3d3d3a]">
            Chưa có dữ liệu bệnh án.
          </div>
        </article>

        <article className="rounded-lg border border-[#e6dfd8] bg-[#efe9de] p-6" style={cardShadow}>
          <div className="mb-5">
            <h2 className="text-xl font-serif font-medium text-foreground">Dị ứng thuốc đã biết</h2>
          </div>
          <div className="rounded-md border border-[#e6dfd8] bg-[#faf9f5] p-3 text-sm font-semibold text-[#3d3d3a]">
            Chưa có dữ liệu dị ứng thuốc.
          </div>
        </article>
      </section>
    </div>
  )
}
