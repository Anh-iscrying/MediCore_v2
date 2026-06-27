"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type {
  Appointment,
  AppointmentRequest,
  AppointmentResponse,
  AppointmentStatus,
  Doctor,
  DoctorRequest,
  DoctorResponse,
  ExaminationRecord,
  IcdCode,
  Medicine,
  MedicineRequest,
  MedicineResponse,
  Patient,
  PatientRequest,
  PatientResponse,
  Prescription,
  ScheduleEntry,
  ShiftType,
  Specialty,
  SpecialtyResponse,
} from "@/types/medical"
import {
  appointmentsApi,
  diseasesApi,
  doctorsApi,
  medicinesApi,
  patientsApi,
  specialtiesApi,
} from "@/lib/api"
import { useAuth } from "@/providers/auth-provider"
import {
  seedSpecialties,
  seedDoctors,
  seedMedicines,
  seedIcdCodes,
  seedSchedule,
  seedAppointments,
  seedPatients,
  seedPrescriptions,
  seedExaminationRecords,
} from "@/data/mock/seed-data"

interface DataContextValue {
  specialties: Specialty[]
  doctors: Doctor[]
  medicines: Medicine[]
  icdCodes: IcdCode[]
  schedule: ScheduleEntry[]
  appointments: Appointment[]
  patients: Patient[]
  prescriptions: Prescription[]
  examinationRecords: ExaminationRecord[]
  // Specialty CRUD
  addSpecialty: (s: Omit<Specialty, "id" | "doctorCount">) => void
  updateSpecialty: (id: string, s: Omit<Specialty, "id" | "doctorCount">) => void
  deleteSpecialty: (id: string) => void
  // Doctor CRUD
  addDoctor: (d: Omit<Doctor, "id"> & { password?: string }) => void
  updateDoctor: (id: string, d: Omit<Doctor, "id"> & { password?: string }) => void
  deleteDoctor: (id: string) => void
  setShift: (doctorId: string, day: number, shift: ShiftType) => void
  // Medicine CRUD
  addMedicine: (m: Omit<Medicine, "id">) => void
  updateMedicine: (id: string, m: Omit<Medicine, "id">) => void
  deleteMedicine: (id: string) => void
  // ICD CRUD
  addIcd: (c: Omit<IcdCode, "id">) => void
  updateIcd: (id: string, c: Omit<IcdCode, "id">) => void
  deleteIcd: (id: string) => void
  // Appointment CRUD
  addAppointment: (a: Omit<Appointment, "id">) => void
  updateAppointment: (id: string, a: Omit<Appointment, "id">) => void
  deleteAppointment: (id: string) => void
  // Patient CRUD
  addPatient: (p: Omit<Patient, "id">) => void
  updatePatient: (id: string, p: Omit<Patient, "id">) => void
  deletePatient: (id: string) => void
  // Prescription CRUD
  addPrescription: (p: Omit<Prescription, "id">) => void
  updatePrescription: (id: string, p: Omit<Prescription, "id">) => void
  deletePrescription: (id: string) => void
  // Examination Record CRUD
  addExaminationRecord: (e: Omit<ExaminationRecord, "id">) => void
  updateExaminationRecord: (id: string, e: Omit<ExaminationRecord, "id">) => void
  deleteExaminationRecord: (id: string) => void
  // Helper methods
  getWaitingPatients: () => Patient[]
  getPatientPrescriptions: (patientId: string) => Prescription[]
  getPatientRecords: (patientId: string) => ExaminationRecord[]
}

const DataContext = createContext<DataContextValue | null>(null)

const uid = () => Math.random().toString(36).slice(2, 9)

const toNumber = (value: string) => Number.parseInt(value, 10)
const safeNumber = (value: number | undefined, fallback = 0) => value ?? fallback

const mapSpecialty = (s: SpecialtyResponse, fallback?: Partial<Specialty>): Specialty => ({
  id: String(s.id),
  name: s.name,
  code: fallback?.code ?? `SP${s.id}`,
  description: fallback?.description ?? "",
  doctorCount: Number(s.doctorCount ?? fallback?.doctorCount ?? 0),
  status: fallback?.status ?? "active",
})

const mapDoctor = (d: DoctorResponse, fallback?: Partial<Doctor>): Doctor => ({
  id: String(d.id),
  name: d.name,
  specialtyId: String(d.specialtyId),
  title: d.title ?? fallback?.title ?? "Bác sĩ",
  email: d.email ?? fallback?.email ?? "",
  phone: d.phone ?? fallback?.phone ?? "",
  experience: safeNumber(d.experience, fallback?.experience ?? 0),
  status: (d.status ?? fallback?.status ?? "active") as "active" | "on-leave" | "inactive",
  avatar: d.avatar ?? fallback?.avatar,
  doctorCode: d.doctorCode ?? fallback?.doctorCode,
})

