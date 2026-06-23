"use client"

import { useState } from "react"
import { useData } from "@/providers/data-provider"
import { Card } from "@/components/base/ui/card"
import { Input } from "@/components/base/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/base/ui/table"
import { Badge } from "@/components/base/ui/badge"
import { Button } from "@/components/base/ui/button"
import { Search, Eye } from "lucide-react"
import { PatientRecordModal } from "./patient-record-modal"
import type { Patient } from "@/types/medical"

export function PatientRecordsContent() {
  const { patients, examinationRecords } = useData()
  const [query, setQuery] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.phone.includes(query) ||
    p.id.includes(query)
  )

  const getRecordCount = (patientId: string) => {
    return examinationRecords.filter((e) => e.patientId === patientId).length
  }

  const getLastExamDate = (patientId: string) => {
    const records = examinationRecords.filter((e) => e.patientId === patientId)
    if (records.length === 0) return "—"
    const sorted = [...records].sort((a, b) => new Date(b.examinationDate).getTime() - new Date(a.examinationDate).getTime())
    return new Date(sorted[0].examinationDate).toLocaleDateString("vi-VN")
  }

  return (
    <>
      <Card className="p-4 mb-6 animate-slide-in-up">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm bệnh nhân theo tên, số điện thoại hoặc ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </Card>

      <Card className="p-0 overflow-hidden animate-slide-in-up">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Bệnh nhân</TableHead>
                <TableHead>Ngày sinh</TableHead>
                <TableHead>Giới tính</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead className="text-center">Số hồ sơ</TableHead>
                <TableHead>Khám gần nhất</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((patient) => {
                const recordCount = getRecordCount(patient.id)
                const lastExamDate = getLastExamDate(patient.id)
                return (
                  <TableRow key={patient.id} className="hover:bg-secondary/50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm text-foreground">{patient.name}</p>
                        <p className="text-xs text-muted-foreground">{patient.id}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(patient.dateOfBirth).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {patient.gender === "M" ? "Nam" : "Nữ"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="text-xs">{patient.phone}</div>
                      <div className="text-xs">{patient.email}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={recordCount > 0 ? "default" : "secondary"}>
                        {recordCount} hồ sơ
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {lastExamDate}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setSelectedPatient(patient)}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="sr-only">Xem hồ sơ</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10">
                    Không tìm thấy bệnh nhân nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {selectedPatient && (
        <PatientRecordModal
          patient={selectedPatient}
          open={!!selectedPatient}
          onOpenChange={(open) => !open && setSelectedPatient(null)}
        />
      )}
    </>
  )
}
