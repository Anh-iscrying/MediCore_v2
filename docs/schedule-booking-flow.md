# Luồng kết nối, đặt lịch và lọc lịch bác sĩ

Tài liệu này mô tả cách frontend kết nối backend để admin đặt lịch làm cho bác sĩ, bệnh nhân đặt lịch khám, và hệ thống lọc lịch trống.

## 1. Mô hình dữ liệu hiện tại

### 1.1. Bảng `doctor_schedules`

Lưu lịch làm việc tổng quát của bác sĩ theo ngày và ca trực.

```sql
CREATE TABLE IF NOT EXISTS public.doctor_schedules (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    doctor_id integer REFERENCES public.doctors(id) ON DELETE CASCADE,
    work_date date NOT NULL,
    time_slot varchar(50) NOT NULL,
    is_booked boolean DEFAULT false,
    updated_at timestamp with time zone DEFAULT now()
);
```

Ví dụ dữ liệu:

| doctor_id | work_date | time_slot |
|---|---|---|
| 1 | 2026-06-28 | 08:00 - 12:00 |
| 1 | 2026-06-29 | 13:30 - 17:30 |
| 2 | 2026-06-30 | 08:00 - 17:30 |

### 1.2. Bảng `appointments`

Lưu lịch đặt khám chi tiết của bệnh nhân.

```sql
CREATE TABLE IF NOT EXISTS public.appointments (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id varchar(20) REFERENCES public.patients(patient_code),
    doctor_id integer REFERENCES public.doctors(id),
    appointment_date date NOT NULL,
    time_slot varchar(50) NOT NULL,
    symptoms_initial text,
    status text NOT NULL DEFAULT 'WAITING'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

Ví dụ dữ liệu:

| patient_id | doctor_id | appointment_date | time_slot |
|---|---|---|---|
| PAT-0001 | 1 | 2026-06-28 | 08:30 - 09:00 |
| PAT-0002 | 1 | 2026-06-28 | 09:00 - 09:30 |

## 2. Quy ước ca trực

Frontend dùng `ShiftType`, backend/database lưu bằng khung giờ text.

| Frontend | Label | Backend/DB `time_slot` |
|---|---|---|
| `morning` | Ca sáng | `08:00 - 12:00` |
| `afternoon` | Ca chiều | `13:30 - 17:30` |
| `full_day` | Cả ngày | `08:00 - 17:30` |
| `off` | Nghỉ | Không tạo schedule hoặc xóa schedule hiện có |

File frontend:

```text
code/frontend_v1/src/components/features/admin/schedule-content.tsx
code/frontend_v1/src/providers/data-provider.tsx
code/frontend_v1/src/types/medical.ts
code/frontend_v1/src/lib/api.ts
```

File backend:

```text
code/backend/src/main/java/com/medicore/controller/DoctorScheduleController.java
code/backend/src/main/java/com/medicore/service/impl/AppointmentServiceImpl.java
code/backend/src/main/java/com/medicore/repository/DoctorScheduleRepository.java
code/backend/src/main/java/com/medicore/repository/AppointmentRepository.java
```

## 3. Kết nối frontend với backend

### 3.1. Base URL

Frontend gọi backend qua biến môi trường:

```ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"
```

File:

```text
code/frontend_v1/src/lib/api.ts
```

Nếu chạy local, tạo hoặc kiểm tra `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### 3.2. Token xác thực

Mọi request sau login tự gắn JWT token:

```ts
headers["Authorization"] = `Bearer ${token}`
```

Token lấy từ:

```ts
localStorage.getItem("token")
```

Backend yêu cầu admin cho API lịch trực:

```java
@PreAuthorize("hasRole('ADMIN')")
```

## 4. API admin đặt lịch làm cho bác sĩ

Base path:

```http
/api/v1/admin/schedules
```

Yêu cầu role:

```text
ADMIN
```

### 4.1. Lấy danh sách lịch trực

```http
GET /api/v1/admin/schedules
```

Filter theo bác sĩ:

```http
GET /api/v1/admin/schedules?doctorId=1
```

