# Chức năng Admin và Bác sĩ

Tài liệu tóm tắt chức năng chính của 2 vai trò **Admin** và **Doctor** trong MediCore, kèm trường dữ liệu liên quan theo schema Supabase hiện tại.

Nguồn tham chiếu:

- `docs/srs.md`
- `docs/database/erd.md`
- `docs/database/schema.sql`
- `code/frontend/README.md`

Cập nhật: 2026-06-22.

---

## 1. Tổng quan vai trò

| Vai trò | Mục tiêu chính | Phạm vi dữ liệu |
|---|---|---|
| Admin | Quản trị hệ thống, người dùng, bác sĩ, danh mục, lịch hẹn và báo cáo. | Toàn bộ dữ liệu vận hành. |
| Doctor | Tiếp nhận ca khám, xem bệnh sử, lập bệnh án, kê đơn, dùng AI hỗ trợ. | Dữ liệu bệnh nhân/ca khám được phân công. |

---

## 2. Admin Portal

### 2.1. Mục tiêu

Admin chịu trách nhiệm vận hành hệ thống phòng khám:

- Quản lý tài khoản và vai trò người dùng.
- Quản lý hồ sơ bác sĩ.
- Quản lý danh mục chuyên khoa, thuốc, bệnh ICD-10.
- Điều phối lịch hẹn, lịch làm việc bác sĩ.
- Theo dõi dữ liệu tổng quan phục vụ báo cáo.
- Giám sát bảo mật và audit log.

Route frontend dự kiến:

```text
/admin
/admin/doctors
/admin/medicines
```

### 2.2. Dashboard Admin

#### Chức năng

- Xem tổng quan hoạt động hệ thống.
- Xem số lượng bệnh nhân, bác sĩ, lịch hẹn, hồ sơ bệnh án.
- Xem lịch hẹn hôm nay theo trạng thái.
- Xem thống kê theo chuyên khoa.
- Xem danh sách cảnh báo vận hành: lịch quá tải, bác sĩ chưa có lịch, dữ liệu thiếu.

#### Trường dữ liệu hiển thị

| Nhóm | Trường | Nguồn DB |
|---|---|---|
| Tổng bệnh nhân | `count(patients.id)` | `patients` |
| Tổng bác sĩ | `count(doctors.id)` | `doctors` |
| Tổng lịch hẹn | `count(appointments.id)` | `appointments` |
| Tổng bệnh án | `count(medical_records.id)` | `medical_records` |
| Lịch theo trạng thái | `appointments.status` | `appointments` |
| Lịch theo ngày | `appointments.appointment_date` | `appointments` |
| Chuyên khoa | `specialties.specialty_name` | `specialties` |

#### Bộ lọc

- Ngày bắt đầu / ngày kết thúc.
- Chuyên khoa.
- Bác sĩ.
- Trạng thái lịch hẹn.

---

### 2.3. Quản lý tài khoản và phân quyền

#### Chức năng

- Xem danh sách tài khoản hệ thống.
- Lọc người dùng theo vai trò: `ADMIN`, `DOCTOR`, `PATIENT`.
- Xem thông tin profile liên kết.
- Khóa/mở khóa tài khoản nếu schema hỗ trợ trạng thái.
- Cấp hoặc thay đổi vai trò người dùng.
- Reset mật khẩu hoặc gửi email kích hoạt nếu dùng Supabase Auth.

#### Trường dữ liệu

Live DB hiện tại:

| Trường | Kiểu | Bảng | Mô tả |
|---|---|---|---|
| `id` | `uuid` | `users` | ID profile, reference `auth.users.id`. |
| `role` | `text` | `users` | Vai trò: `ADMIN`, `DOCTOR`, `PATIENT`. |
| `created_at` | `timestamptz` | `users` | Ngày tạo. |
| `updated_at` | `timestamptz` | `users` | Ngày cập nhật. |

Thông tin email/password nằm trong Supabase Auth `auth.users`, không nằm trong `public.users`.

#### Quy tắc nghiệp vụ

- Chỉ Admin được đổi role.
- Không xóa cứng tài khoản đã có hồ sơ khám; nên khóa/mở khóa nếu có trường trạng thái.
- Khi tạo Doctor/Patient mới, phải tạo `auth.users` trước, sau đó tạo `public.users` cùng `id`.

