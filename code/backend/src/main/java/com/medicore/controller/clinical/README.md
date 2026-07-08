# Subpackage: controller.clinical

Thư mục này chịu trách nhiệm quản lý toàn bộ quy trình khám chữa bệnh, lịch hẹn, bệnh án, danh mục bệnh lý, thuốc và mẫu phác đồ.

## 📂 Các Controller
*   [AppointmentController.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/controller/clinical/AppointmentController.java): Quản lý đăng ký, xếp lịch và cập nhật trạng thái lịch hẹn khám.
*   [MedicalRecordController.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/controller/clinical/MedicalRecordController.java): Tạo hồ sơ bệnh án điện tử (EMR), quản lý đơn thuốc, và xuất file PDF bệnh án.
*   [TreatmentTemplateController.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/controller/clinical/TreatmentTemplateController.java): Quản lý các mẫu phác đồ điều trị có sẵn phục vụ kê đơn nhanh.
*   [DiseaseController.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/controller/clinical/DiseaseController.java): Quản trị và tra cứu danh mục bệnh lý ICD-10.
*   [MedicineController.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/controller/clinical/MedicineController.java): Quản trị và tra cứu danh mục thuốc.
*   [ImportController.java](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/java/com/medicore/controller/clinical/ImportController.java): Endpoint hỗ trợ import danh mục thuốc và bệnh lý từ file Excel.
