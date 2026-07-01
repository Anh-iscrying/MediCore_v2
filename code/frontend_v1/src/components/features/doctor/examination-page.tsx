"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, AlertCircle, History, Lightbulb, Sparkles, User } from "lucide-react"
import { Button } from "@/components/base/ui/button"
import { Input } from "@/components/base/ui/input"
import { Textarea } from "@/components/base/ui/textarea"
import { Card } from "@/components/base/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/base/ui/select"
import { useData } from "@/providers/data-provider"
import type { Appointment, Patient } from "@/types/medical"

interface ExaminationPageProps {
  patient: Patient
  appointment?: Appointment | null
}

export function ExaminationPage({ patient, appointment }: ExaminationPageProps) {
  const router = useRouter()
  const { 
    icdCodes, 
    medicines, 
    addExaminationRecord, 
    addPrescription,
    updateAppointment,
    updatePatient,
    examinationRecords,
    prescriptions,
    ensureMedicinesLoaded,
    ensureIcdLoaded
  } = useData()

  useEffect(() => {
    ensureMedicinesLoaded()
    ensureIcdLoaded()
  }, [ensureMedicinesLoaded, ensureIcdLoaded])

  const [icdCode, setIcdCode] = useState("")
  const [mainDiagnosis, setMainDiagnosis] = useState("")
  const [symptoms, setSymptoms] = useState("")
  const [physicalExam, setPhysicalExam] = useState("")
  const [testResults, setTestResults] = useState("")
  const [treatment, setTreatment] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")
  const [examinationNotes, setExaminationNotes] = useState("")

  const [prescriptionItems, setPrescriptionItems] = useState<
    Array<{ medicineId: string; medicineName: string; quantity: number; unit: string; dosage: string; notes?: string }>
  >([])
  const [prescriptionNotes, setPrescriptionNotes] = useState("")
  const [selectedMedicineId, setSelectedMedicineId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [dosage, setDosage] = useState("")
  const [medicineNotes, setMedicineNotes] = useState("")

  const selectedIcd = icdCodes.find((c) => c.id === icdCode)
  const selectedMedicine = medicines.find((m) => m.id === selectedMedicineId)

  const handleAddMedicine = () => {
    if (selectedMedicineId && selectedMedicine && quantity && dosage) {
      setPrescriptionItems((prev) => [
        ...prev,
        {
          medicineId: selectedMedicineId,
          medicineName: selectedMedicine.name,
          quantity: parseInt(quantity),
          unit: selectedMedicine.unit,
          dosage,
          notes: medicineNotes,
        },
      ])
      setSelectedMedicineId("")
      setQuantity("")
      setDosage("")
      setMedicineNotes("")
    }
  }

  const handleRemoveMedicine = (index: number) => {
    setPrescriptionItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSaveExamination = async () => {
    if (!icdCode || !mainDiagnosis || !symptoms || !physicalExam || !treatment) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc")
      return
    }

    const today = new Date().toISOString().split("T")[0]
    const appointmentRecordId = appointment?.id ?? ""
    const doctorId = appointment?.doctorId ?? "dr1"

    try {
      // Save examination record
      addExaminationRecord({
        appointmentId: appointmentRecordId,
        patientId: patient.id,
        doctorId,
        examinationDate: today,
        icdCode,
        mainDiagnosis: selectedIcd?.name || mainDiagnosis,
        symptoms,
        physicalExamination: physicalExam,
        testResults: testResults || undefined,
        treatment,
        followUpDate: followUpDate || undefined,
        notes: examinationNotes,
        createdAt: today,
      })

      // Save prescription if there are items
      if (prescriptionItems.length > 0) {
        addPrescription({
          appointmentId: appointmentRecordId,
          patientId: patient.id,
          doctorId,
          prescriptionDate: today,
          items: prescriptionItems,
          notes: prescriptionNotes,
          status: "issued",
        })
      }

      if (appointment) {
        await updateAppointment(appointment.id, {
          ...appointment,
          status: "DONE",
        })
      }

      // Update patient status
      await updatePatient(patient.id, {
        ...patient,
        status: "completed",
      })

      alert("Lưu khám bệnh thành công")
      router.push("/doctor/waiting-patients")
    } catch (error) {
      console.error("Không thể lưu khám bệnh", error)
      alert("Không thể lưu khám bệnh. Vui lòng thử lại.")
    }
  }

  const calculateAge = () => {
    const today = new Date()
    const birthDate = new Date(patient.dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // AI & History contexts helper calculations
  const patientRecords = examinationRecords
    .filter((r) => r.patientId === patient.id)
    .sort((a, b) => new Date(b.examinationDate).getTime() - new Date(a.examinationDate).getTime())

  const getLastExaminationDaysAgo = () => {
    if (patientRecords.length === 0) return null
    const lastRecord = patientRecords[0]
    const lastDate = new Date(lastRecord.examinationDate)
    const today = new Date()
    const daysAgo = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysAgo
  }

  const generateAlerts = () => {
    const alerts: Array<{ type: string; message: string; severity: "warning" | "info" }> = []

    if (patientRecords.length === 0) {
      alerts.push({
        type: "Lần khám đầu tiên",
        message: "Đây là lần khám bệnh đầu tiên của bệnh nhân",
        severity: "info",
      })
    } else {
      const daysAgo = getLastExaminationDaysAgo()
      if (daysAgo && daysAgo > 90) {
        alerts.push({
          type: "Quá hạn tái khám",
          message: `Lần khám cuối cách đây ${daysAgo} ngày`,
          severity: "warning",
        })
      } else if (daysAgo && daysAgo > 30) {
        alerts.push({
          type: "Cần tái khám",
          message: `Lần khám cuối cách đây ${daysAgo} ngày`,
          severity: "info",
        })
      }
    }

    const chronicDiseases = patientRecords
      .filter((r) => r.icdCode && r.icdCode.startsWith("I"))
      .map((r) => r.mainDiagnosis)
    if (chronicDiseases.length > 0) {
      alerts.push({
        type: "Bệnh mãn tính",
        message: `Bệnh nhân có tiền sử: ${[...new Set(chronicDiseases)].join(", ")}`,
        severity: "warning",
      })
    }

    return alerts
  }

  const generateRecommendations = () => {
    const recommendations: string[] = []

    if (calculateAge() > 40) {
      recommendations.push("Kiểm tra huyết áp định kỳ")
      recommendations.push("Xét nghiệm đường huyết")
    }

    if (patientRecords.length > 3) {
      recommendations.push("Xem xét lập hồ sơ bệnh mãn tính")
    }

    if (patientRecords.some((r) => r.icdCode.includes("E"))) {
      recommendations.push("Tư vấn dinh dưỡng và tập luyện")
    }

    if (recommendations.length === 0) {
      recommendations.push("Tiếp tục theo dõi sức khỏe định kỳ")
      recommendations.push("Lựa chọn lối sống lành mạnh")
    }

    return recommendations
  }

  const alerts = generateAlerts()
  const recommendations = generateRecommendations()

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/80">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{patient.name}</h1>
            <p className="text-sm text-muted-foreground">
              {calculateAge()} tuổi • {patient.gender === "M" ? "Nam" : "Nữ"} • {patient.phone}
            </p>
          </div>
        </div>
        <Button onClick={handleSaveExamination} className="gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-sm">
          <Save className="w-4 h-4" />
          Lưu khám bệnh
        </Button>
      </div>

      {/* Patient Administrative Info & Clinical Alerts (Header Banner) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Admin Details Card */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-border/80 bg-card flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-border/40">
              <User className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Thông tin hành chính bệnh nhân</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2.5 gap-x-6 text-sm">
              <div className="flex justify-between border-b border-dashed border-border/30 pb-1.5">
                <span className="text-muted-foreground text-xs">Giới tính:</span>
                <span className="font-semibold text-foreground">{patient.gender === "M" ? "Nam" : "Nữ"}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-border/30 pb-1.5">
                <span className="text-muted-foreground text-xs">Số điện thoại:</span>
                <span className="font-semibold text-foreground">{patient.phone}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-border/30 pb-1.5">
                <span className="text-muted-foreground text-xs">Mã BHYT:</span>
                <span className="font-semibold text-foreground">{patient.insuranceNumber || "Không có"}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-border/30 pb-1.5">
                <span className="text-muted-foreground text-xs">Ngày sinh:</span>
                <span className="font-semibold text-foreground">{new Date(patient.dateOfBirth).toLocaleDateString("vi-VN")}</span>
              </div>
            </div>
          </div>
          <div className="mt-3.5 pt-3.5 border-t border-border/60">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Địa chỉ thường trú:</span>
            <p className="text-xs text-foreground/80 mt-1 leading-relaxed">{patient.address}</p>
          </div>
        </div>

        {/* Clinical Alerts Card */}
        <div className="p-5 rounded-xl border border-border/80 bg-card flex flex-col shadow-sm">
          <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-border/40">
            <AlertCircle className="w-4 h-4 text-destructive animate-pulse" />
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cảnh báo lâm sàng</h3>
            {alerts.length > 0 && (
              <span className="bg-destructive/10 text-destructive text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-destructive/20">
                {alerts.length}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-auto space-y-2 max-h-[120px] pr-1">
            {alerts.length > 0 ? (
              alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`text-xs p-2.5 rounded-lg border flex items-start gap-2 ${
                    alert.severity === "warning"
                      ? "bg-destructive/5 border-destructive/20 text-foreground"
                      : "bg-primary/5 border-primary/20 text-foreground"
                  }`}
                >
                  <AlertCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${alert.severity === "warning" ? "text-destructive" : "text-primary"}`} />
                  <div>
                    <p className="font-semibold text-foreground text-[11px]">{alert.type}</p>
                    <p className="text-muted-foreground text-[10px] mt-0.5 leading-tight">{alert.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-xs italic">
                Không có cảnh báo y tế
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Examination Form Sections */}
      <div className="space-y-6">
        
        {/* Card 1: Chẩn đoán & ICD-10 */}
        <Card className="p-5 border border-border/80 shadow-sm rounded-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Inputs */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="font-semibold text-base mb-1 text-foreground flex items-center gap-2">
                Chẩn đoán y khoa
              </h2>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Mã ICD-10 *</label>
                <Select value={icdCode} onValueChange={setIcdCode}>
                  <SelectTrigger className="w-full bg-card border-border/80">
                    <SelectValue placeholder="Tìm và chọn mã ICD-10" />
                  </SelectTrigger>
                  <SelectContent>
                    {icdCodes.map((code) => (
                      <SelectItem key={code.id} value={code.id}>
                        {code.code} - {code.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedIcd && (
                  <p className="mt-2 text-xs text-primary font-medium">Tên chẩn đoán ICD: {selectedIcd.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Chẩn đoán chính thức *</label>
                <Input
                  value={mainDiagnosis}
                  onChange={(e) => setMainDiagnosis(e.target.value)}
                  placeholder="Nhập chẩn đoán lâm sàng chính xác"
                  className="w-full bg-card"
                />
              </div>
            </div>

            {/* Right: AI Context - Lịch sử chẩn đoán */}
            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-border/60 pt-4 lg:pt-0 lg:pl-6 space-y-3 flex flex-col">
              <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                <History className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tiền sử chẩn đoán ({patientRecords.length})</span>
              </div>
              <div className="flex-1 overflow-auto space-y-2 max-h-48 pr-1">
                {patientRecords.length > 0 ? (
                  patientRecords.slice(0, 3).map((record, idx) => (
                    <div key={idx} className="text-xs p-2.5 rounded-lg bg-muted/40 border border-border/30">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-primary">{new Date(record.examinationDate).toLocaleDateString("vi-VN")}</span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase bg-card px-1.5 rounded">{record.icdCode}</span>
                      </div>
                      <p className="text-foreground font-medium leading-tight">{record.mainDiagnosis}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic py-2">Chưa có lịch sử chẩn đoán</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2: Triệu chứng & Khám lâm sàng */}
        <Card className="p-5 border border-border/80 shadow-sm rounded-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Inputs */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="font-semibold text-base mb-1 text-foreground">Triệu chứng & Khám lâm sàng</h2>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Triệu chứng lâm sàng chính *</label>
                <Textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Mô tả cụ thể các triệu chứng bệnh nhân đang gặp phải..."
                  rows={3}
                  className="w-full bg-card"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Kết quả khám lâm sàng thể chất *</label>
                <Textarea
                  value={physicalExam}
                  onChange={(e) => setPhysicalExam(e.target.value)}
                  placeholder="Kết quả đo chỉ số sinh tồn (huyết áp, nhịp tim), khám thực thể..."
                  rows={3}
                  className="w-full bg-card"
                />
              </div>
            </div>

            {/* Right: AI Context - Tiền sử triệu chứng */}
            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-border/60 pt-4 lg:pt-0 lg:pl-6 space-y-3 flex flex-col">
              <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tiền sử lâm sàng gần đây</span>
              </div>
              <div className="flex-1 overflow-auto space-y-2.5 max-h-64 pr-1">
                {patientRecords.length > 0 ? (
                  patientRecords.slice(0, 2).map((record, idx) => (
                    <div key={idx} className="text-xs p-2.5 rounded-lg bg-muted/40 border border-border/30 space-y-1">
                      <p className="font-semibold text-primary">{new Date(record.examinationDate).toLocaleDateString("vi-VN")}</p>
                      {record.symptoms && (
                        <p className="text-muted-foreground text-[11px] leading-snug">
                          <span className="font-medium text-foreground">Triệu chứng cũ:</span> {record.symptoms}
                        </p>
                      )}
                      {record.physicalExamination && (
                        <p className="text-muted-foreground text-[11px] leading-snug">
                          <span className="font-medium text-foreground">Khám cũ:</span> {record.physicalExamination}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic py-2">Chưa có lịch sử triệu chứng</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Card 3: Cận lâm sàng & Ghi chú */}
        <Card className="p-5 border border-border/80 shadow-sm rounded-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Inputs */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="font-semibold text-base mb-1 text-foreground">Cận lâm sàng & Ghi chú thêm</h2>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Kết quả xét nghiệm & Chẩn đoán hình ảnh</label>
                <Textarea
                  value={testResults}
                  onChange={(e) => setTestResults(e.target.value)}
                  placeholder="Điền kết quả xét nghiệm sinh hóa, huyết học, siêu âm, điện tim (nếu có)..."
                  rows={2}
                  className="w-full bg-card"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Ghi chú bổ sung</label>
                <Textarea
                  value={examinationNotes}
                  onChange={(e) => setExaminationNotes(e.target.value)}
                  placeholder="Các ghi chú hoặc nhắc nhở khác trong quá trình khám..."
                  rows={2}
                  className="w-full bg-card"
                />
              </div>
            </div>

            {/* Right: History of Test Results */}
            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-border/60 pt-4 lg:pt-0 lg:pl-6 space-y-3 flex flex-col">
              <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                <History className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lịch sử xét nghiệm</span>
              </div>
              <div className="flex-1 overflow-auto space-y-2 max-h-48 pr-1">
                {patientRecords.filter(r => r.testResults).length > 0 ? (
                  patientRecords.filter(r => r.testResults).slice(0, 2).map((record, idx) => (
                    <div key={idx} className="text-xs p-2.5 rounded-lg bg-muted/40 border border-border/30">
                      <p className="font-semibold text-primary mb-1">{new Date(record.examinationDate).toLocaleDateString("vi-VN")}</p>
                      <p className="text-foreground leading-tight">{record.testResults}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic py-2">Không có dữ liệu xét nghiệm cũ</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Card 4: Điều trị & Ngày tái khám */}
        <Card className="p-5 border border-border/80 shadow-sm rounded-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Inputs */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="font-semibold text-base mb-1 text-foreground">Phác đồ điều trị & Tái khám</h2>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Chỉ định điều trị & Lời dặn của bác sĩ *</label>
                <Textarea
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="Nhập phương án điều trị, lời dặn dinh dưỡng, sinh hoạt, tập luyện..."
                  rows={3}
                  className="w-full bg-card"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Ngày hẹn tái khám</label>
                <Input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full bg-card"
                />
              </div>
            </div>

            {/* Right: AI Context - Gợi ý lâm sàng AI */}
            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-border/60 pt-4 lg:pt-0 lg:pl-6 space-y-3 flex flex-col">
              <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                <Lightbulb className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Khuyến nghị điều trị AI</span>
              </div>
              <div className="flex-1 overflow-auto space-y-2.5 max-h-56 pr-1">
                {recommendations.length > 0 ? (
                  recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex gap-2 text-xs p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10 text-foreground hover:bg-amber-500/10 transition-colors cursor-pointer select-none"
                      onClick={() => {
                        setTreatment(prev => prev ? `${prev}\n• ${rec}` : `• ${rec}`)
                      }}
                      title="Click để chèn nhanh vào lời dặn bác sĩ"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-[11px] leading-tight">
                          {rec}
                        </p>
                        <span className="text-[9px] text-primary font-bold hover:underline block">Chèn nhanh vào đơn</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic py-2">Không có gợi ý điều trị</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Card 5: Kê đơn thuốc */}
        <Card className="p-5 border border-primary/20 shadow-sm rounded-xl bg-primary/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Inputs */}
            <div className="lg:col-span-8 space-y-4">
              <h3 className="font-semibold text-base text-foreground mb-1">Đơn thuốc chỉ định</h3>

              {/* Add Medicine Form */}
              <div className="space-y-3 p-4 bg-card rounded-xl border border-border/80">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Tên thuốc</label>
                    <Select value={selectedMedicineId} onValueChange={setSelectedMedicineId}>
                      <SelectTrigger className="w-full bg-card border-border/85">
                        <SelectValue placeholder="Chọn thuốc từ danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {medicines.map((med) => (
                          <SelectItem key={med.id} value={med.id}>
                            {med.name} ({med.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Số lượng</label>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Số lượng kê"
                      className="w-full bg-card"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Liều dùng (Tần suất & Cách uống)</label>
                  <Input
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="Ví dụ: 1 viên x 2 lần/ngày, uống sau ăn sáng - tối"
                    className="w-full bg-card"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Lưu ý khi dùng</label>
                  <Input
                    value={medicineNotes}
                    onChange={(e) => setMedicineNotes(e.target.value)}
                    placeholder="Ví dụ: Kiêng rượu bia khi dùng thuốc"
                    className="w-full bg-card"
                  />
                </div>
                <Button onClick={handleAddMedicine} className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold">
                  Thêm vào đơn thuốc
                </Button>
              </div>

              {/* Prescription Items List */}
              {prescriptionItems.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Thuốc đã kê</h4>
                  {prescriptionItems.map((item, index) => (
                    <div key={index} className="p-3 bg-card rounded-xl border border-border flex justify-between items-center transition-all hover:border-primary/20">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{item.medicineName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Số lượng: <span className="font-medium text-foreground">{item.quantity} {item.unit}</span> • Liều dùng: <span className="font-medium text-foreground">{item.dosage}</span>
                        </p>
                        {item.notes && <p className="text-xs text-muted-foreground italic mt-0.5">Lưu ý: {item.notes}</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMedicine(index)}
                        className="text-destructive hover:bg-destructive/5 font-semibold text-xs rounded-lg px-2.5"
                      >
                        Xóa
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* General Prescription Notes */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Hướng dẫn chung của đơn thuốc</label>
                <Textarea
                  value={prescriptionNotes}
                  onChange={(e) => setPrescriptionNotes(e.target.value)}
                  placeholder="Ghi chú chung cho cả đơn thuốc (nếu có)..."
                  rows={2}
                  className="w-full bg-card"
                />
              </div>
            </div>

            {/* Right: Prescription AI helper */}
            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-primary/20 pt-4 lg:pt-0 lg:pl-6 space-y-3 flex flex-col">
              <div className="flex items-center gap-2 pb-2 border-b border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Lịch sử kê đơn</span>
              </div>
              <div className="flex-1 overflow-auto space-y-3 max-h-[380px] pr-1">
                {patientRecords.length > 0 ? (
                  patientRecords.map((record, idx) => {
                    const pRecord = prescriptions.find(p => p.patientId === patient.id && p.prescriptionDate === record.examinationDate)
                    if (!pRecord || pRecord.items.length === 0) return null
                    return (
                      <div key={idx} className="text-xs p-3 rounded-lg bg-card border border-border/80 space-y-1.5">
                        <div className="flex justify-between items-center mb-1 pb-1 border-b border-border/40">
                          <span className="font-semibold text-primary">{new Date(record.examinationDate).toLocaleDateString("vi-VN")}</span>
                          <span className="text-[10px] text-muted-foreground italic">Trước đó</span>
                        </div>
                        <div className="space-y-2">
                          {pRecord.items.map((item, iIndex) => (
                            <div key={iIndex} className="text-[11px] leading-snug">
                              <span className="font-medium text-foreground">{item.medicineName}</span> - {item.quantity} {item.unit} ({item.dosage})
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-xs text-muted-foreground italic py-2">Chưa có đơn thuốc nào trước đó</p>
                )}
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  )
}
