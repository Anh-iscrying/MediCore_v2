# Package: controller

Thư mục này chịu trách nhiệm tiếp nhận và định tuyến các yêu cầu HTTP từ phía client (Frontend/Mobile), kiểm tra tính hợp lệ của dữ liệu đầu vào và chuyển tiếp công việc đến tầng Service.

---

## 📂 Các Controller hiện tại
- [AuthController.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/controller/AuthController.java): Quản lý các endpoint liên quan đến xác thực người dùng.

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
