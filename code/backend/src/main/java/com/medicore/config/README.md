# Package: config

Thư mục này chứa các cấu hình hệ thống của ứng dụng Spring Boot. Để đảm bảo tính tổ chức và dễ bảo trì, thư mục đã được tái cấu trúc thành các thư mục con chuyên biệt:

---

## 📂 Cấu trúc thư mục con

### 1. `properties`
Chứa các lớp cấu hình ánh xạ trực tiếp từ file thuộc tính (`application.yml` hoặc `application.properties`) thông qua `@ConfigurationProperties`.
*   [AiProperties.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/config/properties/AiProperties.java): Cấu hình tham số tích hợp AI (Base URL, API Key, Model, timeout, temperature, v.v.).
*   [AppointmentRulesProperties.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/config/properties/AppointmentRulesProperties.java): Quy tắc đặt và hủy lịch khám.
*   [SupabaseStorageProperties.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/config/properties/SupabaseStorageProperties.java): Cấu hình kết nối tới kho lưu trữ Supabase Storage (URL, API Key, bucket, v.v.).

### 2. `security`
Chứa các cấu hình bảo mật hệ thống, cấu hình phân quyền API và các bộ lọc bảo mật.
*   [SecurityConfig.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/config/security/SecurityConfig.java): Thiết lập bộ lọc bảo mật (Security Filter Chain), cấu hình CORS, mã hóa mật khẩu, và kiểm soát quyền truy cập API.
*   [JwtAuthenticationFilter.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/config/security/JwtAuthenticationFilter.java): Bộ lọc kiểm tra JWT token từ HTTP header hoặc cookie để xác thực người dùng.
*   [JwtTokenProvider.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/config/security/JwtTokenProvider.java): Sinh và kiểm tra JWT token (sử dụng giải thuật mã hóa HMAC-SHA256).

### 3. `websocket`
Chứa cấu hình liên quan đến giao thức thời gian thực WebSocket.
*   [WebSocketConfig.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/config/websocket/WebSocketConfig.java): Đăng ký WebSocket endpoint `/ws`, kích hoạt message broker (`/topic`, `/queue`, `/user`), tích hợp xác thực JWT khi kết nối WebSocket.

### 4. `task`
Chứa các tác vụ chạy ngầm định kỳ hoặc các scheduled tasks.
*   [SequenceResetTask.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/config/task/SequenceResetTask.java): Reset máy đếm EMR code hằng ngày vào lúc 00:00:00 qua annotation `@Scheduled`.

### 5. `seeder`
Chứa logic khởi tạo và nạp dữ liệu mồi (seed data) ban đầu cho hệ thống.
*   [DataSeeder.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/config/seeder/DataSeeder.java): Tự động kiểm tra bảng danh mục, tạo index, tạo tài khoản admin mẫu và chèn các chuyên khoa mặc định khi ứng dụng khởi động thành công (`CommandLineRunner`).

---

## 🛠️ Quy tắc viết code ở config
*   **Biến môi trường:** Các thông số nhạy cảm hoặc có khả năng thay đổi giữa các môi trường phải được tải thông qua cấu hình `${TEN_BIEN}` trong file `application.yml` chứ không được hardcode trực tiếp vào code Java.
*   **Quét Component và Properties:** Nhờ vào các annotation `@SpringBootApplication` và `@ConfigurationPropertiesScan` ở lớp main (`MediCoreApplication`), tất cả các bean cấu hình và properties nằm trong các subpackages mới này sẽ tự động được Spring Boot quét và đăng ký thành công.
