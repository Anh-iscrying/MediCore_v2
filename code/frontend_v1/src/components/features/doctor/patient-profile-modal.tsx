"use client"

import { useData } from "@/providers/data-provider"
import type { Patient } from "@/types/medical"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/base/ui/dialog"
import { Card } from "@/components/base/ui/card"
import { Badge } from "@/components/base/ui/badge"

interface PatientProfileModalProps {
  patient: Patient
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PatientProfileModal({
  patient,
  open,
  onOpenChange,
}: PatientProfileModalProps) {
  const { getPatientPrescriptions, getPatientRecords } = useData()
  const prescriptions = getPatientPrescriptions(patient.id)
  const records = getPatientRecords(patient.id)

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const formatSpecialtyValue = (value: unknown) => {
    if (typeof value === "boolean") return value ? "Có" : "Không"
    if (value === undefined || value === null || value === "") return "-"
    return String(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Hồ sơ bệnh nhân</DialogTitle>
          <DialogDescription>Thông tin chi tiết bệnh nhân</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Thông tin cá nhân</h3>
            <Card className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Họ tên</p>
                  <p className="text-foreground font-semibold">{patient.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tuổi</p>
                  <p className="text-foreground font-semibold">{calculateAge(patient.dateOfBirth)} tuổi</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Giới tính</p>
                  <p className="text-foreground font-semibold">{patient.gender === "M" ? "Nam" : "Nữ"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ngày sinh</p>
                  <p className="text-foreground font-semibold">
                    {new Date(patient.dateOfBirth).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Điện thoại</p>
                  <p className="text-foreground font-semibold">{patient.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-foreground font-semibold">{patient.email}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Địa chỉ</p>
                <p className="text-foreground font-semibold">{patient.address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mã BHYT</p>
                <p className="text-foreground font-semibold">{patient.insuranceNumber || "Không có"}</p>
              </div>
            </Card>
          </div>

          {/* Examination History */}
          {records.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Lịch sử khám bệnh</h3>
              <div className="space-y-3">
                {records.map((record) => (
                  <Card key={record.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-foreground">{record.mainDiagnosis}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.examinationDate).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {record.icdCode}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Triệu chứng:</span> {record.symptoms}
                      </p>
                      <p>
                        <span className="font-medium">Khám thực tế:</span> {record.physicalExamination}
                      </p>
                      {record.testResults && (
                        <p>
                          <span className="font-medium">Kết quả xét nghiệm:</span> {record.testResults}
                        </p>
                      )}
                      {record.specialtyExamTemplate?.fields?.length ? (
                        <div className="rounded-md bg-muted/40 p-2 space-y-1">
                          <p className="font-medium">Thông tin chuyên khoa:</p>
                          {record.specialtyExamTemplate.fields.map((field) => (
                            <p key={field.id}>
                              <span className="font-medium">{field.label}:</span>{" "}
                              {formatSpecialtyValue(record.specialtyExamValues?.[field.id])}
                            </p>
                          ))}
                        </div>
                      ) : null}
                      <p>
                        <span className="font-medium">Điều trị:</span> {record.treatment}
                      </p>
                      {record.followUpDate && (
                        <p>
                          <span className="font-medium">Tái khám:</span>{" "}
                          {new Date(record.followUpDate).toLocaleDateString("vi-VN")}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Prescriptions */}
          {prescriptions.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Lịch sử kê đơn</h3>
              <div className="space-y-3">
                {prescriptions.map((prescription) => (
                  <Card key={prescription.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-sm text-muted-foreground">
                        {new Date(prescription.prescriptionDate).toLocaleDateString("vi-VN")}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {prescription.status === "draft" && "Nháp"}
                        {prescription.status === "issued" && "Đã cấp"}
                        {prescription.status === "dispensed" && "Đã phát"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {prescription.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>
                            {item.medicineName} - {item.quantity} {item.unit}
                          </span>
                          <span className="text-muted-foreground">{item.dosage}</span>
                        </div>
                      ))}
                    </div>
                    {prescription.notes && (
                      <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                        Ghi chú: {prescription.notes}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
