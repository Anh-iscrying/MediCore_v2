"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { Star } from "lucide-react"
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
  doctor_schedules: DoctorSchedule[]
  availableSlots: string[]
  Achievements: string[]
}

interface Appointment {
  id: number | string
  doctor?: string
  doctorName?: string
  doctorId?: number
  specialty?: string
  specialtyId?: number
  date?: string
  appointmentDate?: string
  time?: string
  timeSlot?: string
  status?: string
  symptoms?: string
  symptomsInitial?: string
}

interface Specialty {
  id: number
  name: string
  doctorCount?: number
}

function getTodayIso() {
  return new Date().toISOString().slice(0, 10)
}

function addDaysIso(dateIso: string, days: number) {
  const date = new Date(`${dateIso}T00:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function formatDateLabel(dateIso?: string) {
  if (!dateIso) return ""
  return new Date(`${dateIso}T00:00:00`).toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  })
}

function isActiveAppointmentStatus(status?: string) {
  return !!status && status !== "CANCELLED"
}

async function readApiError(response: Response, fallback: string) {
  try {
    const payload = await response.json()
    return payload?.error || payload?.message || fallback
  } catch {
    return fallback
  }
}

export default function AppointmentsPage() {
  const [bookingFlow, setBookingFlow] = useState<"time" | "appointments">("time")
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [selectedSpecialty, setSelectedSpecialty] = useState("")

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const todayIso = getTodayIso()
  const maxDateIso = addDaysIso(todayIso, 30)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [selectedDate, setSelectedDate] = useState(todayIso)
  const [symptoms, setSymptoms] = useState("")
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<"success" | "danger">("success")
  const [toastTitle, setToastTitle] = useState<string | undefined>(undefined)
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null)

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

  // Booked appointments list
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Parse URL search params safely on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get("tab")
      if (tab === "appointments") {
        setBookingFlow("appointments")
      } else {
        setBookingFlow("time")
      }

      const pendingBookingSuccess = window.sessionStorage.getItem("bookingSuccess")
      if (pendingBookingSuccess) {
        triggerToast(pendingBookingSuccess, "success", "Đặt lịch thành công")
        window.sessionStorage.removeItem("bookingSuccess")
      }
    }
  }, [])

  const hasRestoredRef = useRef(false)

  // Load saved choices from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSpecialty = window.sessionStorage.getItem("booking_specialty")
      const savedDate = window.sessionStorage.getItem("booking_date")
      const savedTimeSlot = window.sessionStorage.getItem("booking_timeSlot")
      const savedSymptoms = window.sessionStorage.getItem("booking_symptoms")

      if (savedSpecialty) setSelectedSpecialty(savedSpecialty)
      if (savedDate) setSelectedDate(savedDate)
      if (savedTimeSlot) setSelectedTimeSlot(savedTimeSlot)
      if (savedSymptoms) setSymptoms(savedSymptoms)

      hasRestoredRef.current = true
    }
  }, [])

  // Sync state changes to sessionStorage once restoration is complete
  useEffect(() => {
    if (!hasRestoredRef.current) return
    window.sessionStorage.setItem("booking_specialty", selectedSpecialty)
  }, [selectedSpecialty])

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

  // Fetch doctors for a given date and refresh is_booked state
  const loadDoctors = useCallback(async (date: string, activeSpecialty?: string) => {
    try {
      const docsRes = await fetch(`/api/doctors?date=${encodeURIComponent(date)}`)
      if (!docsRes.ok) throw new Error(await readApiError(docsRes, "Không thể tải danh sách bác sĩ"))
      const docsData: Doctor[] = await docsRes.json()
      setDoctors(docsData)

      // Re-select a valid slot from the refreshed doctor list
      const specialty = activeSpecialty || selectedSpecialty
      const docsForSpecialty = docsData.filter((doc: Doctor) => doc.specialty === specialty)
      const docsWithSlot = docsForSpecialty.filter((doc: Doctor) =>
        doc.doctor_schedules.some(s => s.work_date === date && !s.is_booked && s.time_slot === selectedTimeSlot)
      )
      if (docsWithSlot.length > 0) {
        setSelectedDoctor(docsWithSlot[0])
      } else {
        // Previously selected slot may now be booked — reset to first available
        const docWithAnySlot = docsForSpecialty.find((doc: Doctor) =>
          doc.doctor_schedules.some(s => s.work_date === date && !s.is_booked)
        )
        if (docWithAnySlot) {
          const firstSlot = docWithAnySlot.doctor_schedules.find(s => s.work_date === date && !s.is_booked)?.time_slot ?? ""
          setSelectedDoctor(docWithAnySlot)
          setSelectedTimeSlot(firstSlot)
        }
      }
    } catch (err) {
      console.error("Failed to reload doctors:", err)
    }
  }, [selectedSpecialty, selectedTimeSlot])

  // Fetch doctors and appointments on mount/date change
  useEffect(() => {
    async function initData() {
      try {
        const [specialtiesRes, docsRes, appsRes] = await Promise.all([
          fetch("/api/specialties"),
          fetch(`/api/doctors?date=${encodeURIComponent(selectedDate)}`),
          fetch("/api/appointments")
        ])

        if (!specialtiesRes.ok) throw new Error(await readApiError(specialtiesRes, "Không thể tải danh sách chuyên khoa"))
        if (!docsRes.ok) throw new Error(await readApiError(docsRes, "Không thể tải danh sách bác sĩ"))
        if (!appsRes.ok) throw new Error(await readApiError(appsRes, "Không thể tải lịch hẹn"))

        const specialtiesData = await specialtiesRes.json()
        const docsData = await docsRes.json()
        const appsData = await appsRes.json()
        const savedSpecialty = typeof window !== "undefined" ? window.sessionStorage.getItem("booking_specialty") : null
        const savedTimeSlot = typeof window !== "undefined" ? window.sessionStorage.getItem("booking_timeSlot") : null

        const activeSpecialty = savedSpecialty || selectedSpecialty || specialtiesData[0]?.name || ""
        const currentSlot = savedTimeSlot || selectedTimeSlot

        setSpecialties(specialtiesData)
        setDoctors(docsData)
        setAppointments(appsData)
        if (activeSpecialty) {
          setSelectedSpecialty(activeSpecialty)
        }

        const initialDocsForSpecialty = docsData.filter((doc: Doctor) => doc.specialty === activeSpecialty)
        const availableDocs = initialDocsForSpecialty.filter((doc: Doctor) => getAvailableSlots(doc, selectedDate).includes(currentSlot))
        if (availableDocs.length > 0) {
          setSelectedDoctor(availableDocs[0])
          if (currentSlot) {
            setSelectedTimeSlot(currentSlot)
          }
        } else if (initialDocsForSpecialty.length > 0) {
          const docWithSchedule = initialDocsForSpecialty.find((doc: Doctor) => getAvailableSlots(doc, selectedDate).length > 0)
          if (docWithSchedule) {
            setSelectedDoctor(docWithSchedule)
            setSelectedTimeSlot(getAvailableSlots(docWithSchedule, selectedDate)[0])
          } else {
            setSelectedDoctor(initialDocsForSpecialty[0])
            setSelectedTimeSlot("")
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err)
        triggerToast(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải dữ liệu.", "danger", "Lỗi dữ liệu")
      } finally {
        setIsLoading(false)
      }
    }
    initData()
  }, [selectedDate])

  const getAllSlots = (doctor: Doctor, workDate = selectedDate) =>
    doctor.doctor_schedules
      .filter(schedule => schedule.work_date === workDate)
      .map(schedule => schedule.time_slot)

  const getAvailableSlots = (doctor: Doctor, workDate = selectedDate) =>
    doctor.doctor_schedules
      .filter(schedule => schedule.work_date === workDate && !schedule.is_booked)
      .map(schedule => schedule.time_slot)

  const getSelectedScheduleTimeSlot = (doctor: Doctor) =>
    doctor.doctor_schedules.find(
      schedule =>
        schedule.work_date === selectedDate &&
        !schedule.is_booked &&
        schedule.time_slot === selectedTimeSlot
    )?.time_slot ?? selectedTimeSlot

  const specialtyDoctors = doctors.filter(doc => doc.specialty === selectedSpecialty)
  const availableTimeSlots = Array.from(
    new Set(specialtyDoctors.flatMap(doc => getAllSlots(doc)))
  ).sort()

  // Filter doctors based on specialty, selected date and doctor_schedules
  const filteredDoctors = specialtyDoctors.filter(
    doc => getAvailableSlots(doc).includes(selectedTimeSlot)
  )

  // Handle flow switch
  const handleFlowChange = (flow: "time" | "appointments") => {
    setBookingFlow(flow)
  }

  // Handle specialty change
  const handleSpecialtyChange = (spec: string) => {
    setSelectedSpecialty(spec)

    const docs = doctors.filter(doc => doc.specialty === spec)
    const availableDocs = docs.filter(doc => getAvailableSlots(doc).includes(selectedTimeSlot))
    if (availableDocs.length > 0) {
      setSelectedDoctor(availableDocs[0])
    } else {
      const docWithSchedule = docs.find(doc => getAvailableSlots(doc).length > 0)
      if (docWithSchedule) {
        setSelectedDoctor(docWithSchedule)
        setSelectedTimeSlot(getAvailableSlots(docWithSchedule)[0])
      }
    }
  }

  // Handle time slot change
  const handleTimeSlotChange = (slot: string) => {
    setSelectedTimeSlot(slot)

    const availableDocs = doctors.filter(doc => doc.specialty === selectedSpecialty && getAvailableSlots(doc).includes(slot))
    if (availableDocs.length > 0) {
      const isCurrentDocAvailable = availableDocs.some(d => d.id === selectedDoctor?.id)
      if (!isCurrentDocAvailable) {
        setSelectedDoctor(availableDocs[0])
      }
    }
  }

  // Handle booking action
  const handleBook = async (doctorToBook?: Doctor) => {
    const targetDoc = doctorToBook || selectedDoctor
    if (!targetDoc) return

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
          doctorId: targetDoc.id,
          appointmentDate: selectedDate,
          timeSlot: getSelectedScheduleTimeSlot(targetDoc),
          symptomsInitial: trimmedSymptoms
        })
      })
      if (!res.ok) throw new Error(await readApiError(res, "Đặt lịch thất bại"))

      const newApp = await res.json()
      setAppointments(prev => [newApp, ...prev])

      triggerToast(
        `Đăng ký lịch hẹn thành công với ${targetDoc.doctor_name}`,
        "success",
        "Đặt lịch thành công"
      )

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("booking_timeSlot")
        window.sessionStorage.removeItem("booking_symptoms")
      }
      setSymptoms("")
      setSelectedTimeSlot("")

      setBookingFlow("appointments")
    } catch (err) {
      console.error("Booking error:", err)
      triggerToast(err instanceof Error ? err.message : "Đã xảy ra lỗi khi đặt lịch.", "danger", "Đặt lịch thất bại")
    }
  }

  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return

    try {
      const res = await fetch("/api/appointments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: appointmentToCancel.id,
          status: "CANCELLED",
        }),
      })

      if (!res.ok) throw new Error(await readApiError(res, "Failed to cancel appointment"))

      setAppointments((prev) =>
        prev.map((app) =>
          app.id === appointmentToCancel.id
            ? { ...app, status: "CANCELLED" }
            : app
        )
      )

      // Re-fetch doctors so the cancelled slot's is_booked resets to false
      await loadDoctors(selectedDate)

      setAppointmentToCancel(null)
      triggerToast("Hủy lịch thành công", "danger", "Hủy lịch thành công")
    } catch (err) {
      console.error("Cancel error:", err)
      triggerToast(err instanceof Error ? err.message : "Lỗi khi hủy lịch hẹn.", "danger", "Hủy lịch thất bại")
    }
  }

  const getAppointmentDoctor = (appointment: Appointment) =>
    appointment.doctorName || appointment.doctor || doctors.find(doc => doc.id === appointment.doctorId)?.doctor_name || "Bác sĩ"

  const getAppointmentSpecialty = (appointment: Appointment) =>
    appointment.specialty || specialties.find(specialty => specialty.id === appointment.specialtyId)?.name || ""

  const getAppointmentDate = (appointment: Appointment) =>
    appointment.date || formatDateLabel(appointment.appointmentDate)

  const getAppointmentTime = (appointment: Appointment) =>
    appointment.time || appointment.timeSlot || ""

  const isWaitingStatus = (status?: string) => status === "PENDING" || status === "WAITING"
  const isConfirmedStatus = (status?: string) => status === "CONFIRMED"
  const isInProgressStatus = (status?: string) => status === "IN_PROGRESS"
  const isCompletedStatus = (status?: string) => status === "COMPLETED" || status === "DONE"

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-8 p-4 md:p-8 select-none flex flex-col items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-foreground" />
        <p className="text-muted-foreground text-sm font-semibold mt-4">Đang tải thông tin từ hệ thống...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-4 md:p-8 select-none">
      <BookingSuccessToast message={toastMessage} title={toastTitle} variant={toastVariant} />

      {appointmentToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e0f0c]/30 px-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-none">
            <h3 className="text-base font-sans font-black text-foreground tracking-tight">
              Bạn có chắc chắn muốn hủy lịch không?
            </h3>
            <p className="mt-2 text-xs text-muted-foreground">
              Lịch hẹn với {getAppointmentDoctor(appointmentToCancel)} vào {getAppointmentDate(appointmentToCancel)} • {getAppointmentTime(appointmentToCancel)}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setAppointmentToCancel(null)}
                className="rounded-xl border border-[#0e0f0c] bg-card px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#0e0f0c] hover:bg-background transition-colors"
              >
                Không
              </button>
              <button
                type="button"
                onClick={handleCancelAppointment}
                className="rounded-xl border border-destructive bg-destructive px-4 py-2 text-xs font-bold uppercase tracking-wider text-destructive-foreground hover:bg-destructive/80 transition-colors"
              >
                Có
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flow Switcher (Tabs) */}
      <div className="flex justify-center sm:justify-start">
        <div className="bg-[#e8ebe6] p-1 rounded-xl flex gap-1 border border-border shadow-none">
          <button
            onClick={() => handleFlowChange("time")}
            className={cn(
              "rounded-xl px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border",
              bookingFlow === "time"
                ? "bg-card text-foreground border-border"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Theo Thời gian
          </button>
          <button
            onClick={() => handleFlowChange("appointments")}
            className={cn(
              "rounded-xl px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border",
              bookingFlow === "appointments"
                ? "bg-card text-foreground border-border"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Lịch hẹn của bạn
          </button>
        </div>
      </div>

      {/* Upper Booking Grid */}
      {bookingFlow === "time" && (
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Flow B - Left Column: Time & Specialty Filters */}
          <article className="rounded-xl border border-border bg-card p-6 lg:col-span-1 flex flex-col justify-between lg:h-[670px]">
            <div>
              <div className="mb-6">
                <div>
                  <h2 className="text-base font-sans font-black text-foreground tracking-tight">Bộ lọc thời gian</h2>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Chọn ngày, giờ khám để tìm bác sĩ</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Specialty Select */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Chuyên khoa khám</label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => handleSpecialtyChange(e.target.value)}
                    className="w-full rounded-md border border-[#0e0f0c] bg-card text-[#0e0f0c] px-4 py-2.5 text-xs font-bold outline-none focus:border-primary transition-colors cursor-pointer"
                  >
                    {specialties.map(spec => (
                      <option key={spec.id} value={spec.name}>Khoa {spec.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date Input */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Ngày hẹn khám</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={todayIso}
                    max={maxDateIso}
                    className="w-full rounded-md border border-[#0e0f0c] bg-card text-[#0e0f0c] px-4 py-2.5 text-xs font-bold outline-none focus:border-primary transition-colors cursor-pointer"
                  />
                </div>

                {/* Time Slots Buttons */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Chọn ca khám mong muốn</label>
                  <div className="max-h-[150px] overflow-y-auto pr-1 scrollbar-hide grid grid-cols-3 gap-2">
                    {availableTimeSlots.map((slot) => {
                      const isActive = selectedTimeSlot === slot
                      const isAvailable = specialtyDoctors.some(doc => getAvailableSlots(doc).includes(slot))
                      return (
                        <button
                          key={slot}
                          disabled={!isAvailable}
                          onClick={() => handleTimeSlotChange(slot)}
                          className={cn(
                            "rounded-md py-2 text-center text-xs font-bold uppercase tracking-wider transition-all bg-card",
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
                    })}
                  </div>
                </div>

                {/* Symptoms Input */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Khai báo triệu chứng</label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Ghi rõ các triệu chứng..."
                    required
                    className="w-full h-20 rounded-md border border-[#0e0f0c] bg-card text-[#0e0f0c] px-4 py-2.5 text-xs font-medium outline-none focus:border-primary resize-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="rounded-md bg-secondary p-3 text-[11px] text-muted-foreground leading-relaxed border border-border">
                <span>Chọn bác sĩ ở cột bên phải để đặt lịch khám nhanh hoặc xem chi tiết chuyên môn.</span>
              </div>
            </div>
          </article>

          {/* Flow B - Right Column: Available Doctors Grid */}
          <article className="rounded-xl border border-border bg-card p-6 lg:col-span-2 flex flex-col justify-between lg:h-[670px]">
            <div className="flex flex-col h-full overflow-hidden">
              <div className="mb-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-sans font-black text-foreground tracking-tight">Danh sách bác sĩ</h2>
                </div>
                <span className="text-[11px] font-bold text-[#0e0f0c] bg-secondary px-3 py-1 rounded-xl border border-border">
                  Lịch hẹn: {selectedTimeSlot} • {selectedDate}
                </span>
              </div>

              <p className="text-xs text-muted-foreground mb-5 shrink-0">
                Các bác sĩ chuyên khoa <strong className="text-foreground">Khoa {selectedSpecialty}</strong> có lịch trống vào lúc <strong className="text-foreground">{selectedTimeSlot}</strong> ngày <strong className="text-foreground">{selectedDate}</strong>:
              </p>

              <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide flex flex-col gap-4 pb-2">
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doc) => {
                    return (
                      <div
                        key={doc.id}
                        className="p-5 rounded-xl border border-border bg-background hover:border-primary transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left group shrink-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-foreground shrink-0 border border-border bg-card">
                            {doc.doctor_name.split(" ").slice(-1)[0][0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-sans font-black text-foreground tracking-tight">{doc.doctor_name}</h4>
                              <span className="text-[10px] text-[#054d28] bg-[#e2f6d5] px-2 py-0.5 rounded-full font-bold border border-[#2ead4b]/20">
                                {doc.specialty}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{doc.degree} - {doc.experience_years} năm kinh nghiệm</p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0 w-full sm:w-auto">
                          <Link
                            href={`/dashboard/doctors/${doc.id}`}
                            className="rounded-xl border border-[#0e0f0c] text-[#0e0f0c] hover:bg-background px-5 py-2.5 text-center text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer bg-card"
                          >
                            Xem chi tiết
                          </Link>
                          <button
                            onClick={() => handleBook(doc)}
                            className="rounded-xl bg-primary hover:bg-[#cdffad] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors cursor-pointer border border-primary"
                          >
                            Đặt lịch nhanh
                          </button>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-12 text-xs text-muted-foreground font-medium">
                    Không có bác sĩ nào trống lịch vào khung giờ này. Vui lòng chọn ca khám hoặc ngày khám khác.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border shrink-0">
              <div className="rounded-md bg-secondary p-3 text-[11px] text-muted-foreground leading-relaxed border border-border">
                <span>Quy định: Hủy lịch tối thiểu 2 giờ trước giờ hẹn khám.</span>
              </div>
            </div>
          </article>
        </section>
      )}

      {bookingFlow === "appointments" && (() => {
        const sortedAppointments = [...appointments].sort((a, b) => {
          return Number(b.id) - Number(a.id)
        })

        return (
          <section className="rounded-xl border border-border bg-card p-6 shadow-none flex flex-col justify-between lg:h-[680px] overflow-hidden">
            <div className="flex flex-col h-full overflow-hidden">
              <div className="mb-5 shrink-0">
                <h2 className="text-lg font-sans font-black text-foreground tracking-tight">Danh sách lịch hẹn khám của bạn</h2>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide flex flex-col gap-3 pb-2">
                {sortedAppointments.length > 0 ? (
                  sortedAppointments.map((appointment, idx) => (
                    <div key={`${appointment.id}-${idx}`} className="rounded-xl border border-border bg-background p-4 shrink-0">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-3">
                        <div>
                          <p className="text-sm font-sans font-black text-foreground tracking-tight">{getAppointmentDoctor(appointment)}</p>
                          <p className="mt-1 text-xs text-muted-foreground">Khoa {getAppointmentSpecialty(appointment)} • {getAppointmentDate(appointment)} • {getAppointmentTime(appointment)}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn(
                          "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                          isConfirmedStatus(appointment.status) ? "bg-[#e2f6d5] text-[#054d28] border-[#2ead4b]/20" :
                            isInProgressStatus(appointment.status) ? "bg-blue-50 text-blue-700 border-blue-200" :
                              isWaitingStatus(appointment.status) ? "bg-amber-50 text-amber-700 border-amber-200" :
                                "bg-secondary text-muted-foreground border-border"
                        )}>
                          {isConfirmedStatus(appointment.status) ? "ĐÃ XÁC NHẬN" :
                            isInProgressStatus(appointment.status) ? "ĐANG KHÁM" :
                              isWaitingStatus(appointment.status) ? "ĐANG CHỜ" :
                                isCompletedStatus(appointment.status) ? "ĐÃ KHÁM" : "ĐÃ HỦY"}
                        </span>
                        {appointment.status !== "CANCELLED" && !isCompletedStatus(appointment.status) && (
                          <button
                            onClick={() => setAppointmentToCancel(appointment)}
                            className="rounded-xl border border-border bg-card px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#c64545] hover:bg-background transition-colors"
                          >
                            Hủy lịch
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-xs text-muted-foreground font-medium">
                  Bạn chưa có lịch hẹn khám nào được đăng ký.
                </div>
              )}
            </div>
          </div>
          </section>
        )
      })()}
    </div>
  )
}
