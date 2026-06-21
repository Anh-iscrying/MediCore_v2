# Quy tắc phát triển mã nguồn (Coding Conventions) - Dự án MediCore

Tài liệu này định nghĩa các tiêu chuẩn viết code, quy tắc đặt tên, cấu trúc Git và quy trình phát triển nhằm đảm bảo tính đồng nhất, hiệu quả và chất lượng mã nguồn của Dự án MediCore (Next.js & Spring Boot).

---

## 1. Quy tắc đặt tên (Naming Conventions)

### 1.1. Biến, Hằng số, Hàm & Lớp
- **Frontend (Next.js - TypeScript)**:
  - **Biến & Hàm**: Sử dụng `camelCase`.
    * Ví dụ: `const patientId = "PAT-2026-0001";`, `function getAppointmentDetails() { ... }`
  - **Component & Class**: Sử dụng `PascalCase`.
    * Ví dụ: `const BookingForm = () => { ... }`, `class CustomAuthError extends Error { ... }`
  - **Hằng số (Constants)**: Sử dụng `UPPER_SNAKE_CASE`.
    * Ví dụ: `const DEFAULT_TIME_SLOT = "08:00 - 08:30";`
  - **Kiểu dữ liệu (Types/Interfaces)**: Sử dụng `PascalCase`.
    * Ví dụ: `interface PatientProfileProps { ... }`

- **Backend (Spring Boot - Java)**: 
  - **Biến & Phương thức (Methods)**: Sử dụng camelCase. 
    - Ví dụ: private String patientCode;, public MedicalRecord getMedicalRecord() { ... } 
  - **Class, Interface, Enum**: Sử dụng PascalCase. 
    - Ví dụ: User, MedicalRecord, AppointmentService, UserRole 
  - **Hằng số (Constants)**: Sử dụng UPPER\_SNAKE\_CASE. 
    - Ví dụ: DEFAULT\_ROLE, JWT\_SECRET\_KEY 
  - **Package**: Viết thường toàn bộ theo domain. 
    - Ví dụ:\
      com.medicore.controller\
      com.medicore.service\
      com.medicore.repository\
      com.medicore.entity 

### 1.2. Thư mục & Tệp tin (Files & Directories)
- **Frontend (Next.js)**:
  - Tên thư mục routing của App Router: Viết thường, phân tách bằng dấu gạch ngang (nếu cần) hoặc Next.js dynamic routing.
    * Ví dụ: `app/patient/booking/`, `app/(auth)/login/`, `app/patient/encounter/[id]/`
  - Tên component và file tiện ích: Sử dụng `camelCase` hoặc `kebab-case` cho file helper, `PascalCase` cho file components.
    * Ví dụ: `components/features/BookingForm.tsx`, `hooks/useWebSocket.ts`, `utils/format-date.ts`
- **Backend (Spring Boot)**: 
  - Package: lowercase 
    - com.medicore.controller 
  - File Java phải trùng tên class 
    - AuthController.java 
    - PatientRepository.java 
  - Không dùng snake\_case, kebab-case, hoặc dấu cách 

---

## 2. Quy tắc Cơ sở dữ liệu (PostgreSQL Database Conventions)

- **Tên bảng**: Luôn viết thường, dạng số nhiều và sử dụng `snake_case`.
  * Ví dụ: `users`, `patients`, `medical_records`, `prescriptions`.
- **Tên cột**: Viết thường, `snake_case`.
  * Ví dụ: `patient_code`, `appointment_date`, `created_at`.
- **Khóa chính**: Đặt tên là `id` (Auto-increment INT/BIGINT hoặc UUID).
- **Khóa ngoại**: Tên thực thể số ít kết hợp với `_id` hoặc tên trường định danh liên kết.
  * Ví dụ: `user_id` liên kết với bảng `users`, `patient_id` liên kết với trường `patient_code` của bảng `patients`.

---

## 3. Quy tắc Git & Commit

### 3.1. Git Branching Model
Chúng ta áp dụng mô hình Git Flow rút gọn:
- `main`: Nhánh chạy production ổn định.
- `develop`: Nhánh tích hợp chính phục vụ kiểm thử (Staging).
- `feature/[mã-task]-[tên-task]`: Nhánh phát triển tính năng mới.
  * Ví dụ: `feature/MC-03-jwt-auth`, `feature/MC-06-patient-booking`
- `bugfix/[mã-task]-[tên-lỗi]`: Nhánh sửa lỗi phát sinh khi test.
  * Ví dụ: `bugfix/MC-08-realtime-queue-delay`
- `hotfix/[tên-lỗi]`: Nhánh sửa lỗi khẩn cấp trực tiếp trên production.

### 3.2. Commit Message Format
Định dạng tin nhắn commit bắt buộc phải kèm mã Backlog (`MC-XX`):
`[Loại] [Mã-Backlog] Mô tả ngắn gọn tính năng/sửa đổi`

