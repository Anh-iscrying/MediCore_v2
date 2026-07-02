"use client"

import { useEffect } from "react"
import { useData } from "@/providers/data-provider"
import { useAuth } from "@/providers/auth-provider"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/base/ui/tabs"
import { ScrollArea } from "@/components/base/ui/scroll-area"

interface PatientRecordModalProps {
  patient: Patient
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PatientRecordModal({ patient, open, onOpenChange }: PatientRecordModalProps) {
  const { user } = useAuth()
  const { appointments, examinationRecords, ensureAppointmentsLoaded } = useData()

  useEffect(() => {
    if (open) ensureAppointmentsLoaded()
  }, [open, ensureAppointmentsLoaded])

  const patientAppointments = appointments
    .filter((appointment) =>
      appointment.doctorId === String(user?.doctorId ?? "") &&
      (
        appointment.patientId === patient.id ||
        appointment.patientCode === patient.patientCode ||
        appointment.patientCode === patient.id
      )
    )
    .sort((a, b) => {
      const dateCompare = new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
      if (dateCompare !== 0) return dateCompare
      return (b.timeSlot ?? "").localeCompare(a.timeSlot ?? "")
    })

  const patientRecords = examinationRecords
    .filter((e) => e.patientId === patient.id)
    .sort((a, b) => new Date(b.examinationDate).getTime() - new Date(a.examinationDate).getTime())

  const age = Math.floor(
    (Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  )

  const isGeneratedPatientEmail = (email?: string) =>
    Boolean(email && /^pat-\d{4}-\d+@medicore\.com$/i.test(email))

  const getAppointmentStatusText = (status: string) => {
    switch (status) {
      case "WAITING":
      case "PENDING":
        return "Chờ khám"
      case "IN_PROGRESS":
        return "Đang khám"
      case "DONE":
      case "COMPLETED":
        return "Đã khám"
      case "CANCELLED":
        return "Đã hủy"
      default:
        return status
    }
  }

  const getAppointmentStatusVariant = (status: string) => {
    switch (status) {
      case "DONE":
      case "COMPLETED":
        return "default"
      case "CANCELLED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Hồ sơ bệnh nhân: {patient.name}</DialogTitle>
          <DialogDescription>Xem chi tiết thông tin và lịch khám của bệnh nhân</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Thông tin cá nhân</TabsTrigger>
            <TabsTrigger value="records">Lịch khám ({patientAppointments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Mã bệnh nhân</p>
                  <p className="font-medium text-sm">{patient.patientCode || patient.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Họ và tên</p>
                  <p className="font-medium text-sm">{patient.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ngày sinh</p>
                  <p className="font-medium text-sm">
                    {new Date(patient.dateOfBirth).toLocaleDateString("vi-VN")} ({age} tuổi)
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Giới tính</p>
                  <p className="font-medium text-sm">{patient.gender === "M" ? "Nam" : "Nữ"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Số điện thoại</p>
                  <p className="font-medium text-sm">{patient.phone}</p>
                </div>
                {patient.email && !isGeneratedPatientEmail(patient.email) && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="font-medium text-sm">{patient.email}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Địa chỉ</p>
                  <p className="font-medium text-sm">{patient.address}</p>
                </div>
                {patient.insuranceNumber && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Số bảo hiểm</p>
                    <p className="font-medium text-sm">{patient.insuranceNumber}</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="records">
            <ScrollArea className="h-96 pr-4">
              <div className="space-y-3">
                {patientAppointments.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-sm text-muted-foreground">Chưa có lịch khám nào</p>
                  </div>
                ) : (
                  patientAppointments.map((appointment) => {
                    const record = patientRecords.find((item) => item.appointmentId === appointment.id)

                    return (
                      <Card key={appointment.id} className="p-4">
                        <div className="grid gap-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Ngày khám</p>
                              <p className="font-medium text-sm">
                                {new Date(appointment.appointmentDate).toLocaleDateString("vi-VN")}
                              </p>
                              {appointment.timeSlot && (
                                <p className="text-xs text-muted-foreground mt-0.5">{appointment.timeSlot}</p>
                              )}
                            </div>
                            <Badge variant={getAppointmentStatusVariant(appointment.status)}>
                              {getAppointmentStatusText(appointment.status)}
                            </Badge>
                          </div>

                          {appointment.symptomsInitial && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Triệu chứng ban đầu</p>
                              <p className="text-sm text-foreground">{appointment.symptomsInitial}</p>
                            </div>
                          )}

                          {record ? (
                            <>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Chẩn đoán chính</p>
                                <p className="font-medium text-sm">{record.mainDiagnosis}</p>
                              </div>

                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Triệu chứng khi khám</p>
                                <p className="text-sm text-foreground">{record.symptoms}</p>
                              </div>

                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Khám lâm sàng</p>
                                <p className="text-sm text-foreground">{record.physicalExamination}</p>
                              </div>

                              {record.testResults && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Kết quả xét nghiệm</p>
                                  <p className="text-sm text-foreground">{record.testResults}</p>
                                </div>
                              )}

                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Phương pháp điều trị</p>
                                <p className="text-sm text-foreground">{record.treatment}</p>
                              </div>

                              {record.followUpDate && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Tái khám</p>
                                  <p className="text-sm font-medium text-primary">
                                    {new Date(record.followUpDate).toLocaleDateString("vi-VN")}
                                  </p>
                                </div>
                              )}

                              {record.notes && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Ghi chú</p>
                                  <p className="text-sm text-foreground italic">{record.notes}</p>
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">Chưa có hồ sơ khám chi tiết cho lịch này</p>
                          )}
                        </div>
                      </Card>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
