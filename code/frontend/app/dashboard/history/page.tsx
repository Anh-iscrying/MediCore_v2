"use client"

import { useEffect, useState } from "react"
import { getMyMedicalRecords, type MedicalRecord } from "@/lib/medical-records"

export default function MedicalHistoryPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadRecords() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getMyMedicalRecords()
        if (!cancelled) setRecords(data || [])
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Không thể tải hồ sơ bệnh án")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadRecords()

    return () => {
      cancelled = true
    }
  }, [])

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filteredRecords = normalizedSearch
    ? records.filter((record) => [
      record.symptoms,
      record.historySummary,
      record.mainDiagnosis,
      record.diagnosisName,
      record.doctorName,
      record.careAdvice,
    ].some((value) => value?.toLowerCase().includes(normalizedSearch)))
    : records

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-4 md:p-8 select-none">
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <div className="flex items-center gap-3 rounded-md border border-[#0e0f0c] bg-card px-4 py-3 text-muted-foreground">
            <span className="text-sm font-semibold">Hồ sơ bệnh án điện tử được đồng bộ từ lần khám đã hoàn thành.</span>
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-sans font-black text-foreground">{records.length} đợt khám bệnh</h2>
          <p className="mt-2 text-sm text-muted-foreground">Bấm Xem PDF để mở phiếu khám và đơn thuốc của từng lần khám.</p>
        </article>
      </section>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 text-xs text-muted-foreground font-medium">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
          Đang tải hồ sơ bệnh án...
        </div>
      )}

      {error && !isLoading && (
        <article className="rounded-xl border border-destructive bg-card p-6 text-sm text-destructive">
          {error}
        </article>
      )}

      {!isLoading && !error && records.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-5">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Tìm kiếm lịch sử triệu chứng
          </label>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm theo triệu chứng, chẩn đoán, bác sĩ..."
            className="w-full rounded-md border border-[#0e0f0c] bg-card px-4 py-2.5 text-sm font-medium text-[#0e0f0c] outline-none transition-colors focus:border-primary"
          />
          {normalizedSearch && (
            <p className="mt-2 text-xs font-semibold text-muted-foreground">
              Tìm thấy {filteredRecords.length}/{records.length} hồ sơ phù hợp.
            </p>
          )}
        </section>
      )}

      {!isLoading && !error && records.length === 0 && (
        <article className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Chưa có hồ sơ khám đã hoàn thành.
        </article>
      )}

      {!isLoading && !error && records.length > 0 && filteredRecords.length === 0 && (
        <article className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Không tìm thấy triệu chứng phù hợp.
        </article>
      )}

      {!isLoading && !error && filteredRecords.length > 0 && (
        <section className="space-y-4">
          {filteredRecords.map((record) => (
            <article key={record.id} className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {record.appointmentDate || record.createdAt || "Không rõ ngày"} {record.timeSlot ? `• ${record.timeSlot}` : ""}
                    </p>
                    <h2 className="mt-2 text-2xl font-sans font-black text-foreground tracking-tight">
                      {record.mainDiagnosis || record.diagnosisName || "Hồ sơ khám"}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {record.doctorName || "Bác sĩ"} • {record.emrCode}
                    </p>
                  </div>
                </div>
                {record.pdfUrl ? (
                  <a
                    href={record.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full rounded-xl border border-[#0e0f0c] bg-card px-5 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-[#0e0f0c] hover:bg-background md:w-auto cursor-pointer transition-colors"
                  >
                    Xem phiếu khám/đơn thuốc PDF
                  </a>
                ) : (
                  <span className="w-full rounded-xl border border-border bg-background px-5 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground md:w-auto">
                    PDF chưa được tạo
                  </span>
                )}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Triệu chứng</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#454745] font-medium">{record.symptoms || "Chưa có thông tin"}</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Khám lâm sàng</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#454745] font-medium">{record.physicalExamination || "Chưa có thông tin"}</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4 md:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hướng dẫn điều trị</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#454745] font-medium">{record.careAdvice || "Chưa có thông tin"}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}
