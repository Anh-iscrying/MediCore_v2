"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface Medicine {
  medicineId: number
  medicineName: string
  unit: string
  quantity: number
  dosageInstruction: string
}

interface MedicalRecord {
  id: number
  createdAt: string
  appointmentDate: string
  doctorName: string
  medicines: Medicine[]
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPrescriptions() {
      try {
        const res = await fetch("/api/backend/clinical/medical-records/me", {
          credentials: "include"
        })
        if (res.ok) {
          const result = await res.json()
          const records: MedicalRecord[] = result.data || []
          const withMedicines = records.filter((r) => r.medicines && r.medicines.length > 0)
          
          // Sort by newest first
          withMedicines.sort((a, b) => {
            const dateA = a.createdAt || a.appointmentDate
            const dateB = b.createdAt || b.appointmentDate
            return new Date(dateB || 0).getTime() - new Date(dateA || 0).getTime()
          })
          
          setPrescriptions(withMedicines)
        }
      } catch (error) {
        console.error("Failed to fetch prescriptions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrescriptions()
  }, [])

  const activeCount = prescriptions.filter((p) => {
    const dateStr = p.createdAt || p.appointmentDate
    if (!dateStr) return false
    const diff = Date.now() - new Date(dateStr).getTime()
    return diff <= 30 * 24 * 60 * 60 * 1000
  }).length

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-4 md:p-8 select-none">
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-sans font-black text-foreground">{activeCount} đơn thuốc đang hoạt động</h2>
          <p className="mt-2 text-sm text-muted-foreground">Kê theo đợt khám gần đây nhất.</p>
        </article>
        <article className="rounded-xl border border-border bg-card p-6 md:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-sans font-black text-foreground">Thao tác đơn thuốc</h2>
              <p className="mt-1 text-sm text-muted-foreground">Tải file PDF hoặc in ấn đơn thuốc điện tử.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button className="rounded-xl border border-[#0e0f0c] bg-card px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#0e0f0c] hover:bg-background transition-colors cursor-pointer">
                Tải PDF
              </button>
              <button className="rounded-xl border border-[#0e0f0c] bg-card px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#0e0f0c] hover:bg-background transition-colors cursor-pointer">
                In đơn thuốc
              </button>
            </div>
          </div>
        </article>
      </section>

      <section className="space-y-6">
        {loading ? (
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        ) : prescriptions.length === 0 ? (
          <p className="text-muted-foreground">Không tìm thấy đơn thuốc nào.</p>
        ) : (
          prescriptions.map((prescription) => {
            const dateStr = prescription.createdAt || prescription.appointmentDate
            const dateObj = dateStr ? new Date(dateStr) : null

            let formattedDate = "Đang cập nhật"
            let status = "LỊCH SỬ"

            if (dateObj) {
              const day = String(dateObj.getDate()).padStart(2, '0')
              const month = String(dateObj.getMonth() + 1).padStart(2, '0')
              const year = dateObj.getFullYear()
              formattedDate = `Ngày ${day} tháng ${month}, ${year}`

              const diffDays = (Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24)
              if (diffDays <= 30) {
                status = "ĐANG DÙNG"
              }
            }

            return (
              <article key={prescription.id} className="rounded-xl border border-border bg-card p-6">
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div>
                      <h2 className="text-2xl font-sans font-black text-foreground tracking-tight">{formattedDate}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Bác sĩ kê toa: {prescription.doctorName || "Đang cập nhật"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "w-max rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                      status === "ĐANG DÙNG"
                        ? "border-[#2ead4b]/20 bg-[#e2f6d5] text-[#054d28]"
                        : "border-border bg-secondary text-muted-foreground"
                    )}
                  >
                    {status}
                  </span>
                </div>

                <div className="space-y-3">
                  {prescription.medicines.map((medicine, index) => (
                    <div
                      key={medicine.medicineId || index}
                      className="rounded-xl border border-border bg-background p-4"
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Tên thuốc
                          </p>
                          <p className="mt-1 text-sm font-black text-foreground">
                            {medicine.medicineName || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Số lượng
                          </p>
                          <p className="mt-1 text-sm font-black text-foreground">
                            {medicine.quantity != null
                              ? `${medicine.quantity} ${medicine.unit || ""}`.trim()
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Hướng dẫn cách dùng/Liều lượng
                          </p>
                          <p className="mt-1 text-sm font-black text-foreground">
                            {medicine.dosageInstruction || "Đang cập nhật"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            )
          })
        )}
      </section>
    </div>
  )
}