Filter theo ngày:

```http
GET /api/v1/admin/schedules?date=2026-06-28
```

Filter theo bác sĩ và ngày:

```http
GET /api/v1/admin/schedules?doctorId=1&date=2026-06-28
```

Filter theo khoảng ngày:

```http
GET /api/v1/admin/schedules?fromDate=2026-06-01&toDate=2026-06-30
```

Response mẫu:

```json
{
  "status": 200,
  "message": "Thành công",
  "data": [
    {
      "id": 10,
      "doctorId": 1,
      "doctorName": "Nguyễn Văn A",
      "doctorCode": "DOC-0001",
      "workDate": "2026-06-28",
      "timeSlot": "08:00 - 17:30",
      "isBooked": false
    }
  ]
}
```

### 4.2. Tạo lịch trực đơn

```http
POST /api/v1/admin/schedules
```

Body ca sáng:

```json
{
  "doctorId": 1,
  "workDate": "2026-06-28",
  "timeSlot": "08:00 - 12:00"
}
```

Body ca chiều:

```json
{
  "doctorId": 1,
  "workDate": "2026-06-28",
  "timeSlot": "13:30 - 17:30"
}
```

Body cả ngày:

```json
{
  "doctorId": 1,
  "workDate": "2026-06-28",
  "timeSlot": "08:00 - 17:30"
}
```

### 4.3. Cập nhật lịch trực

```http
PUT /api/v1/admin/schedules/{id}
```

Body:

```json
{
  "doctorId": 1,
  "workDate": "2026-06-29",
  "timeSlot": "08:00 - 17:30"
}
```

Điều kiện chặn:

- Không sửa nếu bác sĩ/ngày đó đã có appointment.
- Không sửa thành ca trùng với lịch đã tồn tại.
- Không sửa cho bác sĩ đã ngừng hoạt động.

### 4.4. Xóa lịch trực

```http
DELETE /api/v1/admin/schedules/{id}
```

Điều kiện chặn:

- Không xóa nếu bác sĩ/ngày đó đã có appointment.

### 4.5. Tạo nhiều lịch cùng lúc

```http
POST /api/v1/admin/schedules/bulk
```

Body:

```json
[
  {
    "doctorId": 1,
    "workDate": "2026-06-28",
    "timeSlot": "08:00 - 12:00"
  },
  {
    "doctorId": 1,
    "workDate": "2026-06-29",
    "timeSlot": "08:00 - 17:30"
  }
]
```

### 4.6. Copy lịch từ ngày này sang ngày khác

```http
POST /api/v1/admin/schedules/copy?doctorId=1&fromDate=2026-06-28&toDate=2026-06-29
```

Backend sẽ copy các ca của ngày nguồn sang ngày đích, bỏ qua ca đã tồn tại.

### 4.7. Gán lịch theo chu kỳ

```http
POST /api/v1/admin/schedules/cycle
```

Body ca sáng:

```json
{
  "doctorId": 1,
  "shiftType": "Ca sáng",
  "weeks": [1, 2, 3, 4],
  "daysOfWeek": [2, 4, 6],
  "month": 6,
  "year": 2026
}
```

Body cả ngày:

```json
{
  "doctorId": 1,
  "shiftType": "Cả ngày",
  "weeks": [1, 2, 3, 4],
  "daysOfWeek": [2, 4, 6],
  "month": 6,
  "year": 2026
}
```

Backend hỗ trợ `shiftType`:

```text
Ca sáng
morning
Ca chiều
afternoon
Cả ngày
Ca cả ngày
full_day
Ca tối
night
```

## 5. Luồng admin đặt lịch trên frontend

File chính:

```text
code/frontend_v1/src/components/features/admin/schedule-content.tsx
```

Luồng:

1. Admin vào màn hình lịch trực.
2. Frontend gọi:

```http
GET /api/v1/admin/schedules
```

3. `DataProvider` map dữ liệu backend thành `schedule`.
4. Admin bấm `Gán lịch chi tiết`.
5. Admin chọn tháng.
6. Admin chọn bác sĩ.
7. Admin chọn ca:

