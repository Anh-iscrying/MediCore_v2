import fs from "fs"
import path from "path"

const DB_PATH = path.join(process.cwd(), "lib/db.json")

export interface Specialty {
  id: number
  name: string
}

export interface Doctor {
  id: number
  specialty_id: number
  doctor_code: string
  doctor_name: string
  degree: string
  experience_years: number
  bio: string
  rating: number
  fee: string
  avatarColor: string
}

export interface DoctorSchedule {
  id: number
  doctor_id: number
  work_date: string
  time_slot: string
  is_booked: boolean
}

export interface Appointment {
  id: string
  doctor: string
  specialty: string
  date: string
  time: string
  status: "CONFIRMED" | "PENDING" | "CANCELLED"
  symptoms?: string
}

interface DBData {
  specialties?: Specialty[]
  doctors: Doctor[]
  doctor_schedules?: DoctorSchedule[]
  appointments: Appointment[]
}

const initialSpecialties: Specialty[] = [
  { id: 1, name: "Tim mạch" },
  { id: 2, name: "Vật lý trị liệu" },
  { id: 3, name: "Đa khoa" }
]

const initialDoctors: Doctor[] = [
  {
    id: 1,
    specialty_id: 1,
    doctor_code: "DOC001",
    doctor_name: "Dr. Sarah Jenkins",
    degree: "Tốt nghiệp Đại học Y Dược TP.HCM, Tu nghiệp tại Hoa Kỳ",
    experience_years: 15,
    bio: "Chuyên gia về bệnh mạch vành, suy tim và tăng huyết áp vô căn. Bác sĩ Jenkins đã điều trị thành công hàng ngàn ca bệnh tim mạch phức tạp.",
    rating: 4.9,
    fee: "500,000đ",
    avatarColor: "bg-[#111111] border border-[#1f1f1f] text-white"
  },
  {
    id: 2,
    specialty_id: 1,
    doctor_code: "DOC002",
    doctor_name: "Dr. Arthur Pendelton",
    degree: "Tốt nghiệp Thạc sĩ Tim mạch học - Đại học Y Hà Nội",
    experience_years: 10,
    bio: "Chuyên sâu về rối loạn nhịp tim, siêu âm tim và tầm soát dị tật tim bẩm sinh ở người lớn.",
    rating: 4.8,
    fee: "450,000đ",
    avatarColor: "bg-[#111111] border border-[#1f1f1f] text-white"
  },
  {
    id: 3,
    specialty_id: 2,
    doctor_code: "DOC003",
    doctor_name: "Dr. Emily Watson",
    degree: "Cử nhân Phục hồi chức năng - Đại học Y khoa Phạm Ngọc Thạch",
    experience_years: 8,
    bio: "Chuyên về trị liệu chấn thương khớp gối, khớp vai sau phẫu thuật, phục hồi khả năng vận động tối ưu.",
    rating: 4.7,
    fee: "350,000đ",
    avatarColor: "bg-[#111111] border border-[#1f1f1f] text-white"
  }
]

const initialDoctorSchedules: DoctorSchedule[] = [
  { id: 1, doctor_id: 1, work_date: "2026-06-28", time_slot: "08:30", is_booked: false },
  { id: 2, doctor_id: 1, work_date: "2026-06-28", time_slot: "09:00", is_booked: false },
  { id: 3, doctor_id: 1, work_date: "2026-06-28", time_slot: "10:30", is_booked: false },
  { id: 4, doctor_id: 2, work_date: "2026-06-28", time_slot: "09:00", is_booked: false },
  { id: 5, doctor_id: 2, work_date: "2026-06-28", time_slot: "14:00", is_booked: false },
  { id: 6, doctor_id: 2, work_date: "2026-06-28", time_slot: "15:30", is_booked: false },
  { id: 7, doctor_id: 3, work_date: "2026-06-28", time_slot: "10:30", is_booked: false },
  { id: 8, doctor_id: 3, work_date: "2026-06-28", time_slot: "14:00", is_booked: false },
  { id: 9, doctor_id: 3, work_date: "2026-06-28", time_slot: "15:30", is_booked: false }
]

const initialAppointments: Appointment[] = [
  { id: "1", doctor: "Dr. Sarah Jenkins", specialty: "Tim mạch", date: "Ngày mai", time: "09:00 AM", status: "CONFIRMED" },
  { id: "2", doctor: "Dr. Emily Watson", specialty: "Vật lý trị liệu", date: "Thứ Sáu, 28 Th06", time: "02:30 PM", status: "PENDING" },
  { id: "3", doctor: "Dr. Alex Rivera", specialty: "Đa khoa", date: "12 Th06 2026", time: "11:00 AM", status: "CANCELLED" }
]

function ensureDB() {
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  if (!fs.existsSync(DB_PATH)) {
    const data: DBData = {
      specialties: initialSpecialties,
      doctors: initialDoctors,
      doctor_schedules: initialDoctorSchedules,
      appointments: initialAppointments
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8")
  }
}

export function readDB(): DBData {
  ensureDB()
  const content = fs.readFileSync(DB_PATH, "utf8")
  return JSON.parse(content)
}

export function writeDB(data: DBData) {
  ensureDB()
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8")
}
