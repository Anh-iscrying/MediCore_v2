# Subpackage: service.system

Thư mục này chứa các dịch vụ lõi của hệ thống (Sinh mã tự động, thông báo, tương tác kho lưu trữ Supabase Storage).

## 📂 Các Service
*   [IdGeneratorService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/system/IdGeneratorService.java) & [IdGeneratorServiceImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/system/IdGeneratorServiceImpl.java): Tạo mã bệnh nhân (`PAT-...`) và mã bệnh án (`EMR-...`) tự động.
*   [NotificationService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/system/NotificationService.java): Gửi thông báo thời gian thực qua WebSocket/STOMP.
*   [PatientNotificationService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/system/PatientNotificationService.java): Gửi các thông báo sự kiện cụ thể cho bệnh nhân.
*   [SupabaseStorageService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/system/SupabaseStorageService.java): Tải lên và sinh URL có thời hạn cho các file PDF bệnh án điện tử lưu trên Supabase Storage.
