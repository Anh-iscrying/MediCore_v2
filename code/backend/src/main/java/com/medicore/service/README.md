# Package: service

Thư mục này chứa tầng xử lý logic nghiệp vụ chính (Business Logic Layer) của ứng dụng. Tầng Service đứng giữa Controller và Repository, chịu trách nhiệm điều phối các hoạt động dữ liệu, kiểm tra luật nghiệp vụ và quản lý giao dịch (Transactions).

---

## 📂 Cấu trúc thư mục

### 1. Thư mục gốc (`com.medicore.service/`)
- Định nghĩa các **Service Interfaces** (Giao diện dịch vụ). Việc tách biệt interface giúp dễ dàng viết Unit Test, mock dữ liệu và tăng tính lỏng lẻo (loose coupling) trong thiết kế.
- [UserService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/UserService.java): Interface cho các nghiệp vụ người dùng.
- [IdGeneratorService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/IdGeneratorService.java): Giao diện tạo mã tự động (ví dụ mã bệnh nhân `PAT-YYYY-NNNN`, mã bệnh án `EMR-...`).

### 2. Thư mục con `impl/` (`com.medicore.service.impl/`)
- Chứa các lớp **Implementation** (Hiện thực hóa) cụ thể cho các interface bên trên.
- [UserServiceImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/impl/UserServiceImpl.java)
- [IdGeneratorServiceImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/impl/IdGeneratorServiceImpl.java)

---

## 🛠️ Quy tắc viết code ở service
1. **Khai báo `@Service`:**
   - Các lớp hiện thực trong thư mục `impl/` bắt buộc phải được đánh dấu bằng `@Service` để Spring có thể quét và đăng ký Bean tự động.
2. **Quản lý Giao dịch (`@Transactional`):**
   - Đánh dấu `@Transactional` ở cấp độ phương thức hoặc cấp lớp đối với tất cả các thao tác thay đổi dữ liệu (thêm, sửa, xóa) liên quan đến nhiều bảng để tránh dữ liệu bị hỏng/mất mát nếu xảy ra lỗi giữa chừng.
   - Sử dụng `@Transactional(readOnly = true)` đối với các dịch vụ chỉ thực hiện truy vấn để tối ưu hóa hiệu năng đọc của Hibernate.
3. **Dependency Injection:**
   - Luôn sử dụng cơ chế constructor injection của Spring thông qua `@RequiredArgsConstructor` từ Lombok để tiêm các Repository hoặc Service con khác. Không sử dụng `@Autowired` trực tiếp lên thuộc tính.
4. **Xử lý lỗi nghiệp vụ:**
   - Không nuốt lỗi (catch im lặng) hoặc trả về các giá trị `null` đại diện cho lỗi. Hãy chủ động ném `CustomBusinessException` với một mã lỗi tương ứng từ `ErrorCodes` để tầng Controller xử lý.
