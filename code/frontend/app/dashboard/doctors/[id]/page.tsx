"use client"

import { use, useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { BookingSuccessToast } from "@/components/dashboard/booking-success-toast"

interface DoctorSchedule {
  id: number
  doctor_id: number
  work_date: string
  time_slot: string
  is_booked: boolean
}

interface Doctor {
  id: number
  specialty_id: number
  doctor_code: string
  doctor_name: string
  specialty: string
  degree: string
  experience_years: number
  bio: string
  avatarColor: string
  avatar_url?: string
  doctor_schedules: DoctorSchedule[]
  availableSlots: string[]
  achievements?: string[]
}

interface BackendDoctor {
  id: number
  name: string
  specialtyId: number
  specialtyName: string
  title?: string
  bio?: string
  experience?: number
  avatar?: string
  doctorCode?: string
  achievements?: string[]
  Achievements?: string[]
}

interface Appointment {
  id: number | string
  status?: string
}

function getTodayIso() {
  return new Date().toISOString().slice(0, 10)
}

function addDaysIso(dateIso: string, days: number) {
  const date = new Date(`${dateIso}T00:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function isActiveAppointmentStatus(status?: string) {
  return !!status && status !== "CANCELLED"
}

function isSlotBookable(dateIso: string, slot: string) {
  if (!dateIso || !slot) return false
  const now = new Date()
  const startTimeStr = slot.split("-")[0].trim() // e.g. "08:00"
  const [year, month, day] = dateIso.split("-").map(Number)
  const [hour, minute] = startTimeStr.split(":").map(Number)

  const slotDate = new Date(year, month - 1, day, hour, minute, 0, 0)

  const twoHoursInMs = 2 * 60 * 60 * 1000
  return (slotDate.getTime() - now.getTime()) >= twoHoursInMs
}

async function readApiError(response: Response, fallback: string) {
  try {
    const payload = await response.json()
    return payload?.error || payload?.message || fallback
  } catch {
    return fallback
  }
}

function normalizeDoctorPayload(doctor: BackendDoctor): Doctor {
  return {
    id: doctor.id,
    specialty_id: doctor.specialtyId,
    doctor_code: doctor.doctorCode ?? "",
    doctor_name: doctor.name,
    specialty: doctor.specialtyName,
    degree: doctor.title ?? "Chưa cập nhật",
    experience_years: doctor.experience ?? 0,
    bio: doctor.bio ?? "Chưa cập nhật tiểu sử bác sĩ.",
    avatarColor: "bg-[#111111] border border-[#1f1f1f] text-white",
    avatar_url: doctor.avatar,
    doctor_schedules: [],
    availableSlots: [],
    achievements: doctor.achievements ?? doctor.Achievements ?? [],
  }
}

export default function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: docId } = use(params)
  const router = useRouter()

  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const todayIso = getTodayIso()
  const maxDateIso = addDaysIso(todayIso, 30)
  const [selectedDate, setSelectedDate] = useState(todayIso)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [symptoms, setSymptoms] = useState("")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<"success" | "danger">("success")
  const [toastTitle, setToastTitle] = useState<string | undefined>(undefined)

  const triggerToast = (message: string, variant: "success" | "danger" = "success", title?: string) => {
    setToastTitle(title)
    setToastVariant(variant)
    setToastMessage(message)
  }

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  const hasRestoredRef = useRef(false)

  // Load saved choices from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDate = window.sessionStorage.getItem("booking_date")
      const savedSymptoms = window.sessionStorage.getItem("booking_symptoms")

      if (savedDate) setSelectedDate(savedDate)
      if (savedSymptoms) setSymptoms(savedSymptoms)

      hasRestoredRef.current = true
    }
  }, [])

  // Sync state changes to sessionStorage once restoration is complete
  useEffect(() => {
    if (!hasRestoredRef.current) return
    window.sessionStorage.setItem("booking_date", selectedDate)
  }, [selectedDate])

  useEffect(() => {
    if (!hasRestoredRef.current) return
    window.sessionStorage.setItem("booking_timeSlot", selectedTimeSlot)
  }, [selectedTimeSlot])

  useEffect(() => {
    if (!hasRestoredRef.current) return
    window.sessionStorage.setItem("booking_symptoms", symptoms)
  }, [symptoms])

  useEffect(() => {
    async function fetchDoctor() {
      try {
        const detailRes = await fetch(`/api/backend/doctors/${encodeURIComponent(docId)}`)
        if (!detailRes.ok) throw new Error(await readApiError(detailRes, "Không thể tải thông tin bác sĩ"))

        const detailPayload = await detailRes.json()
        const detailDoctor = normalizeDoctorPayload(detailPayload.data)
        const availableRes = await fetch(
          `/api/doctors?date=${encodeURIComponent(selectedDate)}&specialtyId=${encodeURIComponent(String(detailDoctor.specialty_id))}`
        )
        if (!availableRes.ok) throw new Error(await readApiError(availableRes, "Không thể tải lịch trống của bác sĩ"))

        const appointmentsRes = await fetch("/api/appointments")
        if (!appointmentsRes.ok) throw new Error(await readApiError(appointmentsRes, "Không thể tải lịch hẹn của bạn"))

        const availableDoctors: Doctor[] = await availableRes.json()
        const appsData: Appointment[] = await appointmentsRes.json()
        const availability = availableDoctors.find((d: Doctor) => d.id === Number(docId))
        const mergedDoctor = {
          ...detailDoctor,
          doctor_schedules: availability?.doctor_schedules ?? [],
          availableSlots: availability?.availableSlots ?? [],
        }

        setDoctor(mergedDoctor)
        setAppointments(appsData)

        // Restore saved slot if available, otherwise fallback to first available
        const savedTimeSlot = typeof window !== "undefined" ? window.sessionStorage.getItem("booking_timeSlot") : null
        const isSavedSlotAvailable = savedTimeSlot && mergedDoctor.doctor_schedules.some(
          schedule => !schedule.is_booked && schedule.time_slot === savedTimeSlot && isSlotBookable(selectedDate, savedTimeSlot)
        )

        if (isSavedSlotAvailable) {
          setSelectedTimeSlot(savedTimeSlot)
        } else {
          const firstAvailableSlot = mergedDoctor.doctor_schedules.find(
            schedule => !schedule.is_booked && isSlotBookable(selectedDate, schedule.time_slot)
          )?.time_slot
          setSelectedTimeSlot(firstAvailableSlot ?? "")
        }
      } catch (err) {
        console.error("Fetch doctor details error:", err)
        triggerToast(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải thông tin bác sĩ.", "danger", "Lỗi tải thông tin")
      } finally {
        setIsLoading(false)
      }
    }
    fetchDoctor()
  }, [docId, selectedDate])

  const getSelectedScheduleTimeSlot = (doctorToBook: Doctor) =>
    doctorToBook.doctor_schedules.find(
      schedule =>
        schedule.work_date === selectedDate &&
        !schedule.is_booked &&
        schedule.time_slot === selectedTimeSlot
    )?.time_slot ?? selectedTimeSlot

  const handleBook = async () => {
    if (!doctor || !selectedTimeSlot) return

    if (appointments.some(app => isActiveAppointmentStatus(app.status))) {
      triggerToast("Bạn chỉ có thể đặt một lịch khám đang hoạt động. Vui lòng hủy lịch hiện tại trước khi đặt lịch mới.", "danger", "Không thể đặt lịch")
      return
    }

    const trimmedSymptoms = symptoms.trim()
    if (!trimmedSymptoms) {
      triggerToast("Vui lòng nhập triệu chứng ban đầu trước khi đặt lịch.", "danger", "Khai báo triệu chứng")
      return
    }

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doctor.id,
          appointmentDate: selectedDate,
          timeSlot: getSelectedScheduleTimeSlot(doctor),
          symptomsInitial: trimmedSymptoms
        })
      })
      if (!res.ok) throw new Error(await readApiError(res, "Đặt lịch thất bại"))

      const successMessage = `Đăng ký lịch hẹn thành công với ${doctor.doctor_name}`
      triggerToast(successMessage, "success", "Đặt lịch thành công")

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("bookingSuccess", successMessage)
        window.sessionStorage.removeItem("booking_timeSlot")
        window.sessionStorage.removeItem("booking_symptoms")
      }

      router.push("/dashboard/appointments?tab=appointments")
    } catch (err) {
      console.error("Booking error:", err)
      triggerToast(err instanceof Error ? err.message : "Đã xảy ra lỗi khi đặt lịch.", "danger", "Đặt lịch thất bại")
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] select-none flex flex-col items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-foreground" />
        <p className="text-muted-foreground text-sm font-semibold mt-4">Đang tải thông tin bác sĩ...</p>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="mx-auto max-w-[1400px] p-4 md:p-8 select-none flex flex-col items-center justify-center min-h-[500px]">
        <p className="text-destructive text-sm font-semibold mb-4">Không tìm thấy thông tin bác sĩ.</p>
        <Link
          href="/dashboard/appointments"
          className="rounded-xl bg-[#0e0f0c] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest border border-[#0e0f0c] hover:bg-[#0e0f0c]/80"
        >
          Quay lại lịch hẹn
        </Link>
      </div>
    )
  }

  const availableTimeSlots = Array.from(
    new Set(
      doctor.doctor_schedules
        .filter(schedule => schedule.work_date === selectedDate)
        .map(schedule => schedule.time_slot)
    )
  ).sort()

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-4 md:p-8 select-none">
      <BookingSuccessToast message={toastMessage} title={toastTitle} variant={toastVariant} />

      {/* Back button */}
      <div>
        <Link
          href="/dashboard/appointments"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#868685] hover:text-[#0e0f0c] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách lịch hẹn</span>
        </Link>
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Doctor Detailed Information */}
        <article className="rounded-xl border border-border bg-card p-8 lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-border">
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-3xl font-bold text-foreground shrink-0 border border-border bg-card shadow-none">
              {doctor.avatar_url ? (
                <img
                  src={doctor.avatar_url}
                  alt={doctor.doctor_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                doctor.doctor_name.split(" ").slice(-1)[0][0]
              )}
            </div>
            <div className="text-center sm:text-left space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#054d28] bg-[#e2f6d5] px-3 py-1 rounded-full border border-[#2ead4b]/20">
                BS. Chuyên Khoa
              </span>
              <h2 className="text-2xl font-sans font-black text-foreground mt-2 tracking-tight">{doctor.doctor_name}</h2>
            </div>
          </div>

          <div className="space-y-5 text-sm leading-relaxed">
            <div>
              <h3 className="text-xs text-[#868685] uppercase font-bold tracking-widest mb-2">Học vấn & Trình độ</h3>
              <p className="text-foreground bg-background p-4 rounded-xl border border-border font-medium">
                {doctor.degree} và có {doctor.experience_years} năm kinh nghiệm làm tại chuyên khoa {doctor.specialty}.
              </p>
            </div>

            <div>
              <h3 className="text-xs text-[#868685] uppercase font-bold tracking-widest mb-2">Tiểu sử & Chuyên môn sâu</h3>
              <p className="text-foreground bg-background p-4 rounded-xl border border-border font-medium">
                {doctor.bio}
              </p>
            </div>

            <div>
              <h3 className="text-xs text-[#868685] uppercase font-bold tracking-widest mb-2">Thành tựu đạt được</h3>
              <div className="bg-background rounded-xl border border-border p-4">
                {doctor.achievements?.length ? (
                  <ul className="space-y-3">
                    {doctor.achievements.map((item, index) => (
                      <li key={index} className="flex items-center gap-4">
                        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-primary text-xs">⭐</span>
                        </div>

                        <span className="text-sm leading-6 text-foreground">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm leading-6 text-foreground">Chưa cập nhật thành tựu.</p>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Right Column: Direct Booking Form */}
        <article className="rounded-xl border border-[#0e0f0c] bg-card p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="mb-6 border-b border-border pb-4">
              <h3 className="text-base font-sans font-black text-foreground uppercase tracking-wider">Đặt lịch với bác sĩ</h3>
              <p className="text-[11px] text-muted-foreground font-medium mt-1">Vui lòng điền thông tin lịch hẹn dưới đây</p>
            </div>

            <div className="space-y-5">
              {/* 1. Date Input */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">1. Chọn ngày hẹn khám</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={todayIso}
                  max={maxDateIso}
                  className="w-full rounded-md border border-[#0e0f0c] bg-card text-[#0e0f0c] px-4 py-3 text-xs font-bold outline-none focus:border-primary transition-colors cursor-pointer"
                />
              </div>

              {/* 2. Shifts Selection */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">2. Chọn ca khám (Khung giờ)</label>
                <div className="max-h-[150px] overflow-y-auto pr-1 scrollbar-hide grid grid-cols-3 gap-2">
                  {availableTimeSlots.length > 0 ? availableTimeSlots.map((slot) => {
                    const isActive = selectedTimeSlot === slot
                    const isAvailable = isSlotBookable(selectedDate, slot) && doctor.doctor_schedules.some(
                      schedule =>
                        schedule.work_date === selectedDate &&
                        !schedule.is_booked &&
                        schedule.time_slot === slot
                    )
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={cn(
                          "rounded-md py-2.5 text-center text-xs font-bold uppercase tracking-wider transition-all bg-card",
                          isActive
                            ? "bg-primary text-primary-foreground border-primary"
                            : isAvailable
                              ? "border border-[#0e0f0c] text-[#0e0f0c] hover:border-primary hover:text-primary cursor-pointer"
                              : "border border-border/50 text-muted-foreground/50 cursor-not-allowed line-through bg-transparent"
                        )}
                      >
                        {slot}
                      </button>
                    )
                  }) : (
                    <div className="col-span-3 rounded-md border border-border bg-background p-3 text-center text-xs font-medium text-muted-foreground">
                      Bác sĩ chưa có lịch trống trong ngày này.
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Symptoms Input */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">3. Mô tả triệu chứng</label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Ghi rõ các triệu chứng..."
                  required
                  className="w-full h-24 rounded-md border border-[#0e0f0c] bg-card text-[#0e0f0c] px-4 py-3 text-xs font-medium outline-none focus:border-primary resize-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-border">
            <button
              onClick={handleBook}
              type="button"
              className="w-full rounded-xl bg-primary hover:bg-[#cdffad] py-3.5 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors cursor-pointer border border-primary"
            >
              Xác nhận đặt lịch
            </button>
            <div className="mt-3 rounded-md bg-secondary p-3 text-[10px] text-muted-foreground leading-relaxed border border-border">
              <span>Bảo mật: Hồ sơ và triệu chứng khai báo chỉ được chia sẻ với bác sĩ đảm nhận ca khám của bạn.</span>
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}
