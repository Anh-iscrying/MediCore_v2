# Package: entity

Thư mục này định nghĩa các thực thể Java (JPA Entities) đại diện trực tiếp cho các bảng trong cơ sở dữ liệu Supabase PostgreSQL.

---

## 📂 Phân chia theo Domain (Phân hệ)

Các Entity được nhóm lại theo từng phân hệ nghiệp vụ để tăng tính dễ bảo trì:

### 1. `user/` (Phân hệ Người dùng)
- [User.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/entity/user/User.java): Tài khoản gốc, đồng bộ với bảng `auth.users` của Supabase.
- [Patient.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/entity/user/Patient.java): Thông tin chi tiết của Bệnh nhân.
- [Doctor.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/entity/user/Doctor.java): Thông tin hồ sơ của Bác sĩ.

### 2. `catalog/` (Phân hệ Danh mục)
- [Specialty.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/entity/catalog/Specialty.java): Danh mục các chuyên khoa y tế.
- [Medicine.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/entity/catalog/Medicine.java): Danh mục thuốc.
- [Disease.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/entity/catalog/Disease.java): Danh mục bệnh lý chuẩn ICD-10.

### 3. `clinical/` (Phân hệ Lâm sàng & Khám bệnh)
- [Appointment.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/entity/clinical/Appointment.java): Đăng ký đặt lịch khám.
- [DoctorSchedule.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/entity/clinical/DoctorSchedule.java): Quản lý lịch trực và khung giờ khám của bác sĩ.
- [MedicalRecord.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/entity/clinical/MedicalRecord.java): Bệnh án điện tử ghi lại thông tin chẩn đoán lâm sàng.
- [Prescription.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/entity/clinical/Prescription.java): Đơn thuốc chính.
- [PrescriptionDetail.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/entity/clinical/PrescriptionDetail.java): Chi tiết đơn thuốc (tên thuốc, số lượng, cách dùng).

### 4. `ai/` (Phân hệ Hỗ trợ AI)
- [AiConsultationLog.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/entity/ai/AiConsultationLog.java): Lịch sử tư vấn lâm sàng từ trợ lý AI.

---

## 🛠️ Quy tắc viết code ở entity (Rất quan trọng)
1. **Kiểu dữ liệu ID:**
   - Hầu hết các bảng danh mục và lâm sàng sử dụng kiểu `Integer` (sinh tự động `int4` ở PostgreSQL). Hãy khai báo `private Integer id;` cho các bảng này.
   - `User` sử dụng `UUID` làm ID khóa chính để khớp với Supabase Auth.
   - Chỉ dùng `Long` cho các thực thể kế thừa `BaseEntity` (như `Patient`, `Doctor`, `Appointment`) để đồng nhất kiểu khóa ngoại liên quan.
2. **Cấu hình `@Column`:**
   - Luôn đặt tên cột tường minh bằng `@Column(name = "ten_cot_db")` để tránh Hibernate tự động map sai tên cột camelCase thành snake_case.
3. **Mối quan hệ `@ManyToOne`, `@OneToOne`, `@OneToMany`:**
   - Luôn sử dụng `fetch = FetchType.LAZY` để tránh truy vấn thừa thãi khi không cần thiết (N+1 Query Problem).
   - Khi định nghĩa `@JoinColumn`, cần chỉ định cột liên kết thật trong cơ sở dữ liệu.
4. **Kiểu thời gian:**
   - Sử dụng `OffsetDateTime` cho các cột lưu dạng `timestamp with time zone` (timestamptz) trong Supabase để giữ nguyên thông tin múi giờ.