```text
Ca sáng
Ca chiều
Cả ngày
Nghỉ
```

8. Admin chọn các ngày trong tháng.
9. Admin bấm `Lưu`.
10. Frontend gọi `setShift` cho từng ngày.

Logic `setShift`:

| Trạng thái | API gọi |
|---|---|
| Chưa có lịch + chọn ca | `POST /admin/schedules` |
| Đã có lịch + đổi ca | `PUT /admin/schedules/{id}` |
| Đã có lịch + chọn Nghỉ | `DELETE /admin/schedules/{id}` |
| Chưa có lịch + chọn Nghỉ | Không gọi API |

## 6. Mapping frontend schedule

Backend response:

```json
{
  "id": 10,
  "doctorId": 1,
  "workDate": "2026-06-28",
  "timeSlot": "08:00 - 17:30"
}
```

Frontend map thành:

```ts
{
  doctorId: "1",
  shifts: {
    "2026-06-28": "full_day"
  },
  scheduleIds: {
    "2026-06-28": "10"
  }
}
```

`shift` dùng để tô màu calendar.

`scheduleIds` dùng để biết khi nào cần `PUT` hoặc `DELETE`.

## 7. API bệnh nhân đặt lịch khám

Base path:

```http
/api/v1/appointments
```

### 7.1. Tạo lịch hẹn

```http
POST /api/v1/appointments
```

Body:

```json
{
  "patientId": "PAT-0001",
  "doctorId": 1,
  "appointmentDate": "2026-06-28",
  "timeSlot": "08:30 - 09:00",
  "symptomsInitial": "Đau đầu, chóng mặt",
  "status": "PENDING"
}
```

### 7.2. Backend kiểm tra trước khi lưu

Khi tạo/sửa appointment, backend kiểm tra:

1. Bệnh nhân tồn tại.
2. Bác sĩ tồn tại.
3. Ngày đặt có lịch trực trong `doctor_schedules`.
4. Slot chi tiết nằm trong ca trực.
5. Slot chưa bị người khác đặt.

Lỗi nếu bác sĩ không có lịch trực:

```text
Bác sĩ không có lịch trực vào ngày đã chọn
```

Lỗi nếu slot không nằm trong ca trực:

```text
Khung giờ hẹn không nằm trong ca trực của bác sĩ
```

Lỗi nếu slot đã bị đặt:

```text
Khung giờ này đã có bệnh nhân đặt lịch
```

## 8. Lọc lịch trống để đặt khám

Hiện logic backend đang đảm bảo validation khi tạo appointment. Nếu cần hiển thị danh sách slot trống cho frontend, dùng quy trình sau.

### 8.1. Input

```text
doctorId = 1
date = 2026-06-28
```

### 8.2. Bước 1: Lấy ca trực của bác sĩ

```sql
SELECT *
FROM doctor_schedules
WHERE doctor_id = 1
  AND work_date = '2026-06-28';
```

Ví dụ kết quả:

```text
08:00 - 17:30
```

### 8.3. Bước 2: Sinh slot khám chi tiết

Nếu ca là `08:00 - 12:00`, sinh:

```text
08:00 - 08:30
08:30 - 09:00
09:00 - 09:30
09:30 - 10:00
10:00 - 10:30
10:30 - 11:00
11:00 - 11:30
11:30 - 12:00
```

Nếu ca là `13:30 - 17:30`, sinh:

```text
13:30 - 14:00
14:00 - 14:30
14:30 - 15:00
15:00 - 15:30
15:30 - 16:00
16:00 - 16:30
16:30 - 17:00
17:00 - 17:30
```

Nếu ca là `08:00 - 17:30`, có thể sinh cả ngày. Khuyên bỏ giờ nghỉ trưa nếu phòng khám không khám trưa:

```text
08:00 - 08:30
08:30 - 09:00
...
11:30 - 12:00
13:30 - 14:00
14:00 - 14:30
...
17:00 - 17:30
```

