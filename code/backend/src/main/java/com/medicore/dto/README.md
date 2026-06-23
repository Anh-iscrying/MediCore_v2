# Package: dto (Data Transfer Objects)

Thư mục này chứa các đối tượng trung chuyển dữ liệu giữa Client và Server. Việc sử dụng DTO giúp bảo mật cấu trúc cơ sở dữ liệu thật (JPA Entities) và tối ưu hóa lượng dữ liệu truyền tải qua mạng.

---

## 📂 Cấu trúc thư mục

### 1. `request/`
- Chứa các DTO nhận dữ liệu gửi lên từ Client (như form đăng ký, dữ liệu đặt lịch khám, lọc danh sách).
- Sử dụng các annotation của Jakarta Validation để kiểm tra định dạng và tính bắt buộc của dữ liệu (ví dụ: `@NotBlank`, `@Size`, `@Email`).
- [UserRegisterRequest.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/dto/request/UserRegisterRequest.java): DTO mẫu gửi yêu cầu đăng ký tài khoản.

### 2. `response/`
- Chứa các DTO đóng gói dữ liệu trả về cho Client.
- Chỉ chứa các trường thông tin mà Client cần hiển thị, tránh trả về các trường bảo mật (như password hash) hoặc các quan hệ vòng (circular references) từ Entity.

---

## 🛠️ Quy tắc viết code ở dto
- **Không tái sử dụng Entity làm DTO:** Tuyệt đối không truyền Entity trực tiếp vào tầng Controller.
- **Sử dụng Lombok:** Khai báo `@Getter`, `@Setter`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor` để giảm thiểu code boilerplate.
- **Tên lớp rõ ràng:** Đặt tên DTO phản ánh đúng mục đích và hậu tố thích hợp. Ví dụ: `AppointmentCreateRequest`, `DoctorProfileResponse`.
