"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useData } from "@/providers/data-provider"
import { Button } from "@/components/base/ui/button"
import { Card } from "@/components/base/ui/card"
import { Badge } from "@/components/base/ui/badge"
import { Input } from "@/components/base/ui/input"
import { PatientProfileModal } from "./patient-profile-modal"
import { Search } from "lucide-react"

export function WaitingPatientsList() {
  const router = useRouter()
  const { patients, getWaitingPatients, appointments } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const waitingPatients = getWaitingPatients()
  const filtered = waitingPatients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm) ||
    p.id.includes(searchTerm),
  )

  const selectedPatient = selectedPatientId ? patients.find((p) => p.id === selectedPatientId) : null
  const patientAppointment = selectedPatientId
    ? appointments.find((a) => a.patientId === selectedPatientId)
    : null

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm bệnh nhân (tên, số điện thoại, ID)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Không có bệnh nhân nào đang chờ khám</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((patient) => (
            <Card key={patient.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{patient.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {patient.gender === "M" ? "Nam" : "Nữ"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Ngày sinh:</span> {new Date(patient.dateOfBirth).toLocaleDateString("vi-VN")}
                    </div>
                    <div>
                      <span className="font-medium">Điện thoại:</span> {patient.phone}
                    </div>
                    <div>
                      <span className="font-medium">Địa chỉ:</span> {patient.address}
                    </div>
                    <div>
                      <span className="font-medium">Mã BHYT:</span> {patient.insuranceNumber || "Không có"}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedPatientId(patient.id)
                      setShowProfileModal(true)
                    }}
                  >
                    Hồ sơ
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/doctor/examination/${patient.id}`)}
                  >
                    Khám bệnh
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedPatient && (
        <PatientProfileModal
          patient={selectedPatient}
          open={showProfileModal}
          onOpenChange={setShowProfileModal}
        />
      )}
    </div>
  )
}