---

### 2.4. Quản lý bác sĩ

#### Chức năng

- Xem danh sách bác sĩ.
- Tìm kiếm theo mã bác sĩ, tên bác sĩ, số điện thoại.
- Lọc theo chuyên khoa.
- Thêm mới bác sĩ.
- Cập nhật hồ sơ bác sĩ.
- Gán bác sĩ vào chuyên khoa.
- Xem lịch làm việc và lịch hẹn của bác sĩ.
- Theo dõi bác sĩ đã có tài khoản đăng nhập hay chưa.

#### Trường dữ liệu bác sĩ

| Trường | Kiểu | Bảng | Bắt buộc | Mô tả |
|---|---|---|---|---|
| `id` | `integer` | `doctors` | Có | Khóa chính. |
| `user_id` | `uuid` | `doctors` | Không | Link tới `users.id`. |
| `specialty_id` | `integer` | `doctors` | Không | Link tới `specialties.id`. |
| `doctor_code` | `varchar(20)` | `doctors` | Có | Mã bác sĩ, unique. |
| `doctor_name` | `varchar(100)` | `doctors` | Có | Họ tên bác sĩ. |
| `phone` | `varchar(20)` | `doctors` | Không | Số điện thoại. |
| `degree` | `varchar(255)` | `doctors` | Không | Học vị/bằng cấp. |
| `experience_years` | `integer` | `doctors` | Không | Số năm kinh nghiệm. |
| `created_at` | `timestamptz` | `doctors` | Không | Ngày tạo. |
| `updated_at` | `timestamptz` | `doctors` | Không | Ngày cập nhật. |

#### Form thêm/sửa bác sĩ

Trường nên có trên UI:

- Họ tên bác sĩ.
- Số điện thoại.
- Email đăng nhập.
- Chuyên khoa.
- Học vị/bằng cấp.
- Số năm kinh nghiệm.
- Trạng thái hoạt động nếu schema bổ sung sau.

#### Quy tắc nghiệp vụ

- `doctor_code` phải duy nhất.
- Bác sĩ nên thuộc ít nhất một chuyên khoa chính.
- Không xóa bác sĩ đã có lịch hẹn/bệnh án; nên khóa tài khoản hoặc ẩn khỏi lịch đặt khám.
- Nếu xóa user liên kết, DB hiện có `ON DELETE CASCADE` với `doctors.user_id`.

---

### 2.5. Quản lý chuyên khoa

#### Chức năng

- Xem danh sách chuyên khoa.
- Thêm/sửa tên chuyên khoa.
- Kiểm tra chuyên khoa đang có bác sĩ hay không.
- Dùng chuyên khoa cho đặt lịch, gợi ý AI và phân loại bác sĩ.

#### Trường dữ liệu

| Trường | Kiểu | Bảng | Bắt buộc | Mô tả |
|---|---|---|---|---|
| `id` | `integer` | `specialties` | Có | Khóa chính. |
| `specialty_name` | `varchar(100)` | `specialties` | Có | Tên chuyên khoa, unique. |
| `created_at` | `timestamptz` | `specialties` | Không | Ngày tạo. |

#### Quy tắc nghiệp vụ

- `specialty_name` không được trùng.
- Không nên xóa chuyên khoa đang có bác sĩ hoặc log AI tham chiếu.

---

### 2.6. Quản lý thuốc

#### Chức năng

- Xem danh mục thuốc.
- Thêm thuốc mới.
- Sửa tên thuốc và đơn vị tính.
- Tìm kiếm thuốc khi bác sĩ kê đơn.
- Kiểm tra thuốc đang dùng trong đơn thuốc hay chưa.

#### Trường dữ liệu

| Trường | Kiểu | Bảng | Bắt buộc | Mô tả |
|---|---|---|---|---|
| `id` | `integer` | `medicines` | Có | Khóa chính. |
| `medicine_name` | `varchar(100)` | `medicines` | Có | Tên thuốc. |
| `unit` | `varchar(20)` | `medicines` | Có | Đơn vị: viên, chai, gói... |
| `created_at` | `timestamptz` | `medicines` | Không | Ngày tạo. |