const mapMedicine = (m: MedicineResponse, fallback?: Partial<Medicine>): Medicine => ({
  id: String(m.id),
  name: m.name,
  code: m.code ?? fallback?.code ?? `MED${m.id}`,
  category: m.category ?? fallback?.category ?? "",
  unit: m.unit,
  price: safeNumber(m.price, fallback?.price ?? 0),
  stock: safeNumber(m.stock, fallback?.stock ?? 0),
  manufacturer: m.manufacturer ?? fallback?.manufacturer ?? "",
  status: (m.status ?? fallback?.status ?? "available") as "available" | "low" | "out",
})

const mapIcdCode = (d: { id?: string; code: string; name: string; category?: string; description?: string }): IcdCode => ({
  id: d.id ?? d.code,
  code: d.code,
  name: d.name,
  category: d.category ?? "",
  description: d.description ?? "",
})

const mapPatient = (p: PatientResponse, fallback?: Partial<Patient>): Patient => ({
  id: String(p.id),
  name: p.name,
  dateOfBirth: p.dateOfBirth,
  gender: (p.gender === "M" || p.gender === "F" ? p.gender : "M") as "M" | "F",
  phone: p.phone ?? fallback?.phone ?? "",
  email: p.email ?? fallback?.email ?? "",
  address: p.address ?? fallback?.address ?? "",
  insuranceNumber: p.insuranceNumber ?? fallback?.insuranceNumber,
  status: (p.status ?? fallback?.status ?? "waiting") as "waiting" | "in-examination" | "completed" | "no-show",
  createdAt: p.createdAt ?? fallback?.createdAt ?? new Date().toISOString(),
  patientCode: p.patientCode ?? fallback?.patientCode,
})

const mapAppointment = (a: AppointmentResponse, patientList: Patient[], fallback?: Partial<Appointment>): Appointment => {
  const patient = patientList.find((p) => p.patientCode === a.patientId || p.id === a.patientId)

  return {
    id: String(a.id),
    patientName: a.patientName,
    patientId: patient?.id ?? a.patientId,
    doctorId: String(a.doctorId),
    specialtyId: String(a.specialtyId ?? fallback?.specialtyId ?? ""),
    appointmentDate: a.appointmentDate,
    icdCode: a.icdCode ?? fallback?.icdCode,
    mainDiagnosis: a.mainDiagnosis ?? fallback?.mainDiagnosis,
    status: (a.status ?? fallback?.status ?? "PENDING") as AppointmentStatus,
    timeSlot: a.timeSlot ?? fallback?.timeSlot,
    symptomsInitial: a.symptomsInitial ?? fallback?.symptomsInitial,
    patientCode: a.patientId,
  }
}

const withDoctorCounts = (specialtyList: Specialty[], doctorList: Doctor[]) =>
  specialtyList.map((sp) => ({
    ...sp,
    doctorCount: doctorList.filter((d) => d.specialtyId === sp.id).length || sp.doctorCount,
  }))

const toDoctorRequest = (d: Omit<Doctor, "id"> & { password?: string }): DoctorRequest => ({
  name: d.name,
  specialtyId: toNumber(d.specialtyId),
  title: d.title,
  phone: d.phone,
  experience: d.experience,
  email: d.email,
  password: d.password,
  status: d.status,
  avatar: d.avatar,
})

const toMedicineRequest = (m: Omit<Medicine, "id">): MedicineRequest => ({
  name: m.name,
  unit: m.unit,
  category: m.category,
  price: m.price,
  stock: m.stock,
  manufacturer: m.manufacturer,
})

const toPatientRequest = (p: Omit<Patient, "id">): PatientRequest => ({
  name: p.name,
  dateOfBirth: p.dateOfBirth,
  gender: p.gender,
  phone: p.phone,
  address: p.address,
  email: p.email,
  insuranceNumber: p.insuranceNumber,
  status: p.status,
})

