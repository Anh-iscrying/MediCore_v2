# Package: repository

Thư mục này chịu trách nhiệm giao tiếp trực tiếp với cơ sở dữ liệu Supabase thông qua Spring Data JPA. Các interface ở đây kế thừa `JpaRepository` để cung cấp các thao tác CRUD cơ bản và các truy vấn nâng cao.

---

## 📂 Các Repository hiện tại
- [UserRepository.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/repository/UserRepository.java): Quản lý tài khoản (sử dụng khóa chính `UUID`).
- [PatientRepository.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/repository/PatientRepository.java): Truy vấn dữ liệu Bệnh nhân (khóa chính `Integer`).
- [DoctorRepository.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/repository/DoctorRepository.java): Truy vấn dữ liệu Bác sĩ (khóa chính `Integer`).
- [SpecialtyRepository.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/repository/SpecialtyRepository.java): Truy vấn dữ liệu Chuyên khoa (khóa chính `Integer`).

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
