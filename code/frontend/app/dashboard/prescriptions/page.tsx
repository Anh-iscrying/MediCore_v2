"use client"

import { useEffect, useMemo, useState } from "react"
import { flushSync } from "react-dom"
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

function getRecordDiagnosis(record: MedicalRecord) {
  return record.mainDiagnosis || record.diagnosisName || "Đang cập nhật"
}

function getRecordTitle(record: MedicalRecord) {
  const date = formatRecordDate(record.appointmentDate || record.createdAt)
  return `${date} • ${getRecordDiagnosis(record)}`
}

export default function PrescriptionsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [printingPrescriptionId, setPrintingPrescriptionId] = useState<number | null>(null)

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

  useEffect(() => {
    const resetPrintingPrescription = () => setPrintingPrescriptionId(null)
    window.addEventListener("afterprint", resetPrintingPrescription)

    return () => {
      window.removeEventListener("afterprint", resetPrintingPrescription)
    }
  }, [])

  function printPrescription(prescriptionId: number) {
    flushSync(() => setPrintingPrescriptionId(prescriptionId))
    window.print()
  }

  return (
    <div className={`prescriptions-page mx-auto max-w-[1400px] space-y-8 p-4 md:p-8 select-none ${printingPrescriptionId ? "is-printing-single" : ""}`}>
      <section className="prescriptions-summary grid grid-cols-1 gap-6 md:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-sans font-black text-foreground">{activeCount} đơn thuốc đang hoạt động</h2>
          <p className="mt-2 text-sm text-muted-foreground">Kê theo đợt khám gần đây nhất.</p>
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
            const formattedDate = getRecordTitle(prescription)
            const prescriptionDate = formatRecordDate(prescription.appointmentDate || prescription.createdAt)
            const diagnosis = getRecordDiagnosis(prescription)

            return (
              <article
                key={prescription.id}
                className={`prescription-print-card rounded-xl border border-border bg-card p-6 ${printingPrescriptionId === prescription.id ? "is-selected-for-print" : ""}`}
              >
                <div className="screen-only mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
                  <div className="prescription-actions flex flex-wrap items-center gap-2">
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
                      onClick={() => printPrescription(prescription.id)}
                      className="rounded-xl border border-[#0e0f0c] bg-card px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0e0f0c] hover:bg-background transition-colors"
                    >
                      In đơn thuốc
                    </button>
                  </div>
                </div>

                <div className="print-only prescription-sheet">
                  <header className="prescription-letterhead">
                    <div>
                      <p className="prescription-brand">Medicore</p>
                      <p>Hệ thống quản lý sức khỏe điện tử</p>
                    </div>
                    <div className="prescription-code">
                      <span>Mã hồ sơ</span>
                      <strong>{prescription.emrCode || "—"}</strong>
                    </div>
                  </header>

                  <section className="prescription-title-block">
                    <p>Đơn thuốc điện tử</p>
                    <h1>{diagnosis}</h1>
                  </section>

                  <section className="prescription-info-grid">
                    <div>
                      <span>Người bệnh</span>
                      <strong>{prescription.patientName || "Đang cập nhật"}</strong>
                    </div>
                    <div>
                      <span>Ngày kê đơn</span>
                      <strong>{prescriptionDate}</strong>
                    </div>
                    <div>
                      <span>Bác sĩ kê toa</span>
                      <strong>{prescription.doctorName || "Đang cập nhật"}</strong>
                    </div>
                    <div>
                      <span>Chẩn đoán</span>
                      <strong>{diagnosis}</strong>
                    </div>
                  </section>
                </div>

                <div className="prescription-medicine-list space-y-3">
                  <div className="print-only prescription-table-head">
                    <span>STT</span>
                    <span>Tên thuốc</span>
                    <span>Số lượng</span>
                    <span>Hướng dẫn sử dụng</span>
                  </div>
                  {prescription.medicines?.map((medicine, index) => (
                    <div
                      key={medicine.medicineId || index}
                      className="prescription-medicine rounded-xl border border-border bg-background p-4"
                    >
                      <div className="prescription-medicine-grid grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="print-only prescription-index">{index + 1}</div>
                        <div>
                          <p className="medicine-label text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Tên thuốc
                          </p>
                          <p className="medicine-value mt-1 text-sm font-black text-foreground">
                            {medicine.medicineName || "Chưa rõ tên thuốc"}
                          </p>
                        </div>
                        <div>
                          <p className="medicine-label text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Số lượng
                          </p>
                          <p className="medicine-value mt-1 text-sm font-black text-foreground">
                            {medicine.quantity ? `${medicine.quantity} ${medicine.unit || ""}`.trim() : medicine.unit || "Theo chỉ định"}
                          </p>
                        </div>
                        <div>
                          <p className="medicine-label text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Hướng dẫn cách dùng
                          </p>
                          <p className="medicine-value mt-1 text-sm font-black text-foreground">
                            {medicine.dosageInstruction || "Theo hướng dẫn của bác sĩ"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <footer className="print-only prescription-footer">
                  <div className="prescription-note">
                    <strong>Lưu ý</strong>
                    <p>Dùng thuốc đúng liều lượng và liên hệ cơ sở y tế nếu có dấu hiệu bất thường.</p>
                  </div>
                  <div className="prescription-signature">
                    <p>Ngày kê đơn: {prescriptionDate}</p>
                    <strong>Bác sĩ kê toa</strong>
                    <span>{prescription.doctorName || "Đang cập nhật"}</span>
                  </div>
                </footer>
              </article>
            )
          })
        )}
      </section>
    </div>
  )
}
