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
  patientCode?: string | null
  createdAt?: string | null
}

function formatGender(gender?: string | null) {
  if (gender === "M") return "Nam"
  if (gender === "F") return "Nữ"
  if (gender === "O") return "Khác"
  return "Chưa cập nhật"
}

function displayValue(value?: string | null) {
  return value && value.trim() ? value : "Chưa cập nhật"
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "Chưa cập nhật"
  const [year, month, day] = dateStr.split("-")
  if (!year || !month || !day) return dateStr
  return `${day}/${month}/${year}`
}

export default function PatientProfilePage() {
  const { user, refreshUser } = useAuth()
  const [profile, setProfile] = useState<PatientProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    address: "",
  })
  const [formErrors, setFormErrors] = useState({
    name: "",
    dateOfBirth: "",
    phone: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

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

  const handleOpenEdit = () => {
    if (!profile) return
    setFormData({
      name: profile.name || user?.name || "",
      dateOfBirth: profile.dateOfBirth || "",
      gender: profile.gender || "",
      phone: profile.phone || "",
      address: profile.address || "",
    })
    setFormErrors({ name: "", dateOfBirth: "", phone: "" })
    setSaveError("")
    setIsEditOpen(true)
  }

  const validateForm = () => {
    let valid = true
    const errors = { name: "", dateOfBirth: "", phone: "" }

    if (!formData.name.trim()) {
      errors.name = "Họ và tên không được để trống"
      valid = false
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = "Ngày sinh không được để trống"
      valid = false
    } else {
      const selectedDate = new Date(formData.dateOfBirth)
      const today = new Date()
      selectedDate.setHours(0, 0, 0, 0)
      today.setHours(0, 0, 0, 0)
      if (selectedDate > today) {
        errors.dateOfBirth = "Ngày sinh không được sau ngày hiện tại"
        valid = false
      }
    }

    if (formData.phone && formData.phone.trim() !== "") {
      const phoneRegex = /^\d{10}$/
      if (!phoneRegex.test(formData.phone.trim())) {
        errors.phone = "Số điện thoại phải đủ 10 số"
        valid = false
      }
    }

    setFormErrors(errors)
    return valid
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSaving(true)
    setSaveError("")
    try {
      const updated = await apiFetch<PatientProfile>("/patients/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: formData.name.trim(),
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          phone: formData.phone.trim(),
          address: formData.address.trim(),
        })
      })
      setProfile(updated)
      setIsEditOpen(false)
      // Cập nhật session user để đồng bộ hiển thị họ tên ở Header
      await refreshUser()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Có lỗi xảy ra khi cập nhật hồ sơ")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] p-4 md:p-8">
        <div className="rounded-xl border border-border bg-card p-6 text-sm font-semibold text-muted-foreground animate-pulse">
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
    { label: "Ngày sinh", value: formatDate(profile.dateOfBirth) },
    { label: "Giới tính", value: formatGender(profile.gender) }
  ]

  const contactFields = [
    { label: "Số điện thoại", value: displayValue(profile.phone) },
    { label: "Email liên hệ", value: displayValue(user?.email || profile.email) },
    { label: "Địa chỉ thường trú", value: displayValue(profile.address) }
  ]

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-4 md:p-8 select-none relative">
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="rounded-xl border border-foreground bg-foreground p-6 text-[#9fe870] flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-sans font-black text-[#9fe870]">Hồ sơ bệnh nhân</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#e8ebe6]">Thông tin lấy từ tài khoản đã xác thực và hồ sơ bệnh nhân trong hệ thống.</p>
          </div>
          <button
            onClick={handleOpenEdit}
            className="mt-5 self-start rounded-xl bg-primary border border-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-[#cdffad] transition-colors cursor-pointer"
          >
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

      <section className="grid grid-cols-1 gap-6">
        <article className="rounded-xl border border-border bg-card p-6">
          <div className="mb-5">
            <h2 className="text-xl font-sans font-black text-foreground">Thông tin liên hệ</h2>
          </div>
          <div className="space-y-4">
            {contactFields.map((field) => (
              <div key={field.label} className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{field.label}</span>
                <span className="text-right text-sm font-semibold text-foreground">{field.value}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-sans font-black text-foreground mb-4">Chỉnh sửa hồ sơ</h3>

            {saveError && (
              <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs font-semibold text-destructive">
                {saveError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Họ và tên <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Họ và tên"
                />
                {formErrors.name && (
                  <p className="text-xs text-destructive mt-1 font-medium">{formErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Ngày sinh <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  {formErrors.dateOfBirth && (
                    <p className="text-xs text-destructive mt-1 font-medium">{formErrors.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Giới tính
                  </label>
                  <select
                    value={formData.gender || ""}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="">Chưa cập nhật</option>
                    <option value="M">Nam</option>
                    <option value="F">Nữ</option>
                    <option value="O">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  maxLength={10}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Số điện thoại"
                />
                {formErrors.phone && (
                  <p className="text-xs text-destructive mt-1 font-medium">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Email liên hệ
                </label>
                <input
                  type="text"
                  value={user?.email || profile.email || ""}
                  disabled
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-muted-foreground cursor-not-allowed"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Email đăng ký tài khoản không thể thay đổi</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Địa chỉ thường trú
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[80px]"
                  placeholder="Địa chỉ thường trú"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-border text-foreground hover:bg-background transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-[#cdffad] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
