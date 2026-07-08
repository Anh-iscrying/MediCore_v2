# Subpackage: config.security

Thư mục này chứa các cấu hình liên quan đến bảo mật hệ thống, cấu hình phân quyền API và các bộ lọc bảo mật.

## 📂 Các lớp cấu hình
*   [SecurityConfig.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/config/security/SecurityConfig.java): Thiết lập bộ lọc bảo mật (Security Filter Chain), cấu hình CORS, mã hóa mật khẩu, và kiểm soát quyền truy cập API.
*   [JwtAuthenticationFilter.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/config/security/JwtAuthenticationFilter.java): Bộ lọc kiểm tra JWT token từ HTTP header hoặc cookie để xác thực người dùng.
*   [JwtTokenProvider.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/config/security/JwtTokenProvider.java): Sinh và kiểm tra JWT token (sử dụng giải thuật mã hóa HMAC-SHA256).
