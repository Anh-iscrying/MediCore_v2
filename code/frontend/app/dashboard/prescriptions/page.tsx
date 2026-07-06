"use client"

import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { getMyMedicalRecords, type MedicalRecord } from "@/lib/medical-records"

function formatRecordDate(value?: string) {
  if (!value) return "Chưa có ngày khám"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

function getRecordTitle(record: MedicalRecord) {
  const date = formatRecordDate(record.appointmentDate || record.createdAt)
  const diagnosis = record.mainDiagnosis || record.diagnosisName || "Đơn thuốc điện tử"
  return `${date} • ${diagnosis}`
}

export default function PrescriptionsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadPrescriptions() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getMyMedicalRecords()
        if (!isMounted) return
        setRecords(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : "Không thể tải đơn thuốc điện tử.")
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadPrescriptions()

    return () => {
      isMounted = false
    }
  }, [])

  const prescriptionRecords = useMemo(() => {
    return records
      .filter((record) => record.medicines && record.medicines.length > 0)
      .sort((a, b) => {
        const aTime = new Date(a.appointmentDate || a.createdAt || "").getTime()
        const bTime = new Date(b.appointmentDate || b.createdAt || "").getTime()
        return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime)
      })
  }, [records])

  const activeCount = useMemo(() => {
    return prescriptionRecords.filter((p) => {
      const dateStr = p.createdAt || p.appointmentDate
      if (!dateStr) return false
      const diff = Date.now() - new Date(dateStr).getTime()
      return diff <= 30 * 24 * 60 * 60 * 1000
    }).length
  }, [prescriptionRecords])

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
              <button 
                onClick={() => window.print()}
                className="rounded-xl border border-[#0e0f0c] bg-card px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#0e0f0c] hover:bg-background transition-colors cursor-pointer"
              >
                In đơn thuốc
              </button>
            </div>
          </div>
        </article>
      </section>

      <section className="space-y-6">
        {isLoading ? (
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        ) : error ? (
          <p className="text-destructive font-medium">{error}</p>
        ) : prescriptionRecords.length === 0 ? (
          <p className="text-muted-foreground">Không tìm thấy đơn thuốc nào.</p>
        ) : (
          prescriptionRecords.map((prescription) => {
            const dateStr = prescription.createdAt || prescription.appointmentDate
            const dateObj = dateStr ? new Date(dateStr) : null

            let formattedDate = getRecordTitle(prescription)
            let status = "LỊCH SỬ"

            if (dateObj) {
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
                      {prescription.emrCode && (
                        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Mã hồ sơ: {prescription.emrCode}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {prescription.pdfUrl ? (
                      <a
                        href={prescription.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-[#0e0f0c] bg-card px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0e0f0c] hover:bg-background transition-colors"
                      >
                        Xem PDF
                      </a>
                    ) : (
                      <span className="rounded-xl border border-border bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Chưa có PDF
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="rounded-xl border border-[#0e0f0c] bg-card px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0e0f0c] hover:bg-background transition-colors"
                    >
                      In đơn thuốc
                    </button>
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
                </div>

                <div className="space-y-3">
                  {prescription.medicines?.map((medicine, index) => (
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
                            {medicine.medicineName || "Chưa rõ tên thuốc"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Số lượng
                          </p>
                          <p className="mt-1 text-sm font-black text-foreground">
                            {medicine.quantity ? `${medicine.quantity} ${medicine.unit || ""}`.trim() : medicine.unit || "Theo chỉ định"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Hướng dẫn cách dùng
                          </p>
                          <p className="mt-1 text-sm font-black text-foreground">
                            {medicine.dosageInstruction || "Theo hướng dẫn của bác sĩ"}
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