Các loại commit (`type`) hợp lệ:
- `feat`: Tính năng mới (Feature)
- `fix`: Sửa lỗi (Bug fix)
- `docs`: Cập nhật tài liệu (Documentation)
- `style`: Định dạng code (không ảnh hưởng logic: khoảng trắng, dấu `;`...)
- `refactor`: Tái cấu trúc mã nguồn (Refactor)
- `test`: Thêm hoặc sửa đổi các bộ test
- `chore`: Các tác vụ cấu hình hệ thống, cài thư viện...

Ví dụ commit hợp lệ:
- `[feat] [MC-03] Thiết kế giao diện Form Đăng ký và validate số điện thoại`
- `[fix] [MC-08] Sửa lỗi WebSocket mất kết nối khi chuyển trang Dashboard`
- `[docs] [MC-01] Cập nhật hình ảnh sơ đồ ERD mới nhất vào README`

### 3.3. Quy trình làm việc với Git cho lập trình viên (Developer Git Workflow)

Để đảm bảo dự án chạy trơn tru và không bị đè code lẫn nhau, tất cả các thành viên phải tuân thủ nghiêm ngặt quy trình 5 bước sau:

#### Bước 1: Đồng bộ mã nguồn mới nhất từ nhóm
Trước khi bắt đầu code bất kỳ tính năng nào, bạn phải lấy code mới nhất từ nhánh `develop` về máy:
```bash
# Chuyển về nhánh develop
git checkout develop

# Kéo code mới nhất từ GitHub về máy
git pull origin develop
```

#### Bước 2: Tạo nhánh tính năng (Feature branch) mới
Luôn tạo nhánh mới từ nhánh `develop` sạch và đặt tên nhánh theo chuẩn `feature/[mã-task]-[tên-tính-năng]`:
```bash
# Tạo và chuyển sang nhánh mới
git checkout -b feature/MC-03-auth
```

#### Bước 3: Code và Commit cục bộ
Viết code cho tính năng được giao. Thực hiện commit thường xuyên trên máy cá nhân theo đúng định dạng message chuẩn:
```bash
# Lưu trữ các file đã chỉnh sửa vào staging area
git add .

# Commit kèm thông điệp chuẩn (có mã backlog)
git commit -m "[feat] [MC-03] Thiết kế màn hình đăng nhập Next.js"
```

#### Bước 4: Đẩy nhánh lên GitHub và tạo Pull Request (PR)
Khi tính năng đã hoàn thành và test chạy ổn trên máy cá nhân:
```bash
# Đẩy nhánh phụ của bạn lên server GitHub
git push origin feature/MC-03-auth
```
- Truy cập vào trang GitHub của dự án.
- Nhấn nút **New Pull Request**.
- Chọn **Base: `develop`** và **Compare: ` /MC-03-auth`** (Lưu ý: Luôn chọn Base là `develop`, không được gộp vào `main`).
- Viết mô tả ngắn gọn những gì bạn đã làm và tag Trưởng nhóm/Reviewer vào để duyệt.

#### Bước 5: Review code và gộp nhánh (Merge PR)
- Trưởng nhóm hoặc thành viên khác sẽ vào xem xét code (Code Review).
- Nếu code chuẩn và không có lỗi, PR sẽ được **Merge** vào nhánh `develop`.
- Sau khi nhánh phụ được gộp thành công trên GitHub, bạn hãy xoá nhánh phụ đó đi để làm sạch repo và quay lại **Bước 1** để nhận task mới.

---

#### 💡 Cách xử lý khi xảy ra xung đột code (Merge Conflict)
Xung đột xảy ra khi bạn và thành viên khác cùng sửa chung một dòng code trên cùng một file. Cách giải quyết:
1. Từ nhánh tính năng của bạn (`feature/MC-xx`), gộp nhánh `develop` mới nhất vào:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/MC-xx
   git merge develop
   ```
2. IDE (VS Code) sẽ cảnh báo các dòng bị xung đột (màu đỏ/xanh). Bạn hãy trao đổi với thành viên kia để chọn giữ lại đoạn code nào (Accept Current / Incoming or Both).
3. Sau khi sửa xong, lưu file và chạy:
   ```bash
   git add .
   git commit -m "[fix] Giải quyết xung đột code với develop"
   git push origin feature/MC-xx
   ```

---

## 4. Định dạng mã nguồn (Linting & Formatting)

### 4.1. Frontend (Next.js - TypeScript)
- Sử dụng **ESLint** để bắt lỗi cú pháp và **Prettier** để tự động format code.
- Cấu hình thụt lề: **2 spaces** (khoảng trắng).
- Luôn sử dụng dấu chấm phẩy `;` ở cuối dòng lệnh.
- Ràng buộc pre-commit qua **Husky** để đảm bảo code không có lỗi lint trước khi commit.

### 4.2. **Backend (Spring Boot)**
- IntelliJ / Google Java Style 
- 4 spaces indent 
- Controller chỉ handle request/response 
- Service chứa business logic 
- Repository chỉ access DB 
- Không viết SQL trong Controller 
- Không dư import / dead code
