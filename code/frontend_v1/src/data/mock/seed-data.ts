import type { Specialty, Doctor, Medicine, IcdCode, ScheduleEntry, Appointment, Patient, Prescription, ExaminationRecord } from "@/types/medical"

export const seedSpecialties: Specialty[] = [
  { id: "sp1", name: "Tim mạch", code: "TM", description: "Chẩn đoán và điều trị các bệnh lý tim mạch", doctorCount: 4, status: "active" },
  { id: "sp2", name: "Nội tổng quát", code: "NTQ", description: "Khám và điều trị các bệnh nội khoa tổng quát", doctorCount: 6, status: "active" },
  { id: "sp3", name: "Nhi khoa", code: "NHI", description: "Chăm sóc sức khỏe trẻ em", doctorCount: 3, status: "active" },
  { id: "sp4", name: "Sản phụ khoa", code: "SPK", description: "Chăm sóc sức khỏe phụ nữ và thai sản", doctorCount: 5, status: "active" },
  { id: "sp5", name: "Da liễu", code: "DL", description: "Điều trị các bệnh về da", doctorCount: 2, status: "active" },
  { id: "sp6", name: "Tai mũi họng", code: "TMH", description: "Điều trị các bệnh tai mũi họng", doctorCount: 2, status: "inactive" },
]

export const seedDoctors: Doctor[] = [
  { id: "dr1", name: "Nguyễn Văn An", specialtyId: "sp1", title: "Tiến sĩ", email: "an.nguyen@benhvien.vn", phone: "0901234567", experience: 15, status: "active", avatar: "/avatars/avatar-1.jpg" },
  { id: "dr2", name: "Trần Thị Bình", specialtyId: "sp2", title: "Thạc sĩ", email: "binh.tran@benhvien.vn", phone: "0901234568", experience: 10, status: "active", avatar: "/avatars/avatar-2.jpg" },
  { id: "dr3", name: "Lê Hoàng Cường", specialtyId: "sp3", title: "Bác sĩ", email: "cuong.le@benhvien.vn", phone: "0901234569", experience: 6, status: "on-leave", avatar: "/avatars/avatar-3.jpg" },
  { id: "dr4", name: "Phạm Thị Dung", specialtyId: "sp4", title: "PGS.TS", email: "dung.pham@benhvien.vn", phone: "0901234570", experience: 20, status: "active", avatar: "/avatars/avatar-4.jpg" },
  { id: "dr5", name: "Võ Minh Đức", specialtyId: "sp1", title: "Thạc sĩ", email: "duc.vo@benhvien.vn", phone: "0901234571", experience: 8, status: "active", avatar: "/avatars/avatar-1.jpg" },
  { id: "dr6", name: "Đặng Thị Hoa", specialtyId: "sp5", title: "Bác sĩ", email: "hoa.dang@benhvien.vn", phone: "0901234572", experience: 4, status: "inactive", avatar: "/avatars/avatar-2.jpg" },
]

export const seedSchedule: ScheduleEntry[] = [
  { doctorId: "dr1", shifts: { 0: "morning", 1: "morning", 2: "afternoon", 3: "off", 4: "night", 5: "off", 6: "off" } },
  { doctorId: "dr2", shifts: { 0: "afternoon", 1: "afternoon", 2: "morning", 3: "morning", 4: "off", 5: "night", 6: "off" } },
  { doctorId: "dr3", shifts: { 0: "off", 1: "off", 2: "off", 3: "off", 4: "off", 5: "off", 6: "off" } },
  { doctorId: "dr4", shifts: { 0: "morning", 1: "night", 2: "off", 3: "afternoon", 4: "afternoon", 5: "morning", 6: "off" } },
  { doctorId: "dr5", shifts: { 0: "night", 1: "off", 2: "morning", 3: "morning", 4: "afternoon", 5: "off", 6: "morning" } },
]

