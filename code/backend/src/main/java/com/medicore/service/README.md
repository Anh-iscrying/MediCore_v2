# Package: service

Thư mục này chứa tầng xử lý logic nghiệp vụ chính (Business Logic Layer) của ứng dụng. Tầng Service đứng giữa Controller và Repository, chịu trách nhiệm điều phối các hoạt động dữ liệu, kiểm tra luật nghiệp vụ và quản lý giao dịch (Transactions).

Để đảm bảo tính tổ chức và dễ bảo trì, thư mục đã được tái cấu trúc thành các thư mục con chuyên biệt theo từng phân hệ chức năng:

---

## 📂 Cấu trúc thư mục con

### 1. `auth`
Quản lý các logic nghiệp vụ liên quan đến xác thực người dùng, gửi email và mã xác thực OTP.
*   [EmailService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/auth/EmailService.java) & [EmailServiceImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/auth/EmailServiceImpl.java): Xử lý gửi email kích hoạt, thông báo và hỗ trợ SMTP.
*   [EmailOtpService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/auth/EmailOtpService.java) & [EmailOtpServiceImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/auth/EmailOtpServiceImpl.java): Quản lý tạo, gửi và xác thực mã OTP.

### 2. `ai`
Tập hợp các dịch vụ xử lý ngôn ngữ tự nhiên, tích hợp Gateway AI, lấy ngữ cảnh và lên kế hoạch lộ trình khám tự động.
*   [AiChatService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/ai/AiChatService.java) & [AiChatServiceImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/ai/AiChatServiceImpl.java): Xử lý tin nhắn của bệnh nhân với chatbot AI.
*   [DoctorAiChatService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/ai/DoctorAiChatService.java) & [DoctorAiChatServiceImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/ai/DoctorAiChatServiceImpl.java): Xử lý tin nhắn của bác sĩ với trợ lý AI.
*   [DoctorAiAccessService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/ai/DoctorAiAccessService.java) & [DoctorAiAccessServiceImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/ai/DoctorAiAccessServiceImpl.java): Kiểm tra quyền truy cập dữ liệu của bác sĩ trước khi đưa vào ngữ cảnh AI.
*   [DoctorAiContextService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/ai/DoctorAiContextService.java) & [DoctorAiContextServiceImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/ai/DoctorAiContextServiceImpl.java): Tổng hợp thông tin bệnh án, bệnh nhân để cung cấp ngữ cảnh cho AI của bác sĩ.
*   [PatientAiContextService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/ai/PatientAiContextService.java) & [PatientAiContextServiceImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/ai/PatientAiContextServiceImpl.java): Tổng hợp thông tin bệnh án để cung cấp ngữ cảnh cho AI của bệnh nhân.
*   [DoctorAiRoutePlanner.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/ai/DoctorAiRoutePlanner.java) & [DoctorAiRoutePlannerImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/ai/DoctorAiRoutePlannerImpl.java): Phân tích ý định để điều hướng trang chức năng phù hợp cho bác sĩ.
*   [PatientAiRoutePlanner.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/ai/PatientAiRoutePlanner.java) & [PatientAiRoutePlannerImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/ai/PatientAiRoutePlannerImpl.java): Phân tích ý định để điều hướng trang chức năng phù hợp cho bệnh nhân.
*   [DoctorAiContextExecutor.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/ai/DoctorAiContextExecutor.java) & [DoctorAiContextExecutorImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/ai/DoctorAiContextExecutorImpl.java): Thực thi gọi AI API để tạo nội dung trả lời (bao gồm reasoning) cho bác sĩ.
*   [PatientAiContextExecutor.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/ai/PatientAiContextExecutor.java) & [PatientAiContextExecutorImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/ai/PatientAiContextExecutorImpl.java): Thực thi gọi AI API để tạo nội dung trả lời cho bệnh nhân.
*   [AiGatewayClient.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/ai/AiGatewayClient.java): HTTP Client kết nối tới Gateway AI để gửi request sinh văn bản.

