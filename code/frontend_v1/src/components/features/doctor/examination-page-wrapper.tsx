"use client"

import { useEffect } from "react"
import { ExaminationPage } from "./examination-page"
import { useData } from "@/providers/data-provider"

interface ExaminationPageWrapperProps {
  patientId: string
}

export function ExaminationPageWrapper({ patientId }: ExaminationPageWrapperProps) {
  const { patients, ensurePatientsLoaded } = useData()

  useEffect(() => {
    ensurePatientsLoaded()
  }, [ensurePatientsLoaded])

  const patient = patients.find((p) => p.id === patientId)

  // Fallback to a mock patient if not found (for demo purposes)
  const displayPatient = patient || {
    id: patientId,
    name: "Bệnh nhân",
    dateOfBirth: "1980-05-15",
    gender: "M" as const,
    phone: "0912345678",
    email: "patient@example.com",
    address: "Địa chỉ",
    insuranceNumber: "BH001234567",
    status: "waiting" as const,
    createdAt: new Date().toISOString(),
  }

  return <ExaminationPage patient={displayPatient} />
}
