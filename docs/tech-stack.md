# Tài liệu Công nghệ Dự án MediCore EMR

Tài liệu này đặc tả chi tiết về ngăn xếp công nghệ (Technology Stack) được áp dụng trong dự án quản lý hồ sơ y tế điện tử và đặt lịch khám **MediCore EMR** dựa trên tài liệu yêu cầu [srs.md](file:///Users/doando/Documents/medicore/MediCore_v2/docs/srs.md).

---

## 1. Tổng quan Kiến trúc (System Architecture)
Hệ thống được phát triển theo mô hình **Client-Server** kết hợp **Kiến trúc Phân lớp (Layered Architecture)** để phân tách độc lập các khối xử lý:
*   **Tầng Presentation (Frontend):** Ứng dụng Single Page Application (SPA) viết bằng Next.js (TypeScript), giao tiếp với Backend thông qua các API chuẩn RESTful và giao tiếp thời gian thực (Real-time) qua giao thức WebSocket (STOMP).
*   **Tầng Application (Backend):** RESTful Web Service xây dựng bằng Java Spring Boot (Java 21), chịu trách nhiệm xử lý nghiệp vụ lâm sàng, xác thực phân quyền và tích hợp mô hình ngôn ngữ lớn (LLM).
*   **Tầng Data & Storage (Cơ sở dữ liệu & Lưu trữ):** Sử dụng hệ quản trị cơ sở dữ liệu quan hệ PostgreSQL (lưu trữ thông tin nghiệp vụ và lưu trữ dữ liệu vector thông qua PgVector) kết hợp Object Storage (AWS S3) để lưu trữ tệp đính kèm.

---

## 2. Chi tiết Ngăn xếp Công nghệ Frontend
Cấu hình chi tiết nằm tại [package.json](file:///Users/doando/Documents/medicore/MediCore_v2/code/frontend/package.json).

### 2.1. Framework & Core
*   **Next.js 14 (React 18):** Sử dụng cơ chế App Router để quản lý định tuyến, hỗ trợ Server-side Rendering (SSR) tối ưu SEO cho trang public và Client-side Rendering (CSR) cho các Dashboard nội bộ.
*   **TypeScript:** Đảm bảo an toàn kiểu dữ liệu (Type-safety), tăng khả năng refactor và tự động gợi ý code.

### 2.2. Styling & UI Components
*   **Tailwind CSS:** Xây dựng giao diện responsive nhanh chóng thông qua các class tiện ích (Utility classes).
*   **UI Components Library (MUI hoặc Ant Design):** Sử dụng cho các thành phần giao diện phức tạp như Bảng dữ liệu (Data Table), Lịch chọn (Calendar), Biểu đồ thống kê và Hộp thoại (Modal).

### 2.3. Quản lý trạng thái & Gọi API
*   **Zustand (hoặc Redux Toolkit):** Quản lý trạng thái toàn cục gọn nhẹ (lưu trữ thông tin người dùng đăng nhập, Access Token).
*   **Axios:** Thư viện client gọi REST API, cấu hình tự động đính kèm Access Token vào Header thông qua Request Interceptors và xử lý lỗi tập trung qua Response Interceptors.

### 2.4. Giao tiếp thời gian thực & Validation
*   **STOMP / SockJS Client:** Kết nối WebSocket đến Backend phục vụ tính năng xếp hàng gọi số khám bệnh real-time.
*   **Zod & React Hook Form:** Validate dữ liệu biểu mẫu (Form validation) chặt chẽ phía Client trước khi gửi request.

### 2.5. Kiểm soát chất lượng code
*   **ESLint & Prettier:** Giữ phong cách viết code đồng nhất giữa các thành viên.
*   **Husky:** Chạy công cụ kiểm tra tự động trước khi commit để chặn code lỗi lên GitHub.

---

## 3. Chi tiết Ngăn xếp Công nghệ Backend
Cấu hình chi tiết nằm tại [pom.xml](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/pom.xml) và [application.yml](file:///Users/doando/Documents/medicore/MediCore_v2/code/backend/src/main/resources/application.yml).

### 3.1. Core Platform & Framework
*   **Java 21 (LTS):** Tận dụng các tính năng mới như Virtual Threads, Record Patterns, Pattern Matching...
*   **Spring Boot 3.3.4:** Bộ khung chính để xây dựng ứng dụng web ổn định và bảo mật cao.

### 3.2. Web & APIs
*   **Spring Web (Spring MVC):** Xây dựng các Endpoint REST API.
*   **Jakarta Validation (Hibernate Validator):** Ràng buộc dữ liệu ở tầng DTO sử dụng `@Valid`, `@NotNull`, `@Email`... để tự động bắt lỗi và phản hồi cho Client.

### 3.3. Bảo mật & Xác thực (Security)
*   **Spring Security:** Phân quyền truy cập API theo vai trò (`ADMIN`, `DOCTOR`, `PATIENT`).
*   **JJWT (Java JWT):** Tạo, mã hóa và xác thực token JWT phục vụ đăng nhập không trạng thái (Stateless).
*   **BCryptPasswordEncoder:** Thuật toán băm mã hóa một chiều để bảo vệ mật khẩu người dùng.

### 3.4. Cơ sở dữ liệu & Truy vấn (ORM & Database Layer)
*   **Spring Data JPA (Hibernate):** Bản đồ hóa đối tượng (ORM) giúp giảm thiểu viết SQL thủ công, hỗ trợ phân trang và sắp xếp mặc định.
*   **JDBC Template:** Sử dụng khi cần viết các truy vấn phức tạp hoặc gọi trực tiếp Database Sequences để tự động sinh mã số định danh như mã bác sĩ (`DOC-`) hay mã bệnh nhân (`PAT-`).
*   **Flyway / Liquibase:** Công cụ tự động chạy các script migration để đồng bộ cấu trúc cơ sở dữ liệu trên mọi môi trường phát triển.

### 3.5. Dịch vụ Email & Tài liệu
*   **Spring Boot Starter Mail:** Giao tiếp qua giao thức SMTP để gửi thư điện tử.
*   **Thymeleaf:** Động hóa các mẫu HTML Template gửi cho người dùng (OTP đăng ký, Xác nhận lịch đặt khám, Đơn thuốc PDF).
*   **iText / OpenPDF:** Thư viện Java hỗ trợ kết xuất (render) đơn thuốc hoặc hồ sơ khám chữa bệnh ra tệp tin định dạng PDF để tải xuống hoặc in ấn.

### 3.6. Trí tuệ Nhân tạo (AI Integration)
*   **Spring AI (hoặc LangChain4j):** Framework điều phối luồng làm việc với LLMs, quản lý Prompt Template, cấu hình lịch sử hội thoại (Chat Memory).
*   **WebClient (Spring WebFlux):** Hỗ trợ gọi API bất đồng bộ (Non-blocking) đến Google Gemini API hoặc OpenAI API.

### 3.7. Công cụ bổ trợ
*   **Lombok:** Tự động sinh Getter, Setter, Constructor, Builder thông qua Annotations.
*   **MapStruct:** Ánh xạ tự động, hiệu năng cao giữa Entity sang DTO và ngược lại.
*   **Springdoc OpenAPI (Swagger UI):** Tự động sinh tài liệu mô tả API tại đường dẫn `/swagger-ui.html`.

---

## 4. Hệ quản trị dữ liệu & Lưu trữ (Data & Storage)
*   **Cơ sở dữ liệu quan hệ chính:** **PostgreSQL** (Được lưu trữ trên Supabase phục vụ môi trường Dev/Staging). Lưu trữ thông tin tài khoản, bác sĩ, bệnh nhân, lịch hẹn khám, bệnh án và đơn thuốc.
*   **Tìm kiếm thông minh (Vector Store):** **PgVector** (Extension tích hợp trong PostgreSQL) dùng để lưu trữ các đoạn văn bản tri thức đã được chuyển đổi thành vector embeddings, hỗ trợ tìm kiếm ngữ nghĩa cho Trợ lý AI (RAG Chatbot).
*   **Lưu trữ tệp tin:** **AWS S3** (hoặc MinIO / Cloudinary) dùng để lưu giữ các tệp đính kèm y tế hoặc các file PDF đơn thuốc được kết xuất từ hệ thống.

---

## 5. Triển khai & DevOps
*   **Đóng gói container:** **Docker** và **Docker Compose** đảm bảo môi trường chạy backend, frontend và database đồng nhất trên máy cá nhân và server chạy thực tế.
*   **Môi trường:**
    *   `development`: Chạy local của từng thành viên.
    *   `staging`: Triển khai trên VPS kiểm thử để cả nhóm tích hợp.
    *   `production`: Triển khai sản phẩm thực tế cho người dùng cuối.
