"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import PatientInfo from "./PatientInfo";
import ExaminationForm from "./ExaminationForm";
import PrescriptionSection from "./PrescriptionSection";
import {
  ArrowLeft,
  Save,
  Eye,
  Printer,
  AlertCircle,
  History,
  Lightbulb,
  Sparkles,
  User,
} from "lucide-react";
import ExaminationPrintPreview from "./examination-print-preview"
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
import { useReactToPrint } from "react-to-print"
import { useRef } from "react"

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

  const [previewMode, setPreviewMode] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)
  const [treatment, setTreatment] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")
  const [examinationNotes, setExaminationNotes] = useState("")
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: `Xin chào bác sĩ 👋

Tôi có thể hỗ trợ:

• Gợi ý chẩn đoán

• Tóm tắt bệnh án

• Đề xuất xét nghiệm

• Kiểm tra tương tác thuốc`,
    },
  ]);

  const [input, setInput] = useState("");
  const handleSendMessage = () => {
    if (!input.trim()) return;

    const question = input;

    setMessages((prev) => [
      ...prev,
      {
        sender: "doctor",
        text: question,
      },
    ]);

    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text:
            "Đây là phản hồi giả lập của MediCore AI.\n\nTriệu chứng: " +
            question +
            "\n\nKhuyến nghị: Khám lâm sàng thêm trước khi kết luận.",
        },
      ]);
    }, 800);
  };
  const sendQuickQuestion = (question: string) => {
    setInput(question)
  }
  const [prescriptionItems, setPrescriptionItems] = useState<
    Array<{ medicineId: string; medicineName: string; quantity: number; unit: string; dosage: string; notes?: string }>
  >([])
  const [prescriptionNotes, setPrescriptionNotes] = useState("")
  const [selectedTemplateId, setSelectedTemplateId] = useState("")

  const treatmentTemplates = [
    { id: "1", name: "Combo cảm cúm" },
    { id: "2", name: "Combo tăng huyết áp" },
    { id: "3", name: "Combo tiểu đường" },
  ];
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
  const handlePrint = () => {
    console.log(printRef.current);

    if (!printRef.current) {
      alert("printRef = null");
      return;
    }

    reactToPrint();
  };
  const reactToPrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `PhieuKham_${patient.name}`,
  });
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
        <div className="flex justify-end items-center gap-3 mb-6">

          {/* Xem trước */}
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? "Chỉnh sửa" : "Xem trước"}
          </Button>

          {/* In PDF */}
          {previewMode && (
            <Button
              variant="outline"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4 mr-2" />
              In PDF
            </Button>
          )}

          {/* Lưu */}
          <Button
            onClick={handleSaveExamination}
            className="bg-green-700 hover:bg-green-800"
          >
            <Save className="w-4 h-4 mr-2" />
            Lưu khám bệnh
          </Button>

        </div>
      </div>


      {/* Examination Form Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Phiếu khám */}
        <div className="lg:col-span-8">
          {previewMode ? (

            <div ref={printRef}>

              <ExaminationPrintPreview
                patient={patient}
                symptoms={symptoms}
                physicalExam={physicalExam}
                testResults={testResults}
                examinationNotes={examinationNotes}
                diagnosis={mainDiagnosis}
                icdCode={selectedIcd?.code ?? ""}
                treatment={treatment}
                followUpDate={followUpDate}
                prescriptionItems={prescriptionItems}
                prescriptionNotes={prescriptionNotes}
                onBack={() => setPreviewMode(false)}
                onPrint={handlePrint}
              />

            </div>

          ) : (

            <div>
              <Card
                id="print-area"
                className="
                bg-white
                rounded-lg
                border
                shadow-md
                overflow-hidden

                w-full
                max-w-[210mm]
                mx-auto

                print:w-[210mm]
                print:max-w-none
                print:rounded-none
                print:shadow-none
                print:border-none
                print:bg-white
                "
              >
                {/* Header */}
                {/* ================= HEADER ================= */}

                <div className="border-b bg-white">

                  <div className="px-8 pt-8">

                    <div className="flex justify-between items-start">

                      {/* Logo + phòng khám */}

                      <div>

                        <h2 className="text-xl font-bold text-green-700">
                          MEDICORE CLINIC
                        </h2>

                        <p className="text-sm text-muted-foreground mt-1">
                          Hồ sơ bệnh án điện tử
                        </p>

                      </div>

                      {/* Thông tin phiếu */}

                      <div className="text-right text-sm">

                        <p>
                          <span className="font-semibold">
                            Mã BN:
                          </span>{" "}
                          {patient.id}
                        </p>

                        <p className="mt-1">
                          <span className="font-semibold">
                            Ngày khám:
                          </span>{" "}
                          {new Date().toLocaleDateString("vi-VN")}
                        </p>

                      </div>

                    </div>

                    <div className="mt-8 text-center">

                      <h1 className="text-3xl font-bold tracking-wider">

                        PHIẾU KHÁM NGOẠI TRÚ

                      </h1>

                    </div>

                  </div>

                  <div className="mt-8 border-t" />

                </div>
                {/*Thông tin bệnh nhân */}
                {/* Section: Thông tin bệnh nhân */}
                <div className="border-b border-border/70">
                  {/* Header */}
                  <div className="bg-green-50 border-l-4 border-green-600 px-6 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      <h2 className="text-base font-semibold text-foreground">
                        I. THÔNG TIN BỆNH NHÂN
                      </h2>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">

                    <div className="grid grid-cols-2 gap-x-10 gap-y-5 text-sm">

                      <div>
                        <span className="font-semibold">
                          Họ và tên:
                        </span>{" "}
                        {patient.name}
                      </div>

                      <div>
                        <span className="font-semibold">
                          Mã bệnh nhân:
                        </span>{" "}
                        {patient.id}
                      </div>

                      <div>
                        <span className="font-semibold">
                          Giới tính:
                        </span>{" "}
                        {patient.gender === "M" ? "Nam" : "Nữ"}
                      </div>

                      <div>
                        <span className="font-semibold">
                          Điện thoại:
                        </span>{" "}
                        {patient.phone}
                      </div>

                      <div className="col-span-2">
                        <span className="font-semibold">
                          Địa chỉ:
                        </span>{" "}
                        {patient.address}
                      </div>

                    </div>

                  </div>

                </div>

                {/* Card 1: Triệu chứng & Khám lâm sàng */}
                <div className="border-b border-border/70">
                  {/* Header */}
                  <div className="bg-muted/30 px-6 py-4">
                    <h2 className="text-base font-semibold text-foreground">
                      II. TRIỆU CHỨNG & KHÁM LÂM SÀNG
                    </h2>
                  </div>

                  {/* Content */}
                  <div className="p-8 space-y-6">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">
                        Triệu chứng lâm sàng chính *
                      </label>
                      <Textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="Mô tả cụ thể các triệu chứng bệnh nhân đang gặp phải..."
                        rows={3}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">
                        Kết quả khám lâm sàng thể chất *
                      </label>
                      <Textarea
                        value={physicalExam}
                        onChange={(e) => setPhysicalExam(e.target.value)}
                        placeholder="Kết quả đo chỉ số sinh tồn (huyết áp, nhịp tim), khám thực thể..."
                        rows={3}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Card 2: Cận lâm sàng & Ghi chú */}
                <div className="border-b border-border/70">
                  {/* Header */}
                  <div className="bg-muted/30 px-6 py-4">
                    <h2 className="text-base font-semibold text-foreground">
                      III. CHUYÊN KHOA
                    </h2>
                  </div>

                  {/* Content */}
                  <div className="p-8 space-y-6">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">
                        Kết quả xét nghiệm & Chẩn đoán hình ảnh
                      </label>
                      <Textarea
                        value={testResults}
                        onChange={(e) => setTestResults(e.target.value)}
                        placeholder="Điền kết quả xét nghiệm sinh hóa, huyết học, siêu âm, điện tim (nếu có)..."
                        rows={3}
                        className="w-full bg-card"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">
                        Ghi chú bổ sung
                      </label>
                      <Textarea
                        value={examinationNotes}
                        onChange={(e) => setExaminationNotes(e.target.value)}
                        placeholder="Các ghi chú hoặc nhắc nhở khác trong quá trình khám..."
                        rows={3}
                        className="w-full bg-card"
                      />
                    </div>
                  </div>
                </div>
                {/* Card 3: Chẩn đoán */}
                <div className="border-b border-border/70">
                  {/* Header */}
                  <div className="bg-muted/30 px-6 py-4">
                    <h2 className="text-base font-semibold text-foreground">
                      IV. CHẨN ĐOÁN
                    </h2>
                  </div>

                  {/* Content */}
                  <div className="p-8 space-y-6">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">
                        Mã ICD-10 *
                      </label>

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
                        <p className="mt-2 text-xs text-primary font-medium">
                          Tên chẩn đoán ICD: {selectedIcd.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">
                        Chẩn đoán chính thức *
                      </label>

                      <Input
                        value={mainDiagnosis}
                        onChange={(e) => setMainDiagnosis(e.target.value)}
                        placeholder="Nhập chẩn đoán lâm sàng chính xác"
                        className="w-full bg-card"
                      />
                    </div>
                  </div>
                </div>
                {/* Card 4: Điều trị */}
                <div className="border-b border-border/70">
                  {/* Header */}
                  <div className="bg-muted/30 px-6 py-4">
                    <h2 className="text-base font-semibold text-foreground">
                      V. ĐIỀU TRỊ & TÁI KHÁM
                    </h2>
                  </div>

                  {/* Content */}
                  <div className="p-8 space-y-6">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">
                        Chỉ định điều trị & Lời dặn của bác sĩ *
                      </label>

                      <Textarea
                        value={treatment}
                        onChange={(e) => setTreatment(e.target.value)}
                        placeholder="Nhập phương án điều trị, lời dặn dinh dưỡng, sinh hoạt, tập luyện..."
                        rows={4}
                        className="w-full bg-card"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">
                        Ngày hẹn tái khám
                      </label>

                      <Input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full bg-card"
                      />
                    </div>
                  </div>
                </div>
                {/* Card 5: Đơn thuốc */}
                <div>
                  {/* Header */}
                  <div className="bg-primary/5 px-6 py-4">
                    <h2 className="text-base font-semibold text-primary">
                      VI. ĐƠN THUỐC
                    </h2>
                  </div>

                  {/* Content */}
                  <div className="p-8 space-y-6">

                    {/* Add Medicine */}

                    <div className="rounded-lg border bg-slate-50 p-6 space-y-5">
                      {/* Combo thuốc */}
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2">
                          Combo thuốc
                        </label>

                        <Select
                          value={selectedTemplateId}
                          onValueChange={setSelectedTemplateId}
                        >
                          <SelectTrigger className="w-full bg-card">
                            <SelectValue placeholder="Chọn combo thuốc" />
                          </SelectTrigger>

                          <SelectContent>
                            {treatmentTemplates.map((template) => (
                              <SelectItem
                                key={template.id}
                                value={template.id}
                              >
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-2">
                            Tên thuốc
                          </label>

                          <Select
                            value={selectedMedicineId}
                            onValueChange={setSelectedMedicineId}
                          >
                            <SelectTrigger className="w-full bg-card">
                              <SelectValue placeholder="Chọn thuốc" />
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
                          <label className="block text-xs font-medium text-muted-foreground mb-2">
                            Số lượng
                          </label>

                          <Input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="Nhập số lượng"
                          />
                        </div>

                      </div>

                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2">
                          Liều dùng
                        </label>

                        <Input
                          value={dosage}
                          onChange={(e) => setDosage(e.target.value)}
                          placeholder="Ví dụ: 1 viên x 2 lần/ngày"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2">
                          Lưu ý
                        </label>

                        <Input
                          value={medicineNotes}
                          onChange={(e) => setMedicineNotes(e.target.value)}
                          placeholder="Lưu ý khi dùng thuốc"
                        />
                      </div>

                      <div className="flex justify-end">

                        <Button
                          onClick={handleAddMedicine}
                        >
                          + Thêm thuốc
                        </Button>

                      </div>

                    </div>

                    {/* Danh sách thuốc */}
                    {prescriptionItems.length > 0 && (

                      <div className="overflow-x-auto">

                        <table className="w-full border border-gray-300 text-sm">

                          <thead className="bg-slate-100">

                            <tr>

                              <th className="border p-2">STT</th>

                              <th className="border p-2">Tên thuốc</th>

                              <th className="border p-2">ĐVT</th>

                              <th className="border p-2">SL</th>

                              <th className="border p-2">Liều dùng</th>

                              <th className="border p-2">Ghi chú</th>

                              <th className="border p-2"></th>

                            </tr>

                          </thead>

                          <tbody>

                            {prescriptionItems.map((item, index) => (

                              <tr key={index}>

                                <td className="border p-2 text-center">
                                  {index + 1}
                                </td>

                                <td className="border p-2">
                                  {item.medicineName}
                                </td>

                                <td className="border p-2 text-center">
                                  {item.unit}
                                </td>

                                <td className="border p-2 text-center">
                                  {item.quantity}
                                </td>

                                <td className="border p-2">
                                  {item.dosage}
                                </td>

                                <td className="border p-2">
                                  {item.notes}
                                </td>

                                <td className="border p-2 text-center">

                                  <Button

                                    variant="ghost"

                                    size="icon"

                                    onClick={() => handleRemoveMedicine(index)}

                                  >

                                    🗑

                                  </Button>

                                </td>

                              </tr>

                            ))}

                          </tbody>

                        </table>

                      </div>

                    )}

                    {/* Ghi chú đơn thuốc */}
                    <div>

                      <label className="block text-xs font-medium text-muted-foreground mb-2">
                        Hướng dẫn chung
                      </label>

                      <Textarea
                        value={prescriptionNotes}
                        onChange={(e) => setPrescriptionNotes(e.target.value)}
                        rows={3}
                        placeholder="Ghi chú cho đơn thuốc..."
                      />

                    </div>

                  </div>
                </div>
              </Card>
            </div>
          )}

        </div>
        <div className="lg:col-span-4">
          <Card className="sticky top-6 h-[calc(100vh-200px)] flex flex-col rounded-xl shadow-sm">

            {/* Header */}
            <div className="border-b px-5 py-4">
              <h2 className="text-base font-semibold flex items-center gap-2">
                MediCore AI
              </h2>
              <div className="border-b px-5 py-4 mb-3"></div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendQuickQuestion("Tóm tắt bệnh án")}
                >
                  Tóm tắt
                </Button>
 
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendQuickQuestion("Gợi ý chuẩn đoán")}
                >
                  Chẩn đoán
                </Button>
 
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendQuickQuestion("Đề xuất xét nghệm")}
                >
                  Xét nghiệm
                </Button>
 
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendQuickQuestion("Đánh giá đơn thuốc")}
                >
                  Thuốc
                </Button>
 
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendQuickQuestion("Giải thích mã ICD-10")}
                >
                  ICD-10
                </Button>
 
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {messages.map((message, index) => (

                <div
                  key={index}
                  className={`flex ${message.sender === "doctor"
                    ? "justify-end"
                    : "justify-start"
                    }`}
                >

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${message.sender === "doctor"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                      }`}
                  >

                    {message.text}

                  </div>

                </div>

              ))}

            </div>

            {/* Input */}
            <div className="border-t p-4">

              <div className="flex gap-2">

                <Input
                  value={input ?? ""}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập câu hỏi cho AI..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage()
                    }
                  }}
                />

                <Button onClick={handleSendMessage}>

                  Gửi

                </Button>

              </div>

            </div>

          </Card>
        </div>
      </div>
    </div >
  )
}
