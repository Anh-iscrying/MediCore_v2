# Package: repository

Thư mục này chịu trách nhiệm giao tiếp trực tiếp với cơ sở dữ liệu Supabase thông qua Spring Data JPA. Các interface ở đây kế thừa `JpaRepository` để cung cấp các thao tác CRUD cơ bản và các truy vấn nâng cao.

Để đảm bảo tính tổ chức và dễ bảo trì, thư mục đã được tái cấu trúc thành các thư mục con chuyên biệt theo từng phân hệ chức năng:

---

## 📂 Cấu trúc thư mục con

### 1. `auth`
Quản lý các thao tác liên quan đến xác thực tài khoản và kiểm tra OTP.
*   [AuthCredentialsRepository.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/repository/auth/AuthCredentialsRepository.java): Xác thực và phân quyền tài khoản (Email, Role, Password).
*   [EmailOtpRepository.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/repository/auth/EmailOtpRepository.java): Lưu trữ, đối chiếu OTP gửi qua email.

### 2. `ai`
Lưu trữ nhật ký hội thoại và xử lý ngữ cảnh của trợ lý ảo AI.
*   [AiConsultationLogRepository.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/repository/ai/AiConsultationLogRepository.java): Nhật ký hội thoại AI của bệnh nhân.
*   [DoctorAiConsultationLogRepository.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/repository/ai/DoctorAiConsultationLogRepository.java): Nhật ký hội thoại AI của bác sĩ.

### 3. `clinical`
Quản lý lưu trữ thông tin bệnh án, đơn thuốc, lịch hẹn khám và danh mục thuốc/bệnh lý.
*   [AppointmentRepository.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/repository/clinical/AppointmentRepository.java): Quản lý truy vấn lịch hẹn khám.
*   [MedicalRecordRepository.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/repository/clinical/MedicalRecordRepository.java): Quản lý bệnh án điện tử (EMR).
*   [PrescriptionRepository.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/repository/clinical/PrescriptionRepository.java): Thông tin đầu đơn thuốc của bệnh án.
*   [PrescriptionDetailRepository.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/repository/clinical/PrescriptionDetailRepository.java): Chi tiết kê đơn thuốc (liều dùng, số lượng, cách dùng).
*   [TreatmentTemplateRepository.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/repository/clinical/TreatmentTemplateRepository.java): Mẫu phác đồ điều trị của bác sĩ.
*   [TemplateDetailRepository.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/repository/clinical/TemplateDetailRepository.java): Chi tiết thuốc trong mẫu phác đồ.
*   [DiseaseRepository.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/repository/clinical/DiseaseRepository.java): Quản lý danh mục bệnh lý ICD-10.
*   [MedicineRepository.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/repository/clinical/MedicineRepository.java): Quản lý danh mục thuốc.

### 4. `user`
Lưu trữ thông tin chi tiết của các nhóm người dùng trong hệ thống (Bác sĩ, Bệnh nhân) cùng lịch làm việc chuyên biệt.
*   [UserRepository.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/repository/user/UserRepository.java): Quản lý người dùng chung (khóa chính UUID).
*   [DoctorRepository.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/repository/user/DoctorRepository.java): Quản lý hồ sơ bác sĩ.
*   [PatientRepository.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/repository/user/PatientRepository.java): Quản lý hồ sơ bệnh nhân.
*   [DoctorScheduleRepository.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/repository/user/DoctorScheduleRepository.java): Quản lý lịch làm việc đăng ký của bác sĩ.
*   [SpecialtyRepository.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/repository/user/SpecialtyRepository.java): Danh mục chuyên khoa.

### 5. `system`
Thực hiện các truy vấn dữ liệu vận hành hệ thống lõi.
*   [NotificationRepository.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/repository/system/NotificationRepository.java): Lưu trữ và cập nhật trạng thái thông báo gửi đến người dùng.

---

## 🛠️ Quy tắc viết code ở repository
1. **Đặt tên phương thức tự động (Query Methods):**
   - Tận dụng cơ chế sinh câu truy vấn tự động của Spring Data JPA bằng cách đặt tên phương thức đúng chuẩn. Ví dụ: `findByPatientCode(String code)`, `existsBySpecialtyName(String name)`.
2. **Sử dụng `@Query` khi cần thiết:**
   - Khi cần truy vấn phức tạp (join nhiều bảng hoặc lọc nâng cao), hãy tự viết JPQL hoặc SQL Native bằng annotation `@Query`.
   - Ví dụ:
     ```java
     @Query("SELECT d FROM Doctor d WHERE d.specialty.id = :specialtyId")
     List<Doctor> findDoctorsBySpecialty(Integer specialtyId);
     ```
3. **Phân trang & Sắp xếp (Paging & Sorting):**
   - Tránh truy vấn toàn bộ dữ liệu của bảng lớn. Sử dụng tham số `Pageable` trong phương thức để phân trang dữ liệu trả về (trả về kiểu `Page<T>` hoặc `Slice<T>`).
4. **Kiểu dữ liệu ID trong Generics:**
   - Đảm bảo tham số kiểu ID thứ hai trong `JpaRepository<Entity, ID>` phải khớp chính xác với kiểu dữ liệu của trường `@Id` khai báo tại Entity đó (ví dụ: `UUID`, `Integer`).
