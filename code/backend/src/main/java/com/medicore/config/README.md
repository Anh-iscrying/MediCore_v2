# Package: config

Thư mục này chứa các cấu hình hệ thống của ứng dụng Spring Boot, bao gồm phân quyền bảo mật (Security), cấu hình CORS và nạp dữ liệu ban đầu (Data Seeding).

---

## 📂 Các tệp cấu hình chính

### 1. [SecurityConfig.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/config/SecurityConfig.java)
- Thiết lập bộ lọc bảo mật (Security Filter Chain) bằng Spring Security.
- Cấu hình CORS để cho phép Frontend chạy ở `http://localhost:3000` (hoặc domain khác cấu hình qua biến môi trường) gọi API.
- Cấu hình mở các đường dẫn API public (như Swagger UI `/swagger-ui/**`, `/api-docs/**`) và kiểm soát phân quyền dựa trên `UserRole` ở các endpoint còn lại.

### 2. [DataSeeder.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/config/DataSeeder.java)
- Lớp này chạy tự động sau khi Spring Boot khởi tạo thành công (thông qua interface `CommandLineRunner`).
- Chức năng: Kiểm tra dữ liệu mẫu trong DB, nếu bảng chuyên khoa (`specialties`) trống, nó sẽ tự động thêm các chuyên khoa mẫu mặc định (Nội khoa, Ngoại khoa, Tim mạch, Da liễu, Tai Mũi Họng, Nhi khoa).

---

## 🛠️ Quy tắc viết code ở config
- **Biến môi trường:** Các thông số nhạy cảm hoặc có khả năng thay đổi giữa các môi trường (như URL CORS, khóa JWT secret) phải được tải thông qua cấu hình `${TEN_BIEN}` trong file `application.yml` chứ không được hardcode trực tiếp vào code Java.
- **Dữ liệu mồi (Data Seeder):** Chỉ sử dụng seeder cho các bảng danh mục tĩnh (catalog tables), không lạm dụng seeder để chèn dữ liệu giao dịch phức tạp của người dùng.