### 8.4. Bước 3: Lấy slot đã đặt

```sql
SELECT time_slot
FROM appointments
WHERE doctor_id = 1
  AND appointment_date = '2026-06-28'
  AND status <> 'CANCELLED';
```

Ví dụ kết quả:

```text
08:30 - 09:00
14:00 - 14:30
```

### 8.5. Bước 4: Loại slot đã đặt

Slot thô:

```text
08:00 - 08:30
08:30 - 09:00
09:00 - 09:30
14:00 - 14:30
14:30 - 15:00
```

Slot đã đặt:

```text
08:30 - 09:00
14:00 - 14:30
```

Slot còn trống:

```text
08:00 - 08:30
09:00 - 09:30
14:30 - 15:00
```

## 9. API đề xuất để lọc slot trống

Nên thêm API riêng cho frontend đặt khám:

```http
GET /api/v1/doctors/{doctorId}/available-slots?date=2026-06-28
```

Response đề xuất:

```json
{
  "status": 200,
  "message": "Thành công",
  "data": [
    "08:00 - 08:30",
    "09:00 - 09:30",
    "13:30 - 14:00",
    "14:30 - 15:00"
  ]
}
```

Pseudo logic backend:

```java
List<DoctorSchedule> schedules = doctorScheduleRepository.findByDoctorIdAndWorkDate(doctorId, date);
List<String> rawSlots = generateSlotsFromSchedules(schedules);
List<String> bookedSlots = appointmentRepository.findBookedSlots(doctorId, date);
rawSlots.removeAll(bookedSlots);
return rawSlots;
```

## 10. Chỉ mục DB nên có

Chống đặt trùng appointment:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS uk_appointments_doctor_date_time
ON public.appointments (doctor_id, appointment_date, time_slot);
```

Tăng tốc tìm lịch trực:

```sql
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_doctor_date
ON public.doctor_schedules (doctor_id, work_date);
```

Chống trùng lịch trực cùng ca:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS uk_doctor_schedules_doctor_date_time
ON public.doctor_schedules (doctor_id, work_date, time_slot);
```

## 11. Test nhanh bằng curl

### 11.1. Login admin

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medicore.com","password":"admin123"}'
```

Lấy `token` từ response.

```bash
export TOKEN="<JWT_TOKEN>"
```

### 11.2. Tạo lịch cả ngày

```bash
curl -X POST http://localhost:8080/api/v1/admin/schedules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": 1,
    "workDate": "2026-06-28",
    "timeSlot": "08:00 - 17:30"
  }'
```

### 11.3. Xem lịch bác sĩ theo ngày

```bash
curl "http://localhost:8080/api/v1/admin/schedules?doctorId=1&date=2026-06-28" \
  -H "Authorization: Bearer $TOKEN"
```

### 11.4. Đặt lịch khám hợp lệ trong ca cả ngày

```bash
curl -X POST http://localhost:8080/api/v1/appointments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "PAT-0001",
    "doctorId": 1,
    "appointmentDate": "2026-06-28",
    "timeSlot": "08:30 - 09:00",
    "symptomsInitial": "Đau đầu",
    "status": "PENDING"
  }'
```

### 11.5. Đặt trùng slot để kiểm tra lỗi

Chạy lại request trên lần 2. Kết quả mong muốn:

```text
Khung giờ này đã có bệnh nhân đặt lịch
```

## 12. Tóm tắt luồng chính

```text
Admin chọn lịch làm
  -> Frontend POST/PUT/DELETE /admin/schedules
  -> Backend lưu doctor_schedules
  -> Calendar frontend reload/map schedule

Bệnh nhân đặt lịch khám
  -> Frontend POST /appointments
  -> Backend kiểm tra doctor_schedules
  -> Backend kiểm tra appointments đã đặt
  -> Lưu appointments nếu hợp lệ

Frontend lọc lịch trống
  -> Lấy doctor_schedules của ngày
  -> Sinh slot chi tiết
  -> Lấy appointments đã đặt
  -> Loại slot đã bận
  -> Hiển thị slot còn trống
```