#### Quy tắc nghiệp vụ

- Không xóa thuốc đã được dùng trong `prescription_details`.
- Có thể thêm trạng thái `is_active` sau để ẩn thuốc không còn dùng.

---

### 2.7. Quản lý bệnh ICD-10

#### Chức năng

- Xem danh mục bệnh.
- Thêm/sửa mã ICD-10 và tên bệnh.
- Dùng khi bác sĩ tạo bệnh án.

#### Trường dữ liệu

| Trường | Kiểu | Bảng | Bắt buộc | Mô tả |
|---|---|---|---|---|
| `icd10_code` | `varchar(10)` | `diseases` | Có | Khóa chính, mã ICD-10. |
| `disease_name` | `varchar(255)` | `diseases` | Có | Tên bệnh. |
| `created_at` | `timestamptz` | `diseases` | Không | Ngày tạo. |

#### Quy tắc nghiệp vụ

- Không sửa/xóa mã ICD-10 đã dùng trong `medical_records.diagnosis_icd10` nếu làm mất ý nghĩa bệnh án cũ.

---

### 2.8. Quản lý lịch làm việc bác sĩ

#### Chức năng

- Tạo lịch làm việc theo ngày/khung giờ cho bác sĩ.
- Xem lịch trống/lịch đã đặt.
- Đánh dấu khung giờ đã được đặt.
- Điều chỉnh lịch khi bác sĩ nghỉ hoặc đổi ca.

#### Trường dữ liệu

| Trường | Kiểu | Bảng | Bắt buộc | Mô tả |
|---|---|---|---|---|
| `id` | `integer` | `doctor_schedules` | Có | Khóa chính. |
| `doctor_id` | `integer` | `doctor_schedules` | Không | Link tới `doctors.id`. |
| `work_date` | `date` | `doctor_schedules` | Có | Ngày làm việc. |
| `time_slot` | `varchar(50)` | `doctor_schedules` | Có | Khung giờ. |
| `is_booked` | `boolean` | `doctor_schedules` | Không | Đã có lịch hẹn hay chưa. |
| `updated_at` | `timestamptz` | `doctor_schedules` | Không | Ngày cập nhật. |

#### Quy tắc nghiệp vụ

- Một bác sĩ không nên có 2 lịch trùng `work_date + time_slot`.
- Không chỉnh/xóa khung giờ đã có lịch hẹn nếu chưa xử lý lịch hẹn liên quan.

---

### 2.9. Quản lý lịch hẹn toàn hệ thống

#### Chức năng

- Xem toàn bộ lịch hẹn.
- Lọc theo ngày, bác sĩ, chuyên khoa, trạng thái.
- Xem thông tin bệnh nhân và triệu chứng ban đầu.
- Điều phối bác sĩ nếu cần.
- Hủy hoặc đổi lịch khi có yêu cầu.
- Theo dõi hàng chờ khám.

#### Trường dữ liệu

| Trường | Kiểu | Bảng | Bắt buộc | Mô tả |
|---|---|---|---|---|
| `id` | `integer` | `appointments` | Có | Khóa chính. |
| `patient_id` | `varchar(20)` | `appointments` | Không | Link tới `patients.patient_code`. |
| `doctor_id` | `integer` | `appointments` | Không | Link tới `doctors.id`. |
| `appointment_date` | `date` | `appointments` | Có | Ngày hẹn. |
| `time_slot` | `varchar(50)` | `appointments` | Có | Khung giờ. |
| `symptoms_initial` | `text` | `appointments` | Không | Triệu chứng ban đầu. |
| `status` | `text` | `appointments` | Có | `WAITING`, `IN_PROGRESS`, `DONE`, `CANCELLED`. |
| `created_at` | `timestamptz` | `appointments` | Không | Ngày tạo. |
| `updated_at` | `timestamptz` | `appointments` | Không | Ngày cập nhật. |

#### Quy tắc nghiệp vụ

- Không đặt trùng bác sĩ cùng ngày/khung giờ.
- Chỉ cho phép chuyển trạng thái theo flow:

```text
WAITING -> IN_PROGRESS -> DONE
WAITING -> CANCELLED
IN_PROGRESS -> CANCELLED hoặc DONE
```

