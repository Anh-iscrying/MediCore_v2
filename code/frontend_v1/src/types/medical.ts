export interface Specialty {
  id: string
  name: string
  code: string
  description: string
  doctorCount: number
  status: "active" | "inactive"
}

export interface Doctor {
  id: string
  name: string
  specialtyId: string
  title: string // Học vị: Bác sĩ, Thạc sĩ, Tiến sĩ, PGS, GS
  email: string
  phone: string
  experience: number // số năm kinh nghiệm
  status: "active" | "on-leave" | "inactive"
  avatar?: string
  doctorCode?: string
}

export type ShiftType = "morning" | "afternoon" | "night" | "off"

export interface ScheduleEntry {
  doctorId: string
  // key: day index 0-6 (Mon-Sun)
  shifts: Record<number, ShiftType>
}

export interface Medicine {
  id: string
  name: string
  code: string
  category: string // nhóm thuốc
  unit: string // đơn vị: viên, ống, chai
  price: number
  stock: number
  manufacturer: string
  status: "available" | "low" | "out"
}

export interface IcdCode {
  id: string
  code: string // mã ICD-10, vd A00
  name: string // tên bệnh
  category: string // chương
  description: string
}

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"

export interface Appointment {
  id: string
  patientName: string
  patientId: string
  doctorId: string
  specialtyId: string
  appointmentDate: string // ISO date format
  icdCode?: string
  mainDiagnosis?: string
  status: AppointmentStatus
  timeSlot?: string
  symptomsInitial?: string
  patientCode?: string
}

export interface Patient {
  id: string
  name: string
  dateOfBirth: string // ISO date
  gender: "M" | "F"
  phone: string
  email: string
  address: string
  insuranceNumber?: string
  status: "waiting" | "in-examination" | "completed" | "no-show"
  createdAt: string
  patientCode?: string
}

export interface PrescriptionItem {
  medicineId: string
  medicineName: string
  quantity: number
  unit: string
  dosage: string // vd: 1 viên x 3 lần/ngày
  notes?: string
}

export interface Prescription {
  id: string
  appointmentId: string
  patientId: string
  doctorId: string
  prescriptionDate: string
  items: PrescriptionItem[]
  notes?: string
  status: "draft" | "issued" | "dispensed"
}

export interface ExaminationRecord {
  id: string
  appointmentId: string
  patientId: string
  doctorId: string
  examinationDate: string
  icdCode: string
  mainDiagnosis: string
  symptoms: string
  physicalExamination: string
  testResults?: string
  treatment: string
  followUpDate?: string
  notes?: string
  createdAt: string
}


export interface SpecialtyRequest {
  name: string
}

export interface SpecialtyResponse {
  id: number
  name: string
  doctorCount: number
}

export interface DoctorRequest {
  name: string
  specialtyId: number
  title?: string
  phone?: string
  experience?: number
  email?: string
  password?: string
  status?: Doctor["status"]
  avatar?: string
}

export interface DoctorResponse {
  id: number
  name: string
  specialtyId: number
  specialtyName?: string
  title?: string
  email?: string
  phone?: string
  experience?: number
  status?: Doctor["status"]
  avatar?: string
  doctorCode?: string
}

export interface MedicineRequest {
  name: string
  unit: string
  category?: string
  price?: number
  stock?: number
  manufacturer?: string
}

export interface MedicineResponse {
  id: number
  name: string
  code?: string
  category?: string
  unit: string
  price?: number
  stock?: number
  manufacturer?: string
  status?: Medicine["status"]
}

export interface DiseaseRequest {
  code: string
  name: string
  category?: string
  description?: string
}

export interface DiseaseResponse {
  id: string
  code: string
  name: string
  category?: string
  description?: string
}

export interface PatientRequest {
  name: string
  dateOfBirth: string
  gender: Patient["gender"]
  phone?: string
  address?: string
  email?: string
  insuranceNumber?: string
  status?: Patient["status"]
}

export interface PatientResponse {
  id: number
  name: string
  dateOfBirth: string
  gender: Patient["gender"]
  phone?: string
  email?: string
  address?: string
  insuranceNumber?: string
  status?: Patient["status"]
  patientCode?: string
  createdAt?: string
}

export interface AppointmentRequest {
  patientId: string
  doctorId: number
  appointmentDate: string
  timeSlot: string
  symptomsInitial?: string
  status?: AppointmentStatus
}

export interface AppointmentResponse {
  id: number
  patientName: string
  patientId: string
  doctorId: number
  doctorName?: string
  specialtyId?: number
  appointmentDate: string
  timeSlot?: string
  symptomsInitial?: string
  status?: AppointmentStatus
  icdCode?: string
  mainDiagnosis?: string
}
