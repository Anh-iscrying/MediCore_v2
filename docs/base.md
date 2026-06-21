# Source Tổng

MediCore-Project/
├── docs/                           # Kho lưu trữ tài liệu tri thức 
│   ├── srs.md                      # Đặc tả chi tiết tính năng, actor và nghiệp vụ y tế
│   ├── tech-stack.md               # Chi tiết về công nghệ sử dụng 
│   ├── convention.md               # Quy tắc code
│   ├── database/                   
│   │   ├── erd_diagram.png         # Sơ đồ quan hệ thực thể
│   │   └── init_script.sql         # Script khởi tạo 10 bảng Database chuẩn
│   ├── backlogs/                   # Chứa backlog
│   │   ├── sprint1-foundation.md   # Setup, Auth, DB, Patient-ID
│   │   ├── sprint2-booking.md      # Quy trình đặt lịch, Admin quản lý danh mục
│   │   ├── sprint3-clinical.md     # Màn hình khám, EMR-ID, Kê đơn, WebSocket
│   │   └── sprint4-ai-reports.md   # Tích hợp AI, Xuất PDF, Thống kê biểu đồ
│   └── ui-ux-guideline/            # Quy tắc thiết kế FE
│       ├── theme-config.json       # Cấu hình màu sắc 
│       └── components-mockup/      # Các bản vẽ tay hoặc screenshot giao diện mẫu
│
├── code/                           # Mã nguồn thực thi của dự án
│   ├── medicore-frontend/          
│   │   ├── src/assets/             # Hình ảnh, icon y tế
│   │   ├── src/components/         # Các thành phần UI tái sử dụng
│   │   └── src/pages/              # Patient Portal, Doctor Dashboard, Admin Panel
│   └── medicore-backend/           
│       ├── src/main/java/          # Logic nghiệp vụ theo Layered Architecture
│       └── src/main/resources/     # File cấu hình application.properties, Prompt AI
│
├── .agent/                         # Bộ não điều khiển dành cho AI Assistant
│   ├── rules.json                  # Các quy tắc code AI không được vi phạm
│   ├── workflows/                  # Quy trình xử lý dữ liệu nhạy cảm (EMR) của AI
│   └── prompt-templates/           # Các mẫu Prompt cho tính năng MC-12 và MC-13
│
├── test/                           # Kiểm thử và đảm bảo chất lượng
│   ├── unit-tests/                 # Test logic sinh mã PAT-ID, EMR-ID, check trùng lịch
│   ├── integration-tests/          # Test luồng kết nối API và WebSocket
│   └── test-cases-manual.xlsx      # Bảng kịch bản test nghiệp vụ cho người dùng
│
├── .gitignore                      # Khai báo các file không đưa lên GitHub
└── README.md                       # Hướng dẫn cài đặt và chạy dự án (Quick Start)

# Frontend
frontend/
├── .husky/                 # Script chặn commit lỗi (ESLint, TypeScript check)
├── public/                 # Tài nguyên tĩnh: logo-clinic.png, icons, favicons
├── src/
│   ├── assets/             # Ảnh minh họa bác sĩ, SVG y tế (đi qua build)
│   ├── app/                # NEXT.JS APP ROUTER (Trái tim của hệ thống)
│   │   ├── (auth)/         # Group route cho Đăng ký/Đăng nhập
│   │   │   ├── login/      # page.tsx cho trang đăng nhập
│   │   │   └── register/   # page.tsx cho trang đăng ký
│   │   ├── (dashboard)/    # Group route cho khu vực quản trị (Yêu cầu Login)
│   │   │   ├── patient/    # Luồng Bệnh nhân: /patient/booking, /patient/history
│   │   │   ├── doctor/     # Luồng Bác sĩ: /doctor/queue, /doctor/examine
│   │   │   ├── admin/      # Luồng Quản trị: /admin/doctors, /admin/report
│   │   │   └── layout.tsx  # Sidebar & Header dùng chung cho Dashboard
│   │   ├── globals.css     # Cấu hình Tailwind CSS toàn cục
│   │   └── layout.tsx      # Root Layout (Bao bọc Providers)
│   ├── components/         # Các thành phần giao diện
│   │   ├── base/           # BaseButton, BaseTable, BaseModal (Custom từ MUI/AntD)
│   │   └── features/       # Thành phần nghiệp vụ: BookingForm, EMRCard, PrescriptionPDF
│   ├── lib/                # Cấu hình thư viện
│   │   ├── axios.ts        # Axios instance kết nối FastAPI
│   │   └── socket.ts       # Cấu hình WebSocket Client (STOMP)
│   ├── hooks/              # Custom Hooks: useAuth, useWebSocket, useEMR
│   ├── store/              # Quản lý State: Zustand hoặc Redux (Lưu User, Token)
│   ├── services/           # Gọi API đến Backend Python
│   │   ├── auth.service.ts
│   │   ├── appointment.service.ts
│   │   └── medical-record.service.ts
│   ├── providers/          # React Providers (AuthContext, ThemeProvider)
│   ├── schemas/            # Validation dữ liệu (Dùng Zod cho Login/Booking Form)
│   ├── types/              # Định nghĩa TypeScript: Patient, Doctor, EMR_Record
│   ├── utils/              # Hàm dùng chung: formatCurrency, formatDate
│   └── constants/          # Hằng số: TIME_SLOTS, ROLES, ICD10_LIST
├── eslint.config.mjs       # Linter khắt khe (chặn unused imports, magic numbers)
├── .prettierrc             # Format code chuẩn cho 4 thành viên
├── tailwind.config.ts      # Ghi đè mã màu y tế (Blue/Teal)
├── tsconfig.json           # Cấu hình TypeScript (Strict Mode)
├── next.config.mjs         # Cấu hình Next.js
├── .env                    # NEXT_PUBLIC_API_URL=http://localhost:8000
└── package.json 


