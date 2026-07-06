"use client"

import { useEffect, useMemo, useState } from "react"

import { getMyMedicalRecords, type MedicalRecord } from "@/lib/medical-records"

function formatRecordDate(value?: string) {
  if (!value) return "Chưa có ngày khám"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
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

  return (
    <div className="prescriptions-page mx-auto max-w-[1400px] space-y-8 p-4 md:p-8 select-none">
      {isLoading ? (
        <section className="rounded-xl border border-border bg-card p-10 text-center text-sm font-medium text-muted-foreground">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
          Đang tải đơn thuốc điện tử...
        </section>
      ) : error ? (
        <section className="rounded-xl border border-destructive/30 bg-card p-6 text-sm font-medium text-destructive">
          {error}
        </section>
      ) : prescriptionRecords.length === 0 ? (
        <section className="rounded-xl border border-border bg-card p-10 text-center">
          <h2 className="text-lg font-sans font-black text-foreground">Chưa có đơn thuốc điện tử</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Đơn thuốc sẽ xuất hiện sau khi bác sĩ hoàn tất hồ sơ khám và kê thuốc cho bạn.
          </p>
        </section>
      ) : (
        <section className="space-y-6">
          {prescriptionRecords.map((record) => {
            return (
              <article key={record.id} className="prescription-print-card rounded-xl border border-border bg-card p-6">
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-sans font-black text-foreground tracking-tight">{getRecordTitle(record)}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Bác sĩ kê toa: {record.doctorName || "Bác sĩ"}</p>
                    {record.emrCode && (
                      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Mã hồ sơ: {record.emrCode}</p>
                    )}
                  </div>
                  <div className="prescription-actions flex flex-wrap items-center gap-2">
                    {record.pdfUrl ? (
                      <a
                        href={record.pdfUrl}
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
                  </div>
                </div>

                <div className="space-y-3">
                  {record.medicines?.map((medicine, index) => (
                    <div key={`${record.id}-${medicine.medicineId ?? medicine.medicineName ?? index}`} className="prescription-medicine rounded-xl border border-border bg-background p-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tên thuốc</p>
                          <p className="mt-1 text-sm font-black text-foreground">{medicine.medicineName || "Chưa rõ tên thuốc"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Số lượng</p>
                          <p className="mt-1 text-sm font-black text-foreground">
                            {medicine.quantity ? `${medicine.quantity} ${medicine.unit || ""}`.trim() : medicine.unit || "Theo chỉ định"}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hướng dẫn cách dùng</p>
                          <p className="mt-1 text-sm font-black text-foreground">{medicine.dosageInstruction || "Theo hướng dẫn của bác sĩ"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            )
          })}
        </section>
      )}
    </div>
  )
}
