# Hệ thống Lịch hẹn (Appointments) - MediCore

## Tổng quan

Hệ thống lịch hẹn quản lý việc đặt lịch khám bệnh giữa bệnh nhân và bác sĩ. Dữ liệu được lưu trên **Supabase (PostgreSQL)** và giao tiếp qua **Spring Boot API**.

---

## Bảng dữ liệu liên quan

### 1. `appointments`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | `integer` (auto) | Khóa chính |
| `patient_id` | `varchar(20)` | FK → `patients.patient_code` |
| `doctor_id` | `integer` | FK → `doctors.id` |
| `appointment_date` | `date` | Ngày hẹn khám |
| `time_slot` | `varchar(255)` | Khung giờ (vd: `08:00 - 09:00`) |
| `symptoms_initial` | `text` | Triệu chứng ban đầu |
| `status` | `varchar(255)` | Trạng thái (xem bảng mapping bên dưới) |
| `created_at` | `timestamptz` | Thời gian tạo |
| `updated_at` | `timestamptz` | Thời gian cập nhật |

**Constraints:**
- `UNIQUE(doctor_id, appointment_date, time_slot)` — Mỗi bác sĩ chỉ có 1 lịch hẹn/khung giờ/ngày
- `status` chỉ nhận: `WAITING`, `IN_PROGRESS`, `DONE`, `CANCELLED`

### 2. `doctors`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | `integer` (auto) | Khóa chính |
| `doctor_code` | `varchar(20)` | Mã bác sĩ (vd: `DOC-0006`) |
| `doctor_name` | `varchar(255)` | Tên bác sĩ |
| `specialty_id` | `integer` | FK → `specialties.id` |

### 3. `patients`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | `integer` (auto) | Khóa chính |
| `patient_code` | `varchar(20)` | Mã bệnh nhân (vd: `PAT-2026-0001`) |
| `full_name` | `varchar(255)` | Họ tên bệnh nhân |
| `gender` | `varchar` | `MALE` / `FEMALE` / `OTHER` |

---

## ⚠️ Mapping trạng thái: DB ↔ API

> [!IMPORTANT]
> Backend có lớp mapping 2 chiều giữa giá trị lưu trong DB (Supabase) và giá trị trả về qua API (DTO).
> Frontend **luôn nhận/gửi giá trị DTO**, không bao giờ làm việc trực tiếp với giá trị DB.

| DB (Supabase) | API Response (DTO) | Ý nghĩa |
|:---:|:---:|:---|
| `WAITING` | `PENDING` | Bệnh nhân đang chờ khám |
| `IN_PROGRESS` | `CONFIRMED` | Đang trong quá trình khám |
| `DONE` | `COMPLETED` | Đã khám xong |
| `CANCELLED` | `CANCELLED` | Đã hủy lịch hẹn |

**Mapping code tại:** `AppointmentServiceImpl.java`

```java
// DB → DTO (khi trả response)
private String mapToStatusDto(AppointmentStatus status) {
    switch (status) {
        case WAITING:     return "PENDING";
        case IN_PROGRESS: return "CONFIRMED";
        case DONE:        return "COMPLETED";
        case CANCELLED:   return "CANCELLED";
        default:          return "PENDING";
    }
}

// DTO → DB (khi nhận request)
private AppointmentStatus mapToStatusEntity(String statusDto) {
    switch (statusDto.toUpperCase()) {
        case "PENDING":   return AppointmentStatus.WAITING;
        case "CONFIRMED": return AppointmentStatus.IN_PROGRESS;
        case "COMPLETED": return AppointmentStatus.DONE;
        case "CANCELLED": return AppointmentStatus.CANCELLED;
        default:          return AppointmentStatus.WAITING;
    }
}
```

> [!WARNING]
> Nếu frontend gửi `"WAITING"` trong request, backend cũng chấp nhận và map về `WAITING` (qua nhánh `default`). Nhưng response trả về sẽ là `"PENDING"`.
> Vì vậy, frontend cần check cả `PENDING` lẫn `WAITING` khi lọc trạng thái chờ khám.

---

## Luồng xử lý hiện tại