export function DataProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [specialties, setSpecialties] = useState<Specialty[]>(seedSpecialties)
  const [doctors, setDoctors] = useState<Doctor[]>(seedDoctors)
  const [medicines, setMedicines] = useState<Medicine[]>(seedMedicines)
  const [icdCodes, setIcdCodes] = useState<IcdCode[]>(seedIcdCodes)
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(seedSchedule)
  const [appointments, setAppointments] = useState<Appointment[]>(seedAppointments)
  const [patients, setPatients] = useState<Patient[]>(seedPatients)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(seedPrescriptions)
  const [examinationRecords, setExaminationRecords] = useState<ExaminationRecord[]>(seedExaminationRecords)

  useEffect(() => {
    if (!token) return

    let cancelled = false

    async function loadData() {
      try {
        const [specialtyResponses, doctorResponses, medicineResponses, diseaseResponses, patientResponses] = await Promise.all([
          specialtiesApi.list(),
          doctorsApi.list(),
          medicinesApi.list(),
          diseasesApi.list(),
          patientsApi.list(),
        ])
        const appointmentResponses = await appointmentsApi.list()

        if (cancelled) return

        const nextDoctors = doctorResponses.map((d) => mapDoctor(d))
        const nextSpecialties = withDoctorCounts(
          specialtyResponses.map((s) => mapSpecialty(s)),
          nextDoctors,
        )
        const nextMedicines = medicineResponses.map((m) => mapMedicine(m))
        const nextIcdCodes = diseaseResponses.map((d) => mapIcdCode(d))
        const nextPatients = patientResponses.map((p) => mapPatient(p))
        const nextAppointments = appointmentResponses.map((a) => mapAppointment(a, nextPatients))

        setDoctors(nextDoctors)
        setSpecialties(nextSpecialties)
        setMedicines(nextMedicines)
        setIcdCodes(nextIcdCodes)
        setPatients(nextPatients)
        setAppointments(nextAppointments)
      } catch (error) {
        console.error("Không thể tải dữ liệu từ backend, giữ dữ liệu mock hiện tại", error)
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [token])

  const updateDoctorCounts = (nextDoctors: Doctor[]) => {
    setSpecialties((prev) => withDoctorCounts(prev, nextDoctors))
  }

  const getAppointmentRequest = (a: Omit<Appointment, "id">): AppointmentRequest => {
    const patient = patients.find((p) => p.id === a.patientId || p.patientCode === a.patientId)

    return {
      patientId: patient?.patientCode ?? a.patientCode ?? a.patientId,
      doctorId: toNumber(a.doctorId),
      appointmentDate: a.appointmentDate,
      timeSlot: a.timeSlot ?? "08:00 - 09:00",
      symptomsInitial: a.symptomsInitial ?? a.mainDiagnosis,
      status: a.status,
    }
  }

  const value: DataContextValue = {
    specialties,
    doctors,
    medicines,
    icdCodes,
    schedule,
    appointments,
    patients,
    prescriptions,
    examinationRecords,

    addSpecialty: async (s) => {
      try {
        const created = await specialtiesApi.create({ name: s.name })
        setSpecialties((p) => [...p, mapSpecialty(created, s)])
      } catch (error) {
        console.error("Không thể tạo chuyên khoa", error)
      }
    },
    updateSpecialty: async (id, s) => {
      try {
        const updated = await specialtiesApi.update(id, { name: s.name })
        setSpecialties((p) => p.map((x) => (x.id === id ? mapSpecialty(updated, { ...x, ...s }) : x)))
      } catch (error) {
        console.error("Không thể cập nhật chuyên khoa", error)
      }
    },
    deleteSpecialty: async (id) => {
      try {
        await specialtiesApi.delete(id)
        setSpecialties((p) => p.filter((x) => x.id !== id))
      } catch (error) {
        console.error("Không thể xóa chuyên khoa", error)
      }
    },

    addDoctor: async (d) => {
      try {
        const created = await doctorsApi.create(toDoctorRequest(d))
        setDoctors((p) => {
          const next = [...p, mapDoctor(created, d)]
          updateDoctorCounts(next)
          return next
        })
      } catch (error) {
        console.error("Không thể tạo bác sĩ", error)
      }
    },
    updateDoctor: async (id, d) => {
      try {
        const updated = await doctorsApi.update(id, toDoctorRequest(d))
        setDoctors((p) => {
          const next = p.map((x) => (x.id === id ? mapDoctor(updated, { ...x, ...d }) : x))
          updateDoctorCounts(next)
          return next
        })
      } catch (error) {
        console.error("Không thể cập nhật bác sĩ", error)
      }
    },
    deleteDoctor: async (id) => {
      try {
        await doctorsApi.delete(id)
        setDoctors((p) => {
          const next = p.filter((x) => x.id !== id)
          updateDoctorCounts(next)
          return next
        })
      } catch (error) {
        console.error("Không thể xóa bác sĩ", error)
      }
    },
    setShift: (doctorId, day, shift) =>
      setSchedule((p) => {
        const exists = p.find((e) => e.doctorId === doctorId)
        if (exists) {
          return p.map((e) =>
            e.doctorId === doctorId ? { ...e, shifts: { ...e.shifts, [day]: shift } } : e,
          )
        }
        return [...p, { doctorId, shifts: { [day]: shift } }]
      }),

    addMedicine: async (m) => {
      try {
        const created = await medicinesApi.create(toMedicineRequest(m))
        setMedicines((p) => [...p, mapMedicine(created, m)])
      } catch (error) {
        console.error("Không thể tạo thuốc", error)
      }
    },
    updateMedicine: async (id, m) => {
      try {
        const updated = await medicinesApi.update(id, toMedicineRequest(m))
        setMedicines((p) => p.map((x) => (x.id === id ? mapMedicine(updated, { ...x, ...m }) : x)))
      } catch (error) {
        console.error("Không thể cập nhật thuốc", error)
      }
    },
    deleteMedicine: async (id) => {
      try {
        await medicinesApi.delete(id)
        setMedicines((p) => p.filter((x) => x.id !== id))
      } catch (error) {
        console.error("Không thể xóa thuốc", error)
      }
    },

    addIcd: async (c) => {
      try {
        const created = await diseasesApi.create(c)
        setIcdCodes((p) => [...p, mapIcdCode(created)])
      } catch (error) {
        console.error("Không thể tạo mã ICD", error)
      }
    },
    updateIcd: async (id, c) => {
      const current = icdCodes.find((x) => x.id === id)
      try {
        const updated = await diseasesApi.update(current?.code ?? id, c)
        setIcdCodes((p) => p.map((x) => (x.id === id ? mapIcdCode(updated) : x)))
      } catch (error) {
        console.error("Không thể cập nhật mã ICD", error)
      }
    },
    deleteIcd: async (id) => {
      const current = icdCodes.find((x) => x.id === id)
      try {
        await diseasesApi.delete(current?.code ?? id)
        setIcdCodes((p) => p.filter((x) => x.id !== id))
      } catch (error) {
        console.error("Không thể xóa mã ICD", error)
      }
    },

    addAppointment: async (a) => {
      try {
        const created = await appointmentsApi.create(getAppointmentRequest(a))
        setAppointments((p) => [...p, mapAppointment(created, patients, a)])
      } catch (error) {
        console.error("Không thể tạo lịch hẹn", error)
      }
    },
    updateAppointment: async (id, a) => {
      try {
        const updated = await appointmentsApi.update(id, getAppointmentRequest(a))
        setAppointments((p) => p.map((x) => (x.id === id ? mapAppointment(updated, patients, { ...x, ...a }) : x)))
      } catch (error) {
        console.error("Không thể cập nhật lịch hẹn", error)
      }
    },
    deleteAppointment: async (id) => {
      try {
        await appointmentsApi.delete(id)
        setAppointments((p) => p.filter((x) => x.id !== id))
      } catch (error) {
        console.error("Không thể xóa lịch hẹn", error)
      }
    },

    addPatient: async (p) => {
      try {
        const created = await patientsApi.create(toPatientRequest(p))
        setPatients((prev) => [...prev, mapPatient(created, p)])
      } catch (error) {
        console.error("Không thể tạo bệnh nhân", error)
      }
    },
    updatePatient: async (id, p) => {
      try {
        const updated = await patientsApi.update(id, toPatientRequest(p))
        setPatients((prev) => prev.map((x) => (x.id === id ? mapPatient(updated, { ...x, ...p }) : x)))
      } catch (error) {
        console.error("Không thể cập nhật bệnh nhân", error)
      }
    },
    deletePatient: async (id) => {
      try {
        await patientsApi.delete(id)
        setPatients((prev) => prev.filter((x) => x.id !== id))
      } catch (error) {
        console.error("Không thể xóa bệnh nhân", error)
      }
    },

    addPrescription: (p) => setPrescriptions((prev) => [...prev, { ...p, id: uid() }]),
    updatePrescription: (id, p) => setPrescriptions((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x))),
    deletePrescription: (id) => setPrescriptions((prev) => prev.filter((x) => x.id !== id)),

    addExaminationRecord: (e) => setExaminationRecords((prev) => [...prev, { ...e, id: uid() }]),
    updateExaminationRecord: (id, e) => setExaminationRecords((prev) => prev.map((x) => (x.id === id ? { ...x, ...e } : x))),
    deleteExaminationRecord: (id) => setExaminationRecords((prev) => prev.filter((x) => x.id !== id)),

    getWaitingPatients: () => patients.filter((p) => p.status === "waiting"),
    getPatientPrescriptions: (patientId) => prescriptions.filter((p) => p.patientId === patientId),
    getPatientRecords: (patientId) => examinationRecords.filter((e) => e.patientId === patientId),
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error("useData must be used within DataProvider")
  return ctx
}