export const seedMedicines: Medicine[] = [
  { id: "md1", name: "Paracetamol 500mg", code: "PARA500", category: "Giảm đau - Hạ sốt", unit: "Viên", price: 1200, stock: 5400, manufacturer: "DHG Pharma", status: "available" },
  { id: "md2", name: "Amoxicillin 500mg", code: "AMOX500", category: "Kháng sinh", unit: "Viên", price: 2500, stock: 320, manufacturer: "Imexpharm", status: "low" },
  { id: "md3", name: "Vitamin C 1000mg", code: "VITC1000", category: "Vitamin", unit: "Viên sủi", price: 3500, stock: 2100, manufacturer: "Pymepharco", status: "available" },
  { id: "md4", name: "Insulin Mixtard", code: "INSMIX", category: "Tiểu đường", unit: "Ống", price: 185000, stock: 0, manufacturer: "Novo Nordisk", status: "out" },
  { id: "md5", name: "Salbutamol Inhaler", code: "SALBINH", category: "Hô hấp", unit: "Bình xịt", price: 95000, stock: 145, manufacturer: "GSK", status: "available" },
  { id: "md6", name: "Omeprazol 20mg", code: "OME20", category: "Tiêu hóa", unit: "Viên", price: 1800, stock: 240, manufacturer: "Stella", status: "low" },
]

export const seedIcdCodes: IcdCode[] = [
  { id: "ic1", code: "A00", name: "Bệnh tả", category: "Bệnh nhiễm trùng và ký sinh trùng", description: "Nhiễm trùng đường ruột cấp tính do vi khuẩn Vibrio cholerae" },
  { id: "ic2", code: "E11", name: "Đái tháo đường type 2", category: "Bệnh nội tiết, dinh dưỡng và chuyển hóa", description: "Rối loạn chuyển hóa glucose mạn tính" },
  { id: "ic3", code: "I10", name: "Tăng huyết áp vô căn", category: "Bệnh hệ tuần hoàn", description: "Tăng huyết áp nguyên phát không rõ nguyên nhân" },
  { id: "ic4", code: "J45", name: "Hen phế quản", category: "Bệnh hệ hô hấp", description: "Bệnh viêm mạn tính đường thở" },
  { id: "ic5", code: "K29", name: "Viêm dạ dày và tá tràng", category: "Bệnh hệ tiêu hóa", description: "Viêm niêm mạc dạ dày và tá tràng" },
  { id: "ic6", code: "M54", name: "Đau lưng", category: "Bệnh hệ cơ - xương khớp", description: "Đau vùng cột sống lưng" },
]

// Use static dates to avoid hydration mismatch
const staticToday = "2026-06-22T10:00:00Z"
const staticYesterday = "2026-06-21T10:00:00Z"
const staticTomorrow = "2026-06-23T10:00:00Z"
const staticDaysAgo5 = "2026-06-17T10:00:00Z"
const staticDaysAgo10 = "2026-06-12T10:00:00Z"

