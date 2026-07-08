# Subpackage: config.properties

Thư mục này chứa các lớp cấu hình thuộc tính được ánh xạ trực tiếp từ file cấu hình hệ thống (`application.yml` hoặc `application.properties`) thông qua cơ chế `@ConfigurationProperties` của Spring Boot.

## 📂 Các file cấu hình
*   [AiProperties.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/config/properties/AiProperties.java): Chứa cấu hình kết nối và tham số mô hình AI (Base URL, API Key, Model, Temperature, Max Tokens, v.v.).
*   [AppointmentRulesProperties.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/config/properties/AppointmentRulesProperties.java): Cấu hình các quy tắc đặt lịch khám (Thời gian tối thiểu trước khi đặt/hủy, số lượng lịch hẹn tối đa của mỗi bệnh nhân).
*   [SupabaseStorageProperties.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/config/properties/SupabaseStorageProperties.java): Cấu hình kết nối tới kho lưu trữ Supabase Storage (URL, API Key, Bucket lưu trữ hồ sơ bệnh án).