---

### 2.10. Báo cáo và giám sát

#### Chức năng

- Thống kê số lịch hẹn theo ngày/tháng.
- Thống kê số ca khám hoàn tất.
- Thống kê số bệnh án theo chuyên khoa/bác sĩ.
- Thống kê thuốc được kê nhiều.
- Theo dõi log AI consultation.
- Theo dõi audit log nếu schema bổ sung sau.

#### Trường dữ liệu liên quan

- `appointments.status`
- `appointments.appointment_date`
- `medical_records.created_at`
- `doctors.doctor_name`
- `specialties.specialty_name`
- `prescription_details.quantity`
- `medicines.medicine_name`
- `ai_consultation_logs.created_at`

---

## 3. Doctor Portal

### 3.1. Mục tiêu

Doctor tập trung vào quy trình khám chữa bệnh:

- Xem lịch hẹn được phân công.
- Tiếp nhận bệnh nhân vào ca khám.
- Xem hồ sơ bệnh án cũ.
- Tạo/cập nhật bệnh án điện tử.
- Kê đơn thuốc.
- In/xuất đơn thuốc PDF.
- Dùng AI để hỗ trợ tóm tắt và định hướng chuyên khoa.

Route frontend dự kiến:

```text
/doctor
/doctor/encounter
```

---

### 3.2. Dashboard bác sĩ

#### Chức năng

- Xem danh sách lịch hẹn hôm nay.
- Xem hàng chờ theo trạng thái.
- Lọc lịch theo ngày và trạng thái.
- Tìm nhanh theo tên bệnh nhân, mã bệnh nhân, mã lịch hẹn.
- Mở màn hình khám cho từng lịch hẹn.

#### Trường dữ liệu hiển thị

| Trường | Nguồn DB | Mô tả |
|---|---|---|
| `appointments.id` | `appointments` | Mã lịch hẹn. |
| `appointments.appointment_date` | `appointments` | Ngày khám. |
| `appointments.time_slot` | `appointments` | Khung giờ. |
| `appointments.status` | `appointments` | Trạng thái hàng chờ. |
| `appointments.symptoms_initial` | `appointments` | Triệu chứng ban đầu. |
| `patients.patient_code` | `patients` | Mã bệnh nhân. |
| `patients.full_name` | `patients` | Tên bệnh nhân. |
| `patients.dob` | `patients` | Ngày sinh. |
| `patients.gender` | `patients` | Giới tính. |

#### Trạng thái lịch hẹn

```text
WAITING
IN_PROGRESS
DONE
CANCELLED
```

---

### 3.3. Tiếp nhận ca khám

#### Chức năng

- Bác sĩ chọn một lịch hẹn được phân công.
- Chuyển lịch sang `IN_PROGRESS` khi bắt đầu khám.
- Xem thông tin bệnh nhân và triệu chứng ban đầu.
- Xem lịch sử khám và đơn thuốc cũ.

#### Trường dữ liệu cần đọc

| Nhóm | Trường |
|---|---|
| Bệnh nhân | `patient_code`, `full_name`, `dob`, `gender`, `phone`, `address` |
| Lịch hẹn | `appointment_date`, `time_slot`, `symptoms_initial`, `status` |
| Bác sĩ | `doctor_code`, `doctor_name`, `specialty_id` |
| Bệnh án cũ | `emr_code`, `diagnosis_icd10`, `clinical_note`, `history_summary`, `care_advice`, `created_at` |
| Đơn thuốc cũ | `medicine_name`, `quantity`, `dosage_instruction` |

#### Quy tắc nghiệp vụ

- Bác sĩ chỉ được mở ca khám được phân công.
- Không tạo bệnh án cho lịch đã `CANCELLED`.
- Mỗi lịch hẹn nên có tối đa một hồ sơ bệnh án chính.

---

### 3.4. Quản lý hồ sơ bệnh án EMR

#### Chức năng

- Tạo bệnh án cho ca khám.
- Cập nhật ghi chú lâm sàng.
- Chọn chẩn đoán ICD-10.
- Nhập tóm tắt tiền sử và lời dặn chăm sóc.
- Xem lại bệnh án đã tạo.

#### Trường dữ liệu bệnh án

