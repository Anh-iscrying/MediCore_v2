"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { AIHealthAssistant } from "@/components/dashboard/ai-health-assistant"

const cardShadow = { boxShadow: "0px 2px 4px rgba(0,0,0,0.2), 0px 8px 16px -4px rgba(0,0,0,0.4)" }

interface Doctor {
  id: number
  name: string
  specialty: string
  experience: string
  rating: number
  fee: string
  education: string
  bio: string
  avatarColor: string
  availableSlots: string[]
}

const specialties = ["Tim mạch", "Vật lý trị liệu", "Đa khoa"]
const timeSlots = ["08:30", "09:00", "10:30", "14:00", "15:30"]

export default function AppointmentsPage() {
  const [bookingFlow, setBookingFlow] = useState<"time" | "appointments">("time")
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tim mạch")
  
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("09:00")
  const [selectedDate, setSelectedDate] = useState("2026-06-28")
  const [symptoms, setSymptoms] = useState("Cảm giác tức ngực sau khi vận động mạnh...")
  
  // Booked appointments list
  const [appointments, setAppointments] = useState<any[]>([])
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
    }
  }, [])

  // Fetch doctors and appointments on mount
  useEffect(() => {
    async function initData() {
      try {
        const [docsRes, appsRes] = await Promise.all([
          fetch("/api/doctors"),
          fetch("/api/appointments")
        ])
        const docsData = await docsRes.json()
        const appsData = await appsRes.json()

        setDoctors(docsData)
        setAppointments(appsData)

        // Set initial selected doctor
        const initialDocsForSpecialty = docsData.filter((doc: Doctor) => doc.specialty === "Tim mạch")
        if (initialDocsForSpecialty.length > 0) {
          setSelectedDoctor(initialDocsForSpecialty[0])
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err)
      } finally {
        setIsLoading(false)
      }
    }
    initData()
  }, [])

  // Filter doctors based on flow
  const filteredDoctors = doctors.filter(
    doc => doc.specialty === selectedSpecialty && doc.availableSlots.includes(selectedTimeSlot)
  )

  // Handle flow switch
  const handleFlowChange = (flow: "time" | "appointments") => {
    setBookingFlow(flow)
  }

  // Handle specialty change
  const handleSpecialtyChange = (spec: string) => {
    setSelectedSpecialty(spec)
    
    const docs = doctors.filter(doc => doc.specialty === spec)
    const availableDocs = docs.filter(doc => doc.availableSlots.includes(selectedTimeSlot))
    if (availableDocs.length > 0) {
      setSelectedDoctor(availableDocs[0])
    } else {
      if (docs.length > 0) {
        setSelectedDoctor(docs[0])
        setSelectedTimeSlot(docs[0].availableSlots[0])
      }
    }
  }

  // Handle time slot change
  const handleTimeSlotChange = (slot: string) => {
    setSelectedTimeSlot(slot)
    
    const availableDocs = doctors.filter(doc => doc.specialty === selectedSpecialty && doc.availableSlots.includes(slot))
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
          doctor: targetDoc.name,
          specialty: selectedSpecialty,
          date: formattedDate,
          time: `${selectedTimeSlot} ${Number(selectedTimeSlot.split(":")[0]) < 12 ? "AM" : "PM"}`,
          symptoms
        })
      })
      if (!res.ok) throw new Error("Booking failed")
      
      const newApp = await res.json()
      setAppointments(prev => [newApp, ...prev])
      alert(`Đăng ký lịch hẹn thành công với ${targetDoc.name} vào lúc ${selectedTimeSlot} ngày ${selectedDate}!`)
      setBookingFlow("appointments")
    } catch (err) {
      console.error("Booking error:", err)
      alert("Đã xảy ra lỗi khi đặt lịch.")
    }
  }

  if (isLoading || !selectedDoctor) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-8 p-4 md:p-8 select-none flex flex-col items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
        <p className="text-[#a0a0a0] text-sm font-semibold mt-4">Đang tải thông tin từ hệ thống...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-4 md:p-8 select-none">
      
      {/* Flow Switcher (Tabs) */}
      <div className="flex justify-center sm:justify-start">
        <div className="bg-[#efe9de] p-1 rounded-md flex gap-1 border border-[#e6dfd8] shadow-sm">
          <button
            onClick={() => handleFlowChange("time")}
            className={cn(
              "rounded-md px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border",
              bookingFlow === "time"
                ? "bg-[#faf9f5] text-[#141413] border-[#e6dfd8] shadow-xs"
                : "border-transparent text-[#6c6a64] hover:text-[#141413]"
            )}
          >
            Theo Thời gian
          </button>
          <button
            onClick={() => handleFlowChange("appointments")}
            className={cn(
              "rounded-md px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border",
              bookingFlow === "appointments"
                ? "bg-[#faf9f5] text-[#141413] border-[#e6dfd8] shadow-xs"
                : "border-transparent text-[#6c6a64] hover:text-[#141413]"
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
          <article className="rounded-lg border border-[#e6dfd8] bg-[#efe9de] p-6 shadow-sm lg:col-span-1 flex flex-col justify-between lg:h-[680px]" style={cardShadow}>
            <div>
              <div className="mb-6">
                <div>
                  <h2 className="text-base font-serif font-medium text-foreground tracking-tight">Bộ lọc thời gian</h2>
                  <p className="text-[11px] text-[#6c6a64] font-medium mt-0.5">Chọn ngày, giờ khám để tìm bác sĩ rảnh</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Specialty Select */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6c6a64]">Chuyên khoa khám</label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => handleSpecialtyChange(e.target.value)}
                    className="w-full rounded-md border border-[#e6dfd8] bg-[#faf9f5] text-[#141413] px-4 py-2.5 text-xs font-bold outline-none focus:border-[#cc785c] transition-colors cursor-pointer"
                  >
                    {specialties.map(spec => (
                      <option key={spec} value={spec}>Khoa {spec}</option>
                    ))}
                  </select>
                </div>

                {/* Date Input */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6c6a64]">Ngày hẹn khám</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min="2026-06-25"
                    className="w-full rounded-md border border-[#e6dfd8] bg-[#faf9f5] text-[#141413] px-4 py-2.5 text-xs font-bold outline-none focus:border-[#cc785c] transition-colors cursor-pointer"
                  />
                </div>

                {/* Time Slots Buttons */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6c6a64]">Chọn ca khám mong muốn</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => {
                      const isActive = selectedTimeSlot === slot
                      return (
                        <button
                          key={slot}
                          onClick={() => handleTimeSlotChange(slot)}
                          className={cn(
                            "rounded-md py-2 text-center text-xs font-bold uppercase tracking-wider transition-all cursor-pointer bg-[#faf9f5]",
                            isActive
                              ? "bg-[#cc785c] text-white border-[#cc785c] shadow-xs"
                              : "border border-[#e6dfd8] text-[#6c6a64] hover:border-[#cc785c] hover:text-[#cc785c]"
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
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6c6a64]">Khai báo triệu chứng</label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Ghi rõ các triệu chứng..."
                    className="w-full h-20 rounded-md border border-[#e6dfd8] bg-[#faf9f5] text-[#141413] px-4 py-2.5 text-xs font-medium outline-none focus:border-[#cc785c] resize-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#e6dfd8]">
              <div className="rounded-md bg-[#f5f0e8] p-3 text-[11px] text-[#6c6a64] leading-relaxed border border-[#e6dfd8]">
                <span>Chọn bác sĩ rảnh ở cột bên phải để đặt lịch khám nhanh hoặc xem chi tiết chuyên môn.</span>
              </div>
            </div>
          </article>

          {/* Flow B - Right Column: Available Doctors Grid */}
          <article className="rounded-lg border border-[#e6dfd8] bg-[#efe9de] p-6 shadow-sm lg:col-span-2 flex flex-col justify-between lg:h-[680px]" style={cardShadow}>
            <div className="flex flex-col h-full overflow-hidden">
              <div className="mb-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-serif font-medium text-foreground tracking-tight">Danh sách bác sĩ rảnh</h2>
                </div>
                <span className="text-[11px] font-bold text-[#141413] bg-[#faf9f5] px-3 py-1 rounded-md border border-[#e6dfd8]">
                  Lịch hẹn: {selectedTimeSlot} • {selectedDate}
                </span>
              </div>

              <p className="text-xs text-[#6c6a64] mb-5 shrink-0">
                Các bác sĩ chuyên khoa <strong className="text-[#141413]">Khoa {selectedSpecialty}</strong> có lịch trống vào lúc <strong className="text-[#141413]">{selectedTimeSlot}</strong> ngày <strong className="text-[#141413]">{selectedDate}</strong>:
              </p>

              <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide flex flex-col gap-4 pb-2">
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doc) => {
                    return (
                      <div
                        key={doc.id}
                        className="p-5 rounded-lg border border-[#e6dfd8] bg-[#faf9f5] hover:border-[#cc785c]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left group shrink-0 shadow-xs"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-[#141413] shrink-0 border border-[#e6dfd8] bg-[#f5f0e8]">
                            {doc.name.split(" ").slice(-1)[0][0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-serif font-medium text-[#141413] tracking-tight">{doc.name}</h4>
                              <span className="text-[10px] text-[#cc785c] bg-[#cc785c]/10 px-2 py-0.5 rounded-full font-bold border border-[#cc785c]/20">
                                {doc.specialty}
                              </span>
                            </div>
                            <p className="text-xs text-[#6c6a64] mt-1">{doc.experience} kinh nghiệm • {doc.education}</p>
                            
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1 text-xs font-bold text-[#e8a55a]">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span>{doc.rating} / 5.0</span>
                              </div>
                              <span className="text-xs text-[#6c6a64]">
                                Phí khám: <strong className="text-[#141413] font-bold">{doc.fee}</strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0 w-full sm:w-auto">
                          <Link
                            href={`/dashboard/doctors/${doc.id}`}
                            className="rounded-md border border-[#e6dfd8] text-[#3d3d3a] hover:bg-[#efe9de] hover:text-[#141413] px-5 py-2.5 text-center text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer bg-[#faf9f5]"
                          >
                            Xem chi tiết
                          </Link>
                          <button
                            onClick={() => handleBook(doc)}
                            className="rounded-md bg-[#cc785c] hover:bg-[#a9583e] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-colors cursor-pointer border border-[#cc785c]"
                          >
                            Đặt lịch nhanh
                          </button>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-12 text-xs text-[#6c6a64] font-medium">
                    Không có bác sĩ nào trống lịch vào khung giờ này. Vui lòng chọn ca khám hoặc ngày khám khác.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#e6dfd8] shrink-0">
              <div className="rounded-md bg-[#f5f0e8] p-3 text-[11px] text-[#6c6a64] leading-relaxed border border-[#e6dfd8]">
                <span>Quy định: Hủy/Đổi lịch tối thiểu 2 giờ trước giờ hẹn khám.</span>
              </div>
            </div>
          </article>
        </section>
      )}

      {bookingFlow === "appointments" && (
        <section className="rounded-lg border border-[#e6dfd8] bg-[#efe9de] p-6 shadow-sm flex flex-col justify-between lg:h-[680px] overflow-hidden" style={cardShadow}>
          <div className="flex flex-col h-full overflow-hidden">
            <div className="mb-5 shrink-0">
              <h2 className="text-lg font-serif font-medium text-foreground tracking-tight">Danh sách lịch hẹn khám của bạn</h2>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide flex flex-col gap-3 pb-2">
              {appointments.length > 0 ? (
                appointments.map((appointment, idx) => (
                  <div key={`${appointment.doctor}-${appointment.date}-${idx}`} className="rounded-lg border border-[#e6dfd8] bg-[#faf9f5] p-4 shrink-0 shadow-xs">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-3">
                        <div>
                          <p className="text-sm font-serif font-medium text-[#141413] tracking-tight">{appointment.doctor}</p>
                          <p className="mt-1 text-xs text-[#6c6a64]">Khoa {appointment.specialty} • {appointment.date} • {appointment.time}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn(
                          "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                          appointment.status === "CONFIRMED" ? "bg-[#5db872]/10 text-[#5db872] border-[#5db872]/20" :
                          appointment.status === "PENDING" ? "bg-[#e8a55a]/10 text-[#e8a55a] border-[#e8a55a]/20" :
                          "bg-[#efe9de] text-[#8e8b82] border-[#e6dfd8]"
                        )}>
                          {appointment.status === "CONFIRMED" ? "ĐÃ XÁC NHẬN" :
                           appointment.status === "PENDING" ? "ĐANG CHỜ" : "ĐÃ HỦY"}
                        </span>
                        <button className="rounded-md border border-[#e6dfd8] bg-[#faf9f5] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#3d3d3a] hover:bg-[#efe9de] transition-colors">
                          Đổi lịch
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch("/api/appointments", {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: appointment.id, status: "CANCELLED" })
                              })
                              if (!res.ok) throw new Error("Failed to cancel appointment")
                              
                              setAppointments(prev =>
                                prev.map(app => app.id === appointment.id ? { ...app, status: "CANCELLED" } : app)
                              )
                            } catch (err) {
                              console.error("Cancel error:", err)
                              alert("Lỗi khi hủy lịch hẹn.")
                            }
                          }}
                          className="rounded-md border border-[#e6dfd8] bg-[#faf9f5] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#c64545] hover:bg-[#efe9de] transition-colors"
                        >
                          Hủy lịch
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-xs text-[#a0a0a0] font-medium">
                  Bạn chưa có lịch hẹn khám nào được đăng ký.
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* AI Assistant Chat Section */}
      <section className="mt-8">
        <AIHealthAssistant />
      </section>
    </div>
  )
}
