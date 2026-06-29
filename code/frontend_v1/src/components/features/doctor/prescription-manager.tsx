"use client"

import { useState, useEffect } from "react"
import { useData } from "@/providers/data-provider"
import { Button } from "@/components/base/ui/button"
import { Card } from "@/components/base/ui/card"
import { Badge } from "@/components/base/ui/badge"
import { Input } from "@/components/base/ui/input"
import { Textarea } from "@/components/base/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/base/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/base/ui/select"
import { Search, Plus, Trash2 } from "lucide-react"

export function PrescriptionManager() {
  const {
    prescriptions,
    patients,
    medicines,
    updatePrescription,
    deletePrescription,
    addPrescription,
    ensureMedicinesLoaded,
    ensurePatientsLoaded,
    ensureAppointmentsLoaded,
  } = useData()

  useEffect(() => {
    ensureMedicinesLoaded()
    ensurePatientsLoaded()
    ensureAppointmentsLoaded()
  }, [ensureAppointmentsLoaded, ensureMedicinesLoaded, ensurePatientsLoaded])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "issued" | "dispensed">("all")
  const [showNewModal, setShowNewModal] = useState(false)

  const filtered = prescriptions.filter((p) => {
    const patient = patients.find((pt) => pt.id === p.patientId)
    const matchSearch =
      !searchTerm ||
      patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = filterStatus === "all" || p.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm đơn thuốc (tên bệnh nhân, ID đơn)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="draft">Nháp</SelectItem>
            <SelectItem value="issued">Đã cấp</SelectItem>
            <SelectItem value="dispensed">Đã phát</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setShowNewModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Kê đơn mới
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Không có đơn thuốc nào</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((prescription) => {
            const patient = patients.find((p) => p.id === prescription.patientId)
            return (
              <Card key={prescription.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{patient?.name}</h3>
                    <p className="text-sm text-muted-foreground">Đơn: {prescription.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        prescription.status === "draft"
                          ? "secondary"
                          : prescription.status === "issued"
                            ? "default"
                            : "outline"
                      }
                      className="text-xs"
                    >
                      {prescription.status === "draft" && "Nháp"}
                      {prescription.status === "issued" && "Đã cấp"}
                      {prescription.status === "dispensed" && "Đã phát"}
                    </Badge>
                    <PrescriptionActions
                      prescription={prescription}
                      onUpdate={updatePrescription}
                      onDelete={deletePrescription}
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <p className="text-sm text-muted-foreground">
                    Ngày kê: {new Date(prescription.prescriptionDate).toLocaleDateString("vi-VN")}
                  </p>
                  <div className="space-y-1">
                    {prescription.items.map((item, idx) => (
                      <p key={idx} className="text-sm">
                        • {item.medicineName} - {item.quantity} {item.unit} - {item.dosage}
                      </p>
                    ))}
                  </div>
                </div>

                {prescription.notes && (
                  <p className="text-sm text-muted-foreground border-t pt-2">
                    Ghi chú: {prescription.notes}
                  </p>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <NewPrescriptionModal open={showNewModal} onOpenChange={setShowNewModal} onSave={addPrescription} />
    </div>
  )
}

function PrescriptionActions({
  prescription,
  onUpdate,
  onDelete,
}: {
  prescription: any
  onUpdate: (id: string, data: any) => void
  onDelete: (id: string) => void
}) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setShowMenu(!showMenu)}>
        •••
      </Button>
      {showMenu && (
        <div className="absolute right-0 mt-1 w-48 bg-background border rounded-lg shadow-lg z-10">
          {prescription.status === "draft" && (
            <button
              onClick={() => {
                onUpdate(prescription.id, { ...prescription, status: "issued" })
                setShowMenu(false)
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-muted"
            >
              Cấp đơn
            </button>
          )}
          {prescription.status === "issued" && (
            <button
              onClick={() => {
                onUpdate(prescription.id, { ...prescription, status: "dispensed" })
                setShowMenu(false)
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-muted"
            >
              Đánh dấu đã phát
            </button>
          )}
          <button
            onClick={() => {
              onDelete(prescription.id)
              setShowMenu(false)
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-muted"
          >
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Xóa
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

function NewPrescriptionModal({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: any) => void
}) {
  const { patients, medicines, appointments } = useData()
  const [selectedPatient, setSelectedPatient] = useState("")
  const [items, setItems] = useState<
    Array<{ medicineId: string; quantity: number; dosage: string; notes?: string }>
  >([])
  const [notes, setNotes] = useState("")
  const [selectedMedicineId, setSelectedMedicineId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [dosage, setDosage] = useState("")
  const [medicineNotes, setMedicineNotes] = useState("")

  const handleAddMedicine = () => {
    if (selectedMedicineId && quantity && dosage) {
      setItems((prev) => [
        ...prev,
        {
          medicineId: selectedMedicineId,
          quantity: parseInt(quantity),
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

  const handleSave = () => {
    if (selectedPatient && items.length > 0) {
      const appointment = appointments.find((a) => a.patientId === selectedPatient)
      if (appointment) {
        const presItems = items.map((item) => {
          const medicine = medicines.find((m) => m.id === item.medicineId)!
          return {
            medicineId: item.medicineId,
            medicineName: medicine.name,
            quantity: item.quantity,
            unit: medicine.unit,
            dosage: item.dosage,
            notes: item.notes,
          }
        })

        onSave({
          appointmentId: appointment.id,
          patientId: selectedPatient,
          doctorId: appointment.doctorId,
          prescriptionDate: new Date().toISOString(),
          items: presItems,
          notes,
          status: "draft",
        })

        onOpenChange(false)
        setSelectedPatient("")
        setItems([])
        setNotes("")
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Kê đơn thuốc mới</DialogTitle>
          <DialogDescription>Tạo một đơn thuốc mới cho bệnh nhân</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Chọn bệnh nhân *</label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Chọn bệnh nhân" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Danh sách thuốc</label>
            <div className="p-3 border rounded-lg bg-muted/50 mb-4 min-h-20">
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có thuốc nào được thêm</p>
              ) : (
                items.map((item, idx) => {
                  const medicine = medicines.find((m) => m.id === item.medicineId)
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-background rounded mb-2"
                    >
                      <div>
                        <p className="font-medium text-sm">{medicine?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} {medicine?.unit} - {item.dosage}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-red-500"
                      >
                        Xóa
                      </Button>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Chọn thuốc để thêm</label>
            <Select value={selectedMedicineId} onValueChange={setSelectedMedicineId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Chọn loại thuốc" />
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Số lượng</label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Liều dùng</label>
              <Input
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="1 viên x 3 lần/ngày"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Ghi chú thuốc</label>
            <Input
              value={medicineNotes}
              onChange={(e) => setMedicineNotes(e.target.value)}
              placeholder="Uống sau ăn..."
              className="mt-1"
            />
          </div>

          <Button onClick={handleAddMedicine} variant="secondary" className="w-full">
            Thêm thuốc
          </Button>

          <div>
            <label className="text-sm font-medium">Ghi chú đơn</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú cho đơn thuốc..."
              className="mt-1"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={!selectedPatient || items.length === 0}>
              Lưu đơn thuốc
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