| Trường | Kiểu | Bảng | Bắt buộc | Mô tả |
|---|---|---|---|---|
| `id` | `integer` | `medical_records` | Có | Khóa chính. |
| `emr_code` | `varchar(30)` | `medical_records` | Có | Mã bệnh án, unique. |
| `appointment_id` | `integer` | `medical_records` | Không | Link tới `appointments.id`. |
| `patient_id` | `varchar(20)` | `medical_records` | Không | Link tới `patients.patient_code`. |
| `doctor_id` | `integer` | `medical_records` | Không | Link tới `doctors.id`. |
| `diagnosis_icd10` | `varchar(10)` | `medical_records` | Không | Link tới `diseases.icd10_code`. |
| `clinical_note` | `text` | `medical_records` | Không | Ghi chú lâm sàng. |
| `history_summary` | `text` | `medical_records` | Không | Tóm tắt bệnh sử. |
| `care_advice` | `text` | `medical_records` | Không | Lời dặn/chăm sóc sau khám. |
| `created_at` | `timestamptz` | `medical_records` | Không | Ngày tạo. |

#### Form bệnh án nên có

- Triệu chứng hiện tại.
- Khám lâm sàng.
- Chẩn đoán ICD-10.
- Ghi chú điều trị.
- Tóm tắt bệnh sử.
- Lời dặn chăm sóc.
- Hẹn tái khám nếu bổ sung schema sau.

#### Quy tắc nghiệp vụ

- `emr_code` phải duy nhất.
- Chẩn đoán nên chọn từ bảng `diseases`.
- Sau khi lưu bệnh án, lịch hẹn có thể chuyển `DONE`.
- Nếu chỉnh sửa bệnh án, nên ghi audit log trong schema bổ sung sau.

---

### 3.5. Kê đơn thuốc điện tử

#### Chức năng

- Tạo đơn thuốc cho bệnh án.
- Thêm nhiều dòng thuốc.
- Chọn thuốc từ danh mục `medicines`.
- Nhập số lượng và hướng dẫn dùng thuốc.
- Xem/tải/in đơn thuốc PDF nếu có `pdf_url`.

#### Trường dữ liệu đơn thuốc

Bảng `prescriptions`:

| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | `integer` | Có | Khóa chính. |
| `medical_record_id` | `integer` | Không | Link tới `medical_records.id`. |
| `pdf_url` | `text` | Không | Link PDF đơn thuốc. |
| `created_at` | `timestamptz` | Không | Ngày tạo. |

Bảng `prescription_details`:

| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | `integer` | Có | Khóa chính. |
| `prescription_id` | `integer` | Không | Link tới `prescriptions.id`. |
| `medicine_id` | `integer` | Không | Link tới `medicines.id`. |
| `quantity` | `integer` | Có | Số lượng. |
| `dosage_instruction` | `varchar(255)` | Không | Hướng dẫn sử dụng. |
| `created_at` | `timestamptz` | Không | Ngày tạo. |

#### Form kê đơn nên có

- Thuốc.
- Số lượng.
- Liều dùng.
- Số lần dùng/ngày.
- Thời gian dùng.
- Hướng dẫn bổ sung.

Schema hiện tại chỉ có `dosage_instruction`, nên các chi tiết như liều dùng/số lần/thời gian có thể gộp vào trường này hoặc bổ sung cột sau.

#### Quy tắc nghiệp vụ

- `quantity > 0` nên được validate ở backend.
- Chỉ bác sĩ phụ trách ca khám được kê/sửa đơn.
- Không sửa đơn sau khi đã xuất bản PDF nếu cần đảm bảo tính pháp lý; có thể tạo version mới sau.

---

### 3.6. Xem lịch sử khám bệnh

#### Chức năng

- Xem các lần khám cũ của bệnh nhân.
- Xem chẩn đoán cũ.
- Xem ghi chú lâm sàng và lời dặn.
- Xem đơn thuốc cũ.
- Dùng làm ngữ cảnh trước khi khám.

#### Trường dữ liệu

- `patients.patient_code`
- `medical_records.emr_code`
- `medical_records.diagnosis_icd10`
- `diseases.disease_name`
- `medical_records.clinical_note`
- `medical_records.history_summary`
- `medical_records.care_advice`
- `prescriptions.pdf_url`
- `prescription_details.quantity`
- `prescription_details.dosage_instruction`
- `medicines.medicine_name`
- `medicines.unit`

