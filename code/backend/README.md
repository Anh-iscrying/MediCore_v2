# MediCore Backend EMR Service

Dịch vụ Backend cho hệ thống MediCore EMR (Electronic Medical Record) được xây dựng trên nền tảng Spring Boot 3 và kết nối trực tiếp tới Live Supabase PostgreSQL DB.

---

## 🛠️ Công nghệ sử dụng
- **Language:** Java 17 (Temurin OpenJDK)
- **Framework:** Spring Boot 3.3.4
- **Database:** Supabase PostgreSQL
- **ORM:** Spring Data JPA / Hibernate 6.5
- **Security:** Spring Security (CORS enabled)
- **Build Tool:** Maven 3.9

---

## 📂 Cấu trúc dự án
Tất cả mã nguồn được tổ chức trong package `com.medicore`:

```text
src/main/java/com/medicore/
├── common/         # Chứa các lớp dùng chung (Base class, Constants, Custom exceptions)
├── config/         # Cấu hình hệ thống (Security, CORS, Data seeding)
├── controller/     # Lớp định nghĩa API Endpoints
├── dto/            # Data Transfer Objects (Request/Response models)
├── entity/         # JPA Entities map trực tiếp với Supabase DB (chia theo phân hệ)
├── repository/     # Spring Data JPA Repositories
└── service/        # Business logic (Interfaces & Implementations)
```

---

## 🚦 Quy định phát triển & Quy tắc viết code (Backend Conventions)

### 1. Đồng bộ Database Schema (Bắt buộc)
- **Tuyệt đối không sử dụng** `ddl-auto: update` hoặc `ddl-auto: create`. 
- Luôn giữ `ddl-auto: validate` để đảm bảo Hibernate đối chiếu và xác thực cấu trúc Entity trùng khớp 100% với live database Supabase.
- Khi cần cập nhật DB, thực hiện trực tiếp trên Supabase sau đó sửa tương ứng trong các Java Entity.

### 2. Thiết kế Layer
- **Controller:** Chỉ định cấu hình HTTP mapping, Validate dữ liệu đầu vào bằng `@Valid`. Không viết logic nghiệp vụ tại đây.
- **Service:** Xử lý toàn bộ logic nghiệp vụ, giao dịch (`@Transactional`), gọi repository.
- **Repository:** Chứa các truy vấn dữ liệu. Sử dụng Spring Data JPA, viết custom queries (JPQL/SQL Native) khi cần.
- **Entity:** Đại diện trực tiếp cho database schema. Tách biệt rõ ràng thực thể nào kế thừa `BaseEntity` (có đủ `created_at` và `updated_at`) và thực thể nào tự quản lý thời gian.

### 3. Quy chuẩn Dữ liệu đầu vào & đầu ra (DTO)
- Không bao giờ nhận hoặc trả về các JPA Entity trực tiếp tại Controller để tránh phơi bày cấu trúc DB hoặc dính lỗi Lazy Loading.
- Luôn sử dụng **DTO** trong package `com.medicore.dto` cho dữ liệu Request và Response.

---

## 🚀 Hướng dẫn Chạy ứng dụng

### 1. Cấu hình môi trường
Tạo file `.env` tại thư mục `/code/backend/` với các thông tin kết nối Supabase của bạn:
```properties
DB_URL=jdbc:postgresql://<supabase-host>:5432/postgres
DB_USERNAME=postgres
DB_PASSWORD=<your-supabase-password>
JWT_SECRET=<your-jwt-secret>
```

### 2. Biên dịch dự án
Sử dụng Java 17 đã cài trên máy để build:
```bash
JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home mvn clean compile
```

### 3. Kiểm tra kết nối Database & Unit Test
Chạy test để xác thực cấu trúc các entity so với database:
```bash
JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home mvn clean test
```

### 4. Chạy ứng dụng ở chế độ Development
Khởi động ứng dụng trên cổng `8080` mặc định:
```bash
JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home mvn spring-boot:run
```

---
*Xem tài liệu chi tiết của từng thư mục tại README ở mỗi thư mục con.*
