"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { BookingSuccessToast } from "@/components/dashboard/booking-success-toast"

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
  availableSlots: string[]
  Achievements: string[]
}

const timeSlots = ["08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"]

export default function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: docId } = use(params)
  const router = useRouter()

  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState("2026-06-28")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [symptoms, setSymptoms] = useState("")
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDoctor() {
      try {
        const res = await fetch("/api/doctors")
        if (!res.ok) throw new Error("Failed to load doctor")
        const data: Doctor[] = await res.json()
        const found = data.find((d: Doctor) => d.id === Number(docId))
        if (found) {
          setDoctor(found)
          if (found.availableSlots.length > 0) {
            setSelectedTimeSlot(found.availableSlots[0])
          }
        }
      } catch (err) {
        console.error("Fetch doctor details error:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDoctor()
  }, [docId])

  const handleBook = async () => {
    if (!doctor) return

    const formattedDate = new Date(selectedDate).toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit"
    })

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor: doctor.doctor_name,
          specialty: doctor.specialty,
          date: formattedDate,
          time: `${selectedTimeSlot} ${Number(selectedTimeSlot.split(":")[0]) < 12 ? "AM" : "PM"}`,
          symptoms
        })
      })
      if (!res.ok) throw new Error("Booking failed")

      const successMessage = `Đăng ký lịch hẹn thành công với ${doctor.doctor_name}`
      setBookingSuccess(successMessage)

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("bookingSuccess", successMessage)
      }

      router.push("/dashboard/appointments?tab=appointments")
    } catch (err) {
      console.error("Booking error:", err)
      alert("Đã xảy ra lỗi khi đặt lịch.")
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] select-none flex flex-col items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
        <p className="text-[#a0a0a0] text-sm font-semibold mt-4">Đang tải thông tin bác sĩ...</p>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="mx-auto max-w-[1400px] p-4 md:p-8 select-none flex flex-col items-center justify-center min-h-[500px]">
        <p className="text-red-500 text-sm font-semibold mb-4">Không tìm thấy thông tin bác sĩ.</p>
        <Link
          href="/dashboard/appointments"
          className="rounded-[6px] bg-neutral-900 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest border border-[#1f1f1f] hover:bg-neutral-800"
        >
          Quay lại lịch hẹn
        </Link>
      </div>
    )
  }

  const cardShadow = { boxShadow: "0px 2px 4px rgba(0,0,0,0.2), 0px 8px 16px -4px rgba(0,0,0,0.4)" }

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-4 md:p-8 select-none">
      <BookingSuccessToast message={bookingSuccess} />

      {/* Back button */}
      <div>
        <Link
          href="/dashboard/appointments"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#6c6a64] hover:text-[#141413] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách lịch hẹn</span>
        </Link>
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Doctor Detailed Information */}
        <article className="rounded-lg border border-[#e6dfd8] bg-[#efe9de] p-8 shadow-sm lg:col-span-2 space-y-6" style={cardShadow}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-[#e6dfd8]">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-[#141413] shrink-0 shadow-md border border-[#e6dfd8] bg-[#faf9f5]">
              {doctor.doctor_name.split(" ").slice(-1)[0][0]}
            </div>
            <div className="text-center sm:text-left space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#cc785c] bg-[#cc785c]/10 px-3 py-1 rounded-full border border-[#cc785c]/20">
                BS. Chuyên Khoa
              </span>
              <h2 className="text-2xl font-serif font-medium text-[#141413] mt-2 tracking-tight">{doctor.doctor_name}</h2>
            </div>
          </div>

          <div className="space-y-5 text-sm leading-relaxed">
            <div>
              <h3 className="text-xs text-[#6c6a64] uppercase font-bold tracking-widest mb-2">Học vấn & Trình độ</h3>
              <p className="text-[#141413] bg-[#faf9f5] p-4 rounded-lg border border-[#e6dfd8] font-medium">
                {doctor.degree} và có {doctor.experience_years} năm kinh nghiệm làm tại chuyên khoa {doctor.specialty}.
              </p>
            </div>

            <div>
              <h3 className="text-xs text-[#6c6a64] uppercase font-bold tracking-widest mb-2">Tiểu sử & Chuyên môn sâu</h3>
              <p className="text-[#141413] bg-[#faf9f5] p-4 rounded-lg border border-[#e6dfd8] font-medium">
                {doctor.bio}
              </p>
            </div>

            <div>
              <h3 className="text-xs text-[#6c6a64] uppercase font-bold tracking-widest mb-2">Thành tựu đạt được</h3>
                <div className="bg-[#faf9f5] rounded-lg border border-[#e6dfd8] p-4">
                  <ul className="space-y-3">
                    {doctor.Achievements?.map((item, index) => (
                      <li key={index} className="flex items-center gap-4">
                        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#cc785c]/10">
                          <span className="text-[#cc785c] text-xs">⭐</span>
                        </div>

                        <span className="text-sm leading-6 text-[#141413]">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
            </div>
          </div>
        </article>

        {/* Right Column: Direct Booking Form */}
        <article className="rounded-lg border border-[#e6dfd8] bg-[#efe9de] p-6 shadow-sm lg:col-span-1 flex flex-col justify-between" style={cardShadow}>
          <div>
            <div className="mb-6 border-b border-[#e6dfd8] pb-4">
              <h3 className="text-base font-serif font-medium text-[#141413] uppercase tracking-wider">Đặt lịch với bác sĩ</h3>
              <p className="text-[11px] text-[#6c6a64] font-medium mt-1">Vui lòng điền thông tin lịch hẹn dưới đây</p>
            </div>

            <div className="space-y-5">
              {/* 1. Date Input */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6c6a64]">1. Chọn ngày hẹn khám</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min="2026-06-25"
                  className="w-full rounded-md border border-[#e6dfd8] bg-[#faf9f5] text-[#141413] px-4 py-3 text-xs font-bold outline-none focus:border-[#cc785c] transition-colors cursor-pointer"
                />
              </div>

              {/* 2. Shifts Selection */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6c6a64]">2. Chọn ca khám (Khung giờ)</label>
                <div className="max-h-[150px] overflow-y-auto pr-1 scrollbar-hide grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => {
                    const isActive = selectedTimeSlot === slot
                    const isAvailable = doctor.availableSlots.includes(slot)
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={cn(
                          "rounded-md py-2.5 text-center text-xs font-bold uppercase tracking-wider transition-all",
                          isActive
                            ? "bg-[#cc785c] text-white border-[#cc785c] shadow-xs"
                            : isAvailable
                            ? "border border-[#e6dfd8] text-[#6c6a64] hover:border-[#cc785c] hover:text-[#cc785c] cursor-pointer bg-[#faf9f5]"
                            : "border border-[#e6dfd8]/50 text-[#8e8b82]/50 cursor-not-allowed line-through bg-transparent"
                        )}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 3. Symptoms Input */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6c6a64]">3. Mô tả triệu chứng</label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Ghi rõ các triệu chứng..."
                  className="w-full h-24 rounded-md border border-[#e6dfd8] bg-[#faf9f5] text-[#141413] px-4 py-3 text-xs font-medium outline-none focus:border-[#cc785c] resize-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#e6dfd8]">
            <button
              onClick={handleBook}
              type="button"
              className="w-full rounded-md bg-[#cc785c] hover:bg-[#a9583e] py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-colors cursor-pointer border border-[#cc785c]"
            >
              Xác nhận đặt lịch
            </button>
            <div className="mt-3 rounded-md bg-[#f5f0e8] p-3 text-[10px] text-[#6c6a64] leading-relaxed border border-[#e6dfd8]">
              <span>Bảo mật: Hồ sơ và triệu chứng khai báo chỉ được chia sẻ với bác sĩ đảm nhận ca khám của bạn.</span>
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}
