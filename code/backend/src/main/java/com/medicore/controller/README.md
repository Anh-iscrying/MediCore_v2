# Package: controller

Thư mục này chịu trách nhiệm tiếp nhận và định tuyến các yêu cầu HTTP từ phía client (Frontend/Mobile), kiểm tra tính hợp lệ của dữ liệu đầu vào và chuyển tiếp công việc đến tầng Service.

Để đảm bảo tính tổ chức và dễ bảo trì, thư mục đã được tái cấu trúc thành các thư mục con chuyên biệt theo từng phân hệ chức năng:

---

## 📂 Cấu trúc thư mục con

### 1. `auth`
Quản lý xác thực người dùng, đăng ký, đăng nhập và xử lý mã xác thực OTP gửi qua email.
*   [AuthController.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/controller/auth/AuthController.java): Endpoint đăng nhập, đăng ký, thay đổi mật khẩu, xác minh OTP.

### 2. `ai`
Tích hợp trợ lý ảo thông minh cho bác sĩ và bệnh nhân.
*   [AiChatController.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/controller/ai/AiChatController.java): Endpoint gửi tin nhắn và nhận phản hồi từ AI Assistant, lập kế hoạch lộ trình khám tự động.

### 3. `clinical`
Quản lý toàn bộ quy trình khám chữa bệnh, lịch hẹn, bệnh án, danh mục bệnh lý, thuốc và mẫu phác đồ.
*   [AppointmentController.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/controller/clinical/AppointmentController.java): Quản lý đăng ký, xếp lịch và cập nhật trạng thái lịch hẹn khám.
*   [MedicalRecordController.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/controller/clinical/MedicalRecordController.java): Tạo hồ sơ bệnh án điện tử (EMR), quản lý đơn thuốc, và xuất file PDF bệnh án.
*   [TreatmentTemplateController.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/controller/clinical/TreatmentTemplateController.java): Quản lý các mẫu phác đồ điều trị có sẵn phục vụ kê đơn nhanh.
*   [DiseaseController.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/controller/clinical/DiseaseController.java): Quản trị và tra cứu danh mục bệnh lý ICD-10.
*   [MedicineController.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/controller/clinical/MedicineController.java): Quản trị và tra cứu danh mục thuốc.
*   [ImportController.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/controller/clinical/ImportController.java): Endpoint hỗ trợ import danh mục thuốc và bệnh lý từ file Excel.

### 4. `user`
Quản lý thông tin hồ sơ của các nhóm người dùng trong hệ thống (Bác sĩ, Bệnh nhân) và phân lịch khám.
*   [DoctorController.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/controller/user/DoctorController.java): Xem danh sách, thông tin chi tiết và cập nhật hồ sơ cá nhân của Bác sĩ.
*   [DoctorScheduleController.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/controller/user/DoctorScheduleController.java): Đăng ký và quản lý ca làm việc (work schedules) của bác sĩ theo ngày/giờ.
*   [PatientController.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/controller/user/PatientController.java): Tra cứu danh sách và quản lý thông tin hồ sơ bệnh nhân.
*   [SpecialtyController.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/controller/user/SpecialtyController.java): Quản lý danh mục các chuyên khoa (Nội khoa, Sản, Nhi, v.v.).

### 5. `system`
Chứa các controller quản lý tính năng lõi hệ thống và các công cụ kiểm thử.
*   [NotificationController.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/controller/system/NotificationController.java): Quản lý danh sách thông báo và cập nhật trạng thái đã đọc của người dùng.
*   [WebSocketTestController.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/controller/system/WebSocketTestController.java): Endpoint dùng để kiểm tra tính năng gửi tin nhắn thời gian thực qua giao thức WebSocket STOMP.

---

## 🛠️ Quy tắc viết code ở controller
1. **Thiết kế RESTful API:**
   - Sử dụng `@RestController` để trả về dữ liệu dạng JSON.
   - Sử dụng tiền tố chung `/api/v1` (đã được cấu hình trong `application.yml`).
   - Chọn đúng phương thức HTTP (`GET`, `POST`, `PUT`, `DELETE`).

2. **Validation (Xác thực đầu vào):**
   - Luôn sử dụng `@Valid` để kích hoạt kiểm tra tính hợp lý của DTO (như `@NotNull`, `@NotBlank`, `@Size` khai báo trên DTO).
   - Nếu dữ liệu không hợp lệ, Spring sẽ tự ném ra lỗi `MethodArgumentNotValidException` và được xử lý tập trung tại Handler.

3. **Không viết Logic nghiệp vụ:**
   - Controller chỉ làm nhiệm vụ "gác cổng". Không được truy vấn DB trực tiếp hoặc tính toán logic nghiệp vụ ở đây.
   - Luôn ủy quyền xử lý cho lớp Service thông qua Dependency Injection (`@RequiredArgsConstructor` từ Lombok).

4. **Kiểu dữ liệu trả về:**
   - Sử dụng `ResponseEntity<T>` để tùy biến HTTP Status Code (ví dụ: `200 OK`, `201 Created`, `400 Bad Request`).
   - Sử dụng cấu trúc phản hồi chuẩn, kết hợp với các DTO tương ứng.