### Đặt lịch hẹn (Tạo appointment)

```
POST /api/v1/appointments
{
  "patientId": "PAT-2026-0001",    // patient_code
  "doctorId": 17,                   // doctors.id
  "appointmentDate": "2026-06-29",
  "timeSlot": "08:00 - 09:00",
  "symptomsInitial": "Đau đầu, sốt nhẹ",
  "status": "WAITING"               // hoặc "PENDING" → đều map về WAITING trong DB
}
```

### Bác sĩ xem danh sách bệnh nhân chờ

```
Đăng nhập → user.doctorId = 17
  ↓
Frontend gọi: GET /api/v1/appointments/doctor/17
  ↓
Backend trả: appointments[] (chỉ của bác sĩ này)
  ↓
Frontend lọc: status === "PENDING" && appointmentDate === today
  ↓
Tìm patients tương ứng → Hiển thị danh sách
  ↓
Sắp xếp theo timeSlot sớm nhất lên trước
```

### Admin xem tất cả lịch hẹn

```
Frontend gọi: GET /api/v1/appointments
  ↓
Backend trả: TẤT CẢ appointments trong hệ thống
```

---

## API Endpoints

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/appointments` | Lấy tất cả lịch hẹn | Admin |
| `GET` | `/appointments/{id}` | Lấy 1 lịch hẹn | Token |
| `GET` | `/appointments/doctor/{doctorId}` | Lịch hẹn theo bác sĩ | Token |
| `GET` | `/appointments/patient/{patientId}` | Lịch hẹn theo bệnh nhân | Token |
| `POST` | `/appointments` | Tạo lịch hẹn mới | Token |
| `PUT` | `/appointments/{id}` | Cập nhật lịch hẹn | Token |
| `DELETE` | `/appointments/{id}` | Xóa lịch hẹn | Token |

---

## Frontend: Các file liên quan

| File | Chức năng |
|------|-----------|
| `src/lib/api.ts` | `appointmentsApi.list()`, `appointmentsApi.listByDoctor(id)` |
| `src/providers/data-provider.tsx` | `getWaitingPatients()` — lọc theo role + status + ngày |
| `src/components/features/doctor/waiting-patients-list.tsx` | Hiển thị danh sách bệnh nhân chờ khám |
| `src/types/medical.ts` | `AppointmentStatus` type definition |

### Frontend Type: `AppointmentStatus`

```typescript
type AppointmentStatus =
  | "PENDING"      // ← API trả về cho WAITING
  | "CONFIRMED"    // ← API trả về cho IN_PROGRESS
  | "COMPLETED"    // ← API trả về cho DONE
  | "CANCELLED"
  | "NO_SHOW"
  | "WAITING"      // ← DB value (dự phòng)
  | "IN_PROGRESS"  // ← DB value (dự phòng)
  | "DONE"         // ← DB value (dự phòng)
```

### Logic lọc bệnh nhân chờ (`data-provider.tsx`)

```typescript
getWaitingPatients: () => {
  if (user?.role === "DOCTOR" && user?.doctorId) {
    const waitingStatuses = new Set(["WAITING", "PENDING"])
    // Lọc appointments: đúng bác sĩ + status chờ + ngày hôm nay
    const doctorWaitingAppointments = appointments.filter(
      (a) => a.doctorId === doctorIdStr &&
             waitingStatuses.has(a.status) &&
             a.appointmentDate === today
    )
    // Tìm patients tương ứng
    return patients.filter(p => waitingPatientIds.has(p.id) || ...)
  }
  // Admin: trả tất cả patients có status "waiting"
  return patients.filter(p => p.status === "waiting")
}
```

---

## Test Script

File: `test_appointment.sh`

```bash
bash /path/to/MediCore_v2/code/test_appointment.sh
```

Script tự động:
1. Đăng nhập Admin lấy token
2. Lấy danh sách bệnh nhân
3. Tạo lịch hẹn WAITING cho bệnh nhân đầu tiên với bác sĩ ID=17 (đoàn đỗ)
4. Kiểm tra danh sách lịch hẹn của bác sĩ
