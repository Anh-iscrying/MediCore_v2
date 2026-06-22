# Package: common

Thư mục này chứa các lớp bổ trợ, cấu trúc dữ liệu dùng chung, hằng số (constants) và cơ chế xử lý ngoại lệ trong toàn bộ hệ thống backend.

---

## 📂 Các thư mục con

### 1. `base/`
- Chứa các class cơ sở làm khung mẫu cho các Entity hoặc Dto.
- [BaseEntity.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/common/base/BaseEntity.java): Chứa ID và hai trường kiểm toán `created_at` (ngày tạo) và `updated_at` (ngày cập nhật). Các thực thể như `Patient`, `Doctor`, và `Appointment` kế thừa từ lớp này.

### 2. `constants/`
- Định nghĩa các Enum và biến hằng số dùng chung trên toàn hệ thống.
- `UserRole.java`: Phân quyền người dùng (`ADMIN`, `DOCTOR`, `PATIENT`).
- `GenderType.java`: Giới tính (`MALE`, `FEMALE`, `OTHER`).
- `AppointmentStatus.java`: Trạng thái lịch khám (`WAITING`, `IN_PROGRESS`, `DONE`, `CANCELLED`).
- `ErrorCodes.java`: Danh mục mã lỗi và thông điệp trả về cho Client.

### 3. `exception/`
- Quản lý và ném các lỗi nghiệp vụ một cách chủ động.
- `CustomBusinessException.java`: Ngoại lệ Runtime tùy biến, sử dụng `ErrorCodes` làm tham số để tự động map mã lỗi và thông báo lỗi.

---

## 🛠️ Quy tắc viết code ở common
- **Tránh phình to:** Chỉ đưa các thành phần thực sự có tính chất sử dụng toàn cục (Global) vào package này.
- **Tính đóng gói:** Các mã lỗi mới cần được khai báo tập trung trong `ErrorCodes.java` thay vì viết cứng (hardcode) chuỗi thông báo lỗi tại các lớp logic.