export const seedAppointments: Appointment[] = [
  { id: "apt1", patientName: "Phạm Quang Huy", patientId: "pt1", doctorId: "dr1", specialtyId: "sp1", appointmentDate: staticToday, icdCode: "I10", mainDiagnosis: "Tăng huyết áp", status: "COMPLETED" },
  { id: "apt2", patientName: "Nguyễn Thị Hương", patientId: "pt2", doctorId: "dr2", specialtyId: "sp2", appointmentDate: staticToday, icdCode: "E11", mainDiagnosis: "Đái tháo đường", status: "COMPLETED" },
  { id: "apt3", patientName: "Trần Văn Kiên", patientId: "pt3", doctorId: "dr4", specialtyId: "sp4", appointmentDate: staticToday, icdCode: "K29", mainDiagnosis: "Viêm dạ dày", status: "PENDING" },
  { id: "apt4", patientName: "Lê Minh Tuấn", patientId: "pt4", doctorId: "dr1", specialtyId: "sp1", appointmentDate: staticYesterday, icdCode: "I10", mainDiagnosis: "Tăng huyết áp", status: "CONFIRMED" },
  { id: "apt5", patientName: "Vũ Thị Lan", patientId: "pt5", doctorId: "dr2", specialtyId: "sp2", appointmentDate: staticDaysAgo5, icdCode: "J45", mainDiagnosis: "Hen phế quản", status: "COMPLETED" },
  { id: "apt6", patientName: "Hoàng Văn Nam", patientId: "pt6", doctorId: "dr4", specialtyId: "sp4", appointmentDate: staticDaysAgo5, icdCode: "M54", mainDiagnosis: "Đau lưng", status: "COMPLETED" },
  { id: "apt7", patientName: "Đỗ Thị Hà", patientId: "pt7", doctorId: "dr1", specialtyId: "sp1", appointmentDate: staticDaysAgo10, icdCode: "I10", mainDiagnosis: "Tăng huyết áp", status: "CANCELLED" },
  { id: "apt8", patientName: "Phạm Văn Toàn", patientId: "pt8", doctorId: "dr2", specialtyId: "sp2", appointmentDate: staticDaysAgo10, mainDiagnosis: "Khám tổng quát", status: "COMPLETED" },
  { id: "apt9", patientName: "Trần Thị Liên", patientId: "pt9", doctorId: "dr5", specialtyId: "sp1", appointmentDate: staticTomorrow, icdCode: "I10", mainDiagnosis: "Tăng huyết áp", status: "CONFIRMED" },
  { id: "apt10", patientName: "Nguyễn Văn Công", patientId: "pt10", doctorId: "dr4", specialtyId: "sp4", appointmentDate: staticToday, icdCode: "E11", mainDiagnosis: "Đái tháo đường", status: "COMPLETED" },
  { id: "apt11", patientName: "Lê Thị Hồng", patientId: "pt11", doctorId: "dr1", specialtyId: "sp1", appointmentDate: staticToday, mainDiagnosis: "Khám tim", status: "PENDING" },
  { id: "apt12", patientName: "Vũ Văn Hải", patientId: "pt12", doctorId: "dr2", specialtyId: "sp2", appointmentDate: staticDaysAgo5, mainDiagnosis: "Khám nội tổng quát", status: "COMPLETED" },
]

export const seedPatients: Patient[] = [
  { id: "pt1", name: "Phạm Quang Huy", dateOfBirth: "1980-05-15", gender: "M", phone: "0912345678", email: "huy.pham@email.com", address: "123 Đường Lê Lợi, Q.1, TP.HCM", insuranceNumber: "BH001234567", status: "waiting", createdAt: staticToday },
  { id: "pt2", name: "Nguyễn Thị Hương", dateOfBirth: "1985-08-22", gender: "F", phone: "0912345679", email: "huong.nguyen@email.com", address: "456 Đường Trần Hưng Đạo, Q.5, TP.HCM", insuranceNumber: "BH001234568", status: "waiting", createdAt: staticToday },
  { id: "pt3", name: "Trần Văn Kiên", dateOfBirth: "1975-03-10", gender: "M", phone: "0912345680", email: "kien.tran@email.com", address: "789 Đường Nguyễn Huệ, Q.1, TP.HCM", insuranceNumber: "BH001234569", status: "in-examination", createdAt: staticToday },
  { id: "pt4", name: "Lê Minh Tuấn", dateOfBirth: "1990-11-30", gender: "M", phone: "0912345681", email: "tuan.le@email.com", address: "321 Đường Đinh Tiên Hoàng, Q.1, TP.HCM", insuranceNumber: "BH001234570", status: "waiting", createdAt: staticToday },
  { id: "pt5", name: "Vũ Thị Lan", dateOfBirth: "1988-07-18", gender: "F", phone: "0912345682", email: "lan.vu@email.com", address: "654 Đường Cách Mạng Tháng 8, Q.3, TP.HCM", insuranceNumber: "BH001234571", status: "completed", createdAt: staticDaysAgo5 },
  { id: "pt6", name: "Hoàng Văn Nam", dateOfBirth: "1982-01-25", gender: "M", phone: "0912345683", email: "nam.hoang@email.com", address: "987 Đường Pasteur, Q.1, TP.HCM", insuranceNumber: "BH001234572", status: "completed", createdAt: staticDaysAgo5 },
  { id: "pt7", name: "Đỗ Thị Hà", dateOfBirth: "1992-06-14", gender: "F", phone: "0912345684", email: "ha.do@email.com", address: "147 Đường Bến Vân Đồn, Q.4, TP.HCM", insuranceNumber: "BH001234573", status: "completed", createdAt: staticDaysAgo10 },
  { id: "pt8", name: "Phạm Văn Toàn", dateOfBirth: "1978-09-05", gender: "M", phone: "0912345685", email: "toan.pham@email.com", address: "258 Đường Lý Tự Trọng, Q.1, TP.HCM", insuranceNumber: "BH001234574", status: "completed", createdAt: staticDaysAgo10 },
  { id: "pt9", name: "Trần Thị Liên", dateOfBirth: "1987-04-20", gender: "F", phone: "0912345686", email: "lien.tran@email.com", address: "369 Đường Võ Văn Kiệt, Q.1, TP.HCM", insuranceNumber: "BH001234575", status: "waiting", createdAt: staticTomorrow },
  { id: "pt10", name: "Nguyễn Văn Công", dateOfBirth: "1983-12-08", gender: "M", phone: "0912345687", email: "cong.nguyen@email.com", address: "741 Đường Trường Chinh, Q.12, TP.HCM", insuranceNumber: "BH001234576", status: "completed", createdAt: staticToday },
  { id: "pt11", name: "Lê Thị Hồng", dateOfBirth: "1991-02-17", gender: "F", phone: "0912345688", email: "hong.le@email.com", address: "852 Đường Bạch Đằng, Q.5, TP.HCM", insuranceNumber: "BH001234577", status: "waiting", createdAt: staticToday },
  { id: "pt12", name: "Vũ Văn Hải", dateOfBirth: "1979-10-03", gender: "M", phone: "0912345689", email: "hai.vu@email.com", address: "963 Đường Tống Hữu Định, Q.9, TP.HCM", insuranceNumber: "BH001234578", status: "completed", createdAt: staticDaysAgo5 },
]