---

### 3.7. AI hỗ trợ bác sĩ

#### Chức năng

- Gửi triệu chứng hoặc lịch sử bệnh án cho AI để tóm tắt.
- Gợi ý chuyên khoa phù hợp dựa trên triệu chứng.
- Hiển thị lý do AI đưa ra.
- Lưu log AI để audit và phân tích.

#### Trường dữ liệu AI log

| Trường | Kiểu | Bảng | Mô tả |
|---|---|---|---|
| `id` | `integer` | `ai_consultation_logs` | Khóa chính. |
| `patient_id` | `integer` | `ai_consultation_logs` | Link tới `patients.id`. |
| `symptom_input` | `text` | `ai_consultation_logs` | Nội dung triệu chứng gửi AI. |
| `suggested_specialty_id` | `integer` | `ai_consultation_logs` | Chuyên khoa AI gợi ý. |
| `ai_reasoning` | `text` | `ai_consultation_logs` | Lý do/tóm tắt AI. |
| `created_at` | `timestamptz` | `ai_consultation_logs` | Ngày tạo. |

#### Quy tắc bảo mật

- Không gửi dữ liệu định danh nhạy cảm không cần thiết sang AI provider.
- Nên ẩn/mask số điện thoại, địa chỉ, mã định danh nếu không cần.
- AI chỉ hỗ trợ, bác sĩ vẫn là người quyết định chuyên môn.

---

## 4. Ma trận quyền Admin vs Doctor

| Chức năng | Admin | Doctor |
|---|---:|---:|
| Xem dashboard tổng quan hệ thống | Có | Không |
| Quản lý tài khoản/role | Có | Không |
| Quản lý danh sách bác sĩ | Có | Chỉ xem bản thân nếu cần |
| Quản lý chuyên khoa | Có | Chỉ xem |
| Quản lý thuốc | Có | Chỉ xem/chọn khi kê đơn |
| Quản lý ICD-10 | Có | Chỉ xem/chọn khi chẩn đoán |
| Quản lý lịch làm việc bác sĩ | Có | Xem lịch bản thân |
| Xem toàn bộ lịch hẹn | Có | Chỉ lịch được phân công |
| Cập nhật trạng thái ca khám | Có nếu điều phối | Có với ca được phân công |
| Tạo/cập nhật bệnh án | Không mặc định | Có |
| Kê đơn thuốc | Không mặc định | Có |
| Xem bệnh án toàn hệ thống | Có nếu được cấp quyền | Chỉ bệnh nhân liên quan ca khám |
| Xem AI logs | Có | Chỉ log liên quan ca khám/bệnh nhân |
| Xuất báo cáo | Có | Không hoặc giới hạn cá nhân |

---

## 5. API gợi ý theo module

> Đây là đề xuất thiết kế API, chưa khẳng định đã implement.

### Admin APIs

```text
GET    /api/v1/admin/dashboard
GET    /api/v1/admin/users
PATCH  /api/v1/admin/users/{id}/role
PATCH  /api/v1/admin/users/{id}/status

GET    /api/v1/admin/doctors
POST   /api/v1/admin/doctors
GET    /api/v1/admin/doctors/{id}
PUT    /api/v1/admin/doctors/{id}
DELETE /api/v1/admin/doctors/{id}

GET    /api/v1/admin/specialties
POST   /api/v1/admin/specialties
PUT    /api/v1/admin/specialties/{id}
DELETE /api/v1/admin/specialties/{id}

GET    /api/v1/admin/medicines
POST   /api/v1/admin/medicines
PUT    /api/v1/admin/medicines/{id}
DELETE /api/v1/admin/medicines/{id}

GET    /api/v1/admin/diseases
POST   /api/v1/admin/diseases
PUT    /api/v1/admin/diseases/{icd10Code}
DELETE /api/v1/admin/diseases/{icd10Code}

GET    /api/v1/admin/appointments
PATCH  /api/v1/admin/appointments/{id}/status

GET    /api/v1/admin/doctor-schedules
POST   /api/v1/admin/doctor-schedules
PUT    /api/v1/admin/doctor-schedules/{id}
DELETE /api/v1/admin/doctor-schedules/{id}
```