### 3. `clinical`
Xử lý các nghiệp vụ cốt lõi về quy trình khám lâm sàng, hồ sơ bệnh án, lịch khám, kê đơn thuốc và phác đồ điều trị.
*   [AppointmentService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/clinical/AppointmentService.java) & [AppointmentServiceImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/clinical/AppointmentServiceImpl.java): Xử lý đặt lịch, duyệt lịch, hủy lịch và kiểm tra ràng buộc lịch khám.
*   [MedicalRecordService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/clinical/MedicalRecordService.java) & [MedicalRecordServiceImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/clinical/MedicalRecordServiceImpl.java): Khởi tạo, cập nhật bệnh án (EMR), lưu thông tin đơn thuốc.
*   [TreatmentTemplateService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/clinical/TreatmentTemplateService.java) & [TreatmentTemplateServiceImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/clinical/TreatmentTemplateServiceImpl.java): Quản lý phác đồ điều trị mẫu giúp bác sĩ kê đơn nhanh.
*   [DiseaseService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/clinical/DiseaseService.java) & [DiseaseServiceImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/clinical/DiseaseServiceImpl.java): Tra cứu danh mục bệnh lý ICD-10.
*   [MedicineService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/clinical/MedicineService.java) & [MedicineServiceImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/clinical/MedicineServiceImpl.java): Tra cứu danh mục thuốc.
*   [ExcelImportService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/clinical/ExcelImportService.java): Import danh mục thuốc và bệnh lý từ file Excel.
*   [MedicalRecordPdfService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/clinical/MedicalRecordPdfService.java): Xuất file PDF bệnh án điện tử và đơn thuốc.

### 4. `user`
Quản lý thông tin tài khoản, hồ sơ cá nhân của Bác sĩ, Bệnh nhân và Chuyên khoa.
*   [UserService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/user/UserService.java) & [UserServiceImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/user/UserServiceImpl.java): Quản lý tài khoản người dùng chung.
*   [DoctorService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/user/DoctorService.java) & [DoctorServiceImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/user/DoctorServiceImpl.java): Nghiệp vụ cập nhật thông tin, lọc danh sách bác sĩ.
*   [PatientService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/user/PatientService.java) & [PatientServiceImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/user/PatientServiceImpl.java): Xử lý hồ sơ bệnh nhân.
*   [SpecialtyService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/user/SpecialtyService.java) & [SpecialtyServiceImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/user/SpecialtyServiceImpl.java): Xem thông tin chuyên khoa bác sĩ.

### 5. `system`
Các dịch vụ lõi của hệ thống (Sinh mã tự động, thông báo, tương tác kho lưu trữ Supabase).
*   [IdGeneratorService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/system/IdGeneratorService.java) & [IdGeneratorServiceImpl.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/system/IdGeneratorServiceImpl.java): Tạo mã bệnh nhân (`PAT-...`) và mã bệnh án (`EMR-...`) tự động.
*   [NotificationService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/system/NotificationService.java): Gửi thông báo thời gian thực qua WebSocket/STOMP.
*   [PatientNotificationService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/system/PatientNotificationService.java): Gửi các thông báo sự kiện cụ thể cho bệnh nhân.
*   [SupabaseStorageService.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/service/system/SupabaseStorageService.java): Tải lên và sinh URL có thời hạn cho các file PDF bệnh án điện tử lưu trên Supabase Storage.

---

## 🛠️ Quy tắc viết code ở service
1. **Khai báo `@Service`:**
   - Các lớp hiện thực trong thư mục con bắt buộc phải được đánh dấu bằng `@Service` để Spring có thể quét và đăng ký Bean tự động.
2. **Quản lý Giao dịch (`@Transactional`):**
   - Đánh dấu `@Transactional` ở cấp độ phương thức hoặc cấp lớp đối với tất cả các thao tác thay đổi dữ liệu (thêm, sửa, xóa) liên quan đến nhiều bảng.
   - Sử dụng `@Transactional(readOnly = true)` đối với các dịch vụ chỉ thực hiện truy vấn để tối ưu hóa hiệu năng đọc của Hibernate.
3. **Dependency Injection:**
   - Luôn sử dụng cơ chế constructor injection của Spring thông qua `@RequiredArgsConstructor` từ Lombok để tiêm các Repository hoặc Service con khác. Không sử dụng `@Autowired` trực tiếp lên thuộc tính.
4. **Xử lý lỗi nghiệp vụ:**
   - Hãy chủ động ném `CustomBusinessException` với một mã lỗi tương ứng từ `ErrorCodes` để tầng Controller xử lý.
