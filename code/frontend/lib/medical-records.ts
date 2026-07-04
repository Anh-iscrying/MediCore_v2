import { apiFetch } from "./api"

export type MedicalRecordMedicine = {
  medicineId?: number
  medicineName?: string
  unit?: string
  quantity?: number
  dosageInstruction?: string
}

export type MedicalRecord = {
  id: number
  emrCode: string
  appointmentId?: number
  patientId?: string
  patientName?: string
  doctorId?: number
  doctorName?: string
  appointmentDate?: string
  timeSlot?: string
  diagnosisIcd10?: string
  diagnosisName?: string
  mainDiagnosis?: string
  symptoms?: string
  physicalExamination?: string
  testResults?: string
  clinicalNote?: string
  historySummary?: string
  careAdvice?: string
  followUpDate?: string
  additionalData?: Record<string, unknown>
  pdfUrl?: string | null
  pdfStoragePath?: string | null
  pdfGeneratedAt?: string | null
  createdAt?: string
  medicines?: MedicalRecordMedicine[]
}

export function getMedicalRecordByAppointment(appointmentId: number | string) {
  return apiFetch<MedicalRecord>(`/clinical/medical-records/appointment/${appointmentId}`)
}

export function getMyMedicalRecords() {
  return apiFetch<MedicalRecord[]>("/clinical/medical-records/me")
}