### Doctor APIs

```text
GET    /api/v1/doctor/me
GET    /api/v1/doctor/appointments
GET    /api/v1/doctor/appointments/{id}
PATCH  /api/v1/doctor/appointments/{id}/start
PATCH  /api/v1/doctor/appointments/{id}/complete

GET    /api/v1/doctor/patients/{patientCode}/history
GET    /api/v1/doctor/medical-records/{id}
POST   /api/v1/doctor/medical-records
PUT    /api/v1/doctor/medical-records/{id}

GET    /api/v1/doctor/prescriptions/{id}
POST   /api/v1/doctor/prescriptions
PUT    /api/v1/doctor/prescriptions/{id}
POST   /api/v1/doctor/prescriptions/{id}/items
PUT    /api/v1/doctor/prescriptions/{id}/items/{itemId}
DELETE /api/v1/doctor/prescriptions/{id}/items/{itemId}

POST   /api/v1/doctor/ai/summary
GET    /api/v1/doctor/ai/logs
```

---

## 6. Gợi ý màn hình frontend

### Admin

| Màn hình | Route | Nội dung |
|---|---|---|
| Dashboard | `/admin` | KPI, chart lịch hẹn, trạng thái hệ thống. |
| Doctors | `/admin/doctors` | CRUD bác sĩ, gán chuyên khoa, xem lịch. |
| Specialties | `/admin/specialties` | CRUD chuyên khoa. |
| Medicines | `/admin/medicines` | CRUD thuốc. |
| Diseases | `/admin/diseases` | CRUD ICD-10. |
| Appointments | `/admin/appointments` | Điều phối lịch hẹn. |
| Schedules | `/admin/schedules` | Quản lý ca làm bác sĩ. |
| Users | `/admin/users` | Tài khoản và role. |
| Reports | `/admin/reports` | Thống kê vận hành. |

### Doctor

| Màn hình | Route | Nội dung |
|---|---|---|
| Dashboard | `/doctor` | Lịch hẹn hôm nay, hàng chờ khám. |
| Encounter | `/doctor/encounter/{appointmentId}` | Khám bệnh, tạo EMR, kê đơn. |
| Patient History | `/doctor/patients/{patientCode}` | Lịch sử khám, đơn thuốc cũ. |
| Prescriptions | `/doctor/prescriptions/{id}` | Chi tiết đơn thuốc, PDF. |
| AI Summary | Trong Encounter | Tóm tắt hồ sơ và triệu chứng. |

---

## 7. Gợi ý bổ sung schema sau

Schema hiện tại đủ cho MVP nhưng nên bổ sung khi làm chức năng đầy đủ:

### Cho Admin

- `users.is_active` hoặc `status` để khóa/mở khóa tài khoản.
- `audit_logs` để lưu hành động quan trọng.
- `doctor_schedules` unique constraint trên `(doctor_id, work_date, time_slot)`.
- `appointments.cancel_reason` nếu cho phép hủy lịch có lý do.

### Cho Doctor

- `medical_records.updated_at`, `updated_by`.
- `medical_record_versions` hoặc audit nếu cần lịch sử chỉnh sửa.
- Tách chi tiết đơn thuốc:
  - `dosage`
  - `frequency`
  - `duration_days`
  - `note`
- `prescriptions.status` để phân biệt draft/published/cancelled.
- `prescriptions.signed_at` nếu cần ký/xuất bản đơn.

---

## 8. Kết luận

Admin chịu trách nhiệm quản trị và vận hành toàn hệ thống. Doctor chịu trách nhiệm nghiệp vụ khám chữa bệnh. Hai vai trò dùng chung các bảng lõi nhưng phạm vi quyền khác nhau:

- Admin quản lý dữ liệu nền và điều phối.
- Doctor xử lý dữ liệu lâm sàng theo ca khám được phân công.

Thiết kế API/UI nên giữ tách module:

```text
/admin/**  -> quản trị
/doctor/** -> nghiệp vụ bác sĩ
```

Backend nên enforce quyền bằng role-based access control trước khi mở production.
