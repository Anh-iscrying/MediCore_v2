import fs from "fs"
import path from "path"

const DB_PATH = path.join(process.cwd(), "lib/db.json")

export interface Doctor {
  id: number
  name: string
  specialty: string
  experience: string
  rating: number
  fee: string
  education: string
  bio: string
  avatarColor: string
  availableSlots: string[]
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
  doctors: Doctor[]
  appointments: Appointment[]
}

const initialDoctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Sarah Jenkins",
    specialty: "Tim mạch",
    experience: "15 năm kinh nghiệm",
    rating: 4.9,
    fee: "500,000đ",
    education: "Tốt nghiệp Đại học Y Dược TP.HCM, Tu nghiệp tại Hoa Kỳ",
    bio: "Chuyên gia về bệnh mạch vành, suy tim và tăng huyết áp vô căn. Bác sĩ Jenkins đã điều trị thành công hàng ngàn ca bệnh tim mạch phức tạp.",
    avatarColor: "bg-[#111111] border border-[#1f1f1f] text-white",
    availableSlots: ["08:30", "09:00", "10:30"]
  },
  {
    id: 2,
    name: "Dr. Arthur Pendelton",
    specialty: "Tim mạch",
    experience: "10 năm kinh nghiệm",
    rating: 4.8,
    fee: "450,000đ",
    education: "Tốt nghiệp Thạc sĩ Tim mạch học - Đại học Y Hà Nội",
    bio: "Chuyên sâu về rối loạn nhịp tim, siêu âm tim và tầm soát dị tật tim bẩm sinh ở người lớn.",
    avatarColor: "bg-[#111111] border border-[#1f1f1f] text-white",
    availableSlots: ["09:00", "14:00", "15:30"]
  },
  {
    id: 3,
    name: "Dr. Emily Watson",
    specialty: "Vật lý trị liệu",
    experience: "8 năm kinh nghiệm",
    rating: 4.7,
    fee: "350,000đ",
    education: "Cử nhân Phục hồi chức năng - Đại học Y khoa Phạm Ngọc Thạch",
    bio: "Chuyên về trị liệu chấn thương khớp gối, khớp vai sau phẫu thuật, phục hồi khả năng vận động tối ưu.",
    avatarColor: "bg-[#111111] border border-[#1f1f1f] text-white",
    availableSlots: ["10:30", "14:00", "15:30"]
  },
  {
    id: 4,
    name: "Dr. Marcus Aurelius",
    specialty: "Vật lý trị liệu",
    experience: "12 năm kinh nghiệm",
    rating: 4.9,
    fee: "400,000đ",
    education: "Thạc sĩ Vật lý trị liệu thể thao - Đại học Mahidol (Thái Lan)",
    bio: "Từng phụ trách phục hồi chấn thương cho các vận động viên đội tuyển quốc gia. Chuyên sâu về cột sống và thắt lưng.",
    avatarColor: "bg-[#111111] border border-[#1f1f1f] text-white",
    availableSlots: ["08:30", "09:00", "15:30"]
  },
  {
    id: 5,
    name: "Dr. Alex Rivera",
    specialty: "Đa khoa",
    experience: "20 năm kinh nghiệm",
    rating: 5.0,
    fee: "300,000đ",
    education: "Bác sĩ Chuyên khoa II - Đại học Y Hà Nội",
    bio: "Hơn 20 năm kinh nghiệm khám đa khoa, quản lý các bệnh mãn tính như tiểu đường, huyết áp, tầm soát sức khỏe tổng quát.",
    avatarColor: "bg-[#111111] border border-[#1f1f1f] text-white",
    availableSlots: ["08:30", "10:30", "14:00"]
  },
  {
    id: 6,
    name: "Dr. Diana Prince",
    specialty: "Đa khoa",
    experience: "9 năm kinh nghiệm",
    rating: 4.6,
    fee: "300,000đ",
    education: "Bác sĩ Nội trú Đa khoa - Đại học Y Dược Huế",
    bio: "Chuyên tư vấn y học gia đình, dinh dưỡng, điều trị các bệnh lý nội khoa thường gặp và tầm soát ung thư sớm.",
    avatarColor: "bg-[#111111] border border-[#1f1f1f] text-white",
    availableSlots: ["09:00", "10:30", "15:30"]
  }
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
      doctors: initialDoctors,
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