# Backend
backend/
├── src/main/java/com/medicore/
│   ├── Application.java         	# Điểm khởi động ứng dụng (Main Entry Point)
│   │
│   ├── config/                  	# TẦNG CẤU HÌNH (System Configuration)
│   │   ├── SecurityConfig.java  	# Cấu hình Spring Security, Phân quyền & JWT
│   │   ├── WebSocketConfig.java 	# Cấu hình thông báo thời gian thực (MC-07)
│   │   ├── DatabaseConfig.java  	# Cấu hình kết nối PostgreSQL/Supabase
│   │   └── OpenApiConfig.java   	# Cấu hình tài liệu API (Swagger/OpenAPI UI)
│   │
│   ├── common/                  	# THÀNH PHẦN DÙNG CHUNG (Shared Components)
│   │   ├── base/                	# Các lớp nền tảng (Base Classes)
│   │   │   ├── BaseEntity.java  	# Chứa id, createdAt, updatedAt (@MappedSuperclass)
│   │   │   ├── BaseService.java 	# Interface CRUD Generics
│   │   │   └── BaseServiceImpl.java # Triển khai CRUD dùng chung
│   │   ├── constants/           	# Định nghĩa hằng số hệ thống
│   │   │   └── AppConstants.java	# Regex, ErrorCodes, System Roles
│   │   ├── exception/           	# Xử lý lỗi tập trung
│   │   │   ├── GlobalExceptionHandler.java # Bắt lỗi toàn hệ thống (@ControllerAdvice)
│   │   │   └── CustomBusinessException.java# Lỗi nghiệp vụ riêng của MediCore
│   │   └── utils/               	# Các hàm tiện ích (Helper Classes)
│   │   	├── JwtUtils.java    	# Xử lý tạo/giải mã Token
│   │   	├── DateUtils.java   	# Định dạng ngày tháng y tế
│   │   	└── CodeGenerator.java   # Thuật toán sinh PAT-ID, EMR-ID tự động (MC-15)
│   │
│   ├── controller/              	# TẦNG GIAO TIẾP (API Endpoints)
│   │   ├── AuthController.java  	# Đăng nhập, Đăng ký, Đổi mật khẩu (MC-03)
│   │   ├── AdminController.java 	# Quản lý người dùng & Hệ thống (MC-04, MC-05)
│   │   ├── AppointmentController.java # Quản lý lịch hẹn khám (MC-06)
│   │   ├── MedicalRecordController.java # Quản lý hồ sơ bệnh án EMR (MC-09, MC-13)
│   │   └── AIController.java    	# Endpoint tích hợp hỗ trợ từ AI
│   │
│   ├── dto/                     	# TẦNG CHUYỂN ĐỔI DỮ LIỆU (Data Transfer Object)
│   │   ├── request/             	# Dữ liệu từ Frontend gửi lên (Validation tại đây)
│   │   │   ├── LoginRequest.java
│   │   │   └── CreatePatientReq.java
│   │   └── response/            	# Cấu trúc dữ liệu trả về cho Frontend
│   │   	├── LoginResponse.java
│   │   	└── PatientDetailRes.java
│   │
│   ├── entity/                  	# TẦNG DỮ LIỆU (JPA Entities)
│   │   ├── User.java            	# Thông tin tài khoản
│   │   ├── Patient.java         	# Thông tin bệnh nhân
│   │   ├── Doctor.java          	# Thông tin bác sĩ/chuyên khoa
│   │   ├── Appointment.java     	# Thông tin lịch hẹn
│   │   └── MedicalRecord.java   	# Nội dung hồ sơ bệnh án chi tiết
│   │
│   ├── repository/              	# TẦNG TRUY VẤN (Data Access Layer)
│   │   ├── UserRepository.java  	# Thao tác bảng users
│   │   ├── PatientRepository.java   # Thao tác bảng patients
│   │   ├── AppointmentRepo.java 	# Thao tác bảng appointments
│   │   └── custom/              	# Nơi chứa các truy vấn phức tạp (QueryDSL/Native SQL)
│   │   	├── AppointmentRepoCustom.java
│   │   	└── AppointmentRepoImpl.java
│   │
│   └── service/                 	# TẦNG NGHIỆP VỤ (Business Logic Layer)
│       ├── interfaces/          	# Định nghĩa các hành động (Abstractions)
│       │   ├── AuthService.java
│       │   ├── AIService.java   	# Logic tích hợp LangChain4j/Spring AI
│       │   └── PdfService.java  	# Xuất hóa đơn/đơn thuốc PDF
│       └── impl/                	# Triển khai chi tiết nghiệp vụ (Implementation)
│           ├── AuthServiceImpl.java
│           ├── AppointmentServiceImpl.java
│           └── MedicalRecordServiceImpl.java
│
├── src/main/resources/          	# TÀI NGUYÊN HỆ THỐNG
│   ├── application.yml          	# Cấu hình chính (DB, Port, JWT Secret, AI Key)
│   ├── db/migration/            	# Quản lý phiên bản DB (Flyway/V1__Init.sql)
│   └── text/                    	# Chứa Email Template, ResourceBundle (i18n)
│
├── src/test/java/com/medicore/  	# TẦNG KIỂM THỬ (Unit & Integration Tests)
├── pom.xml                      	# Quản lý Dependency & Build (Maven)
├── Dockerfile                   	# Cấu hình đóng gói ứng dụng (Containerization)
└── .env                         	# Lưu trữ biến môi trường bảo mật (Local)