export const seedPrescriptions: Prescription[] = [
  { id: "prs1", appointmentId: "apt1", patientId: "pt1", doctorId: "dr1", prescriptionDate: staticToday, items: [{ medicineId: "md1", medicineName: "Paracetamol 500mg", quantity: 10, unit: "Viên", dosage: "1 viên x 3 lần/ngày" }, { medicineId: "md3", medicineName: "Vitamin C 1000mg", quantity: 20, unit: "Viên sủi", dosage: "1 viên x 2 lần/ngày" }], notes: "Uống sau ăn", status: "issued" },
  { id: "prs2", appointmentId: "apt2", patientId: "pt2", doctorId: "dr2", prescriptionDate: staticToday, items: [{ medicineId: "md2", medicineName: "Amoxicillin 500mg", quantity: 30, unit: "Viên", dosage: "1 viên x 3 lần/ngày" }, { medicineId: "md1", medicineName: "Paracetamol 500mg", quantity: 10, unit: "Viên", dosage: "1 viên khi cần" }], notes: "Uống đầy đủ khóa điều trị", status: "dispensed" },
]

export const seedExaminationRecords: ExaminationRecord[] = [
  { id: "exam1", appointmentId: "apt1", patientId: "pt1", doctorId: "dr1", examinationDate: staticToday, icdCode: "I10", mainDiagnosis: "Tăng huyết áp vô căn", symptoms: "Đau đầu, chóng mặt", physicalExamination: "Huyết áp 160/100 mmHg, mạch 78 lần/phút", testResults: "ECG bình thường", treatment: "Kháng sinh, theo dõi huyết áp", followUpDate: "2026-06-29", createdAt: staticToday },
  { id: "exam2", appointmentId: "apt2", patientId: "pt2", doctorId: "dr2", examinationDate: staticToday, icdCode: "E11", mainDiagnosis: "Đái tháo đường type 2", symptoms: "Khát nước, mệt mỏi", physicalExamination: "BMI 28.5, đường huyết ngẫu nhiên 180 mg/dL", testResults: "HbA1c 8.2%", treatment: "Metformin, chế độ ăn kiêng, tập luyện", followUpDate: "2026-06-30", createdAt: staticToday },
]
