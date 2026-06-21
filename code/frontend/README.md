# Frontend Codebase - MediCore (Next.js)

Thư mục này chứa mã nguồn giao diện người dùng của dự án quản lý phòng khám và hồ sơ bệnh án MediCore sử dụng Next.js.

## 1. Công nghệ sử dụng
- **Framework**: Next.js (sử dụng App Router hiện đại cho tối ưu SEO & Routing)
- **Styling**: Tailwind CSS & Ant Design (UI Component Library wrapper)
- **State Management**: Zustand (lưu trữ thông tin người dùng và JWT Token cục bộ)
- **Package Manager**: npm
- **Kiểm tra mã nguồn**: Husky & ESLint (tự động lint code trước khi Git Commit)

## 2. Cấu trúc thư mục chi tiết (Next.js App Router)

```text
frontend/
├── .husky/                 # Quản lý pre-commit hooks (kiểm tra lỗi code trước khi commit)
├── public/                 # Các tài nguyên tĩnh công khai (logo phòng khám, icons y tế, favicon)
├── src/
│   ├── app/                # TẦNG ĐỊNH TUYẾN CHÍNH (Next.js App Router)
│   │   ├── layout.tsx      # Root Layout chứa các Providers (Auth context, Ant Design Theme, QueryClient)
│   │   ├── page.tsx        # Trang chủ giới thiệu phòng khám công khai (Tra cứu bác sĩ, chuyên khoa)
│   │   │
│   │   ├── (auth)/         # Group Route cho Xác thực (không hiển thị trên URL)
│   │   │   ├── login/      # /login - Màn hình Đăng nhập
│   │   │   └── register/   # /register - Màn hình Đăng ký tài khoản mới
│   │   │
│   │   ├── patient/        # Route cho Bệnh nhân
│   │   │   ├── page.tsx    # Trang tổng quan bệnh nhân
│   │   │   ├── booking/    # /patient/booking - Màn hình Đặt lịch khám nhanh
│   │   │   ├── history/    # /patient/history - Xem lịch sử khám bệnh (Timeline) và Tải đơn thuốc PDF
│   │   │   └── chat-ai/    # /patient/chat-ai - Khung trò chuyện tư vấn với Trợ lý AI (RAG)
│   │   │
│   │   ├── doctor/         # Route cho Bác sĩ
│   │   │   ├── page.tsx    # Dashboard Bác sĩ: Danh sách hàng chờ khám Real-time (WebSocket)
│   │   │   └── encounter/  # /doctor/encounter - Màn hình thăm khám lâm sàng, ghi chẩn đoán & kê đơn
│   │   │
│   │   └── admin/          # Route cho Quản trị viên
│   │       ├── page.tsx    # Biểu đồ báo cáo thống kê vận hành phòng khám (Chart.js)
│   │       ├── doctors/    # /admin/doctors - Quản lý hồ sơ bác sĩ & phân gán Lịch trực
│   │       └── medicines/  # /admin/medicines - Quản lý danh mục Thuốc & mã bệnh chuẩn ICD-10
│   │
│   ├── assets/             # Hình ảnh minh họa, icon y tế dùng chung
│   ├── components/         # Các Component dùng chung
│   │   ├── base/           # Base Button, Modal, Input (Bọc ngoài thư viện Ant Design)
│   │   └── features/       # BookingForm, MedicalRecordCard, PrescriptionPDF (Theo nghiệp vụ)
│   │
│   ├── constants/          # Định nghĩa hằng số (mã ICD-10 mẫu, các Time Slots khám bệnh 08:00 - 08:30)
│   ├── hooks/              # Các Custom Hooks dùng chung (useAuth, useWebSocket, useNotification...)
│   ├── services/           # Gọi API kết nối Backend
│   │   ├── appointment.ts  # API xử lý đặt lịch hẹn khám
│   │   ├── medicalRecord.ts# API quản lý bệnh án điện tử (EMR) & kết nối AI Service
│   │   └── socket.ts       # Cấu hình WebSocket Client kết nối Real-time (STOMP Protocol)
│   │
│   ├── store/              # Quản lý trạng thái Global (Zustand) lưu thông tin User & JWT Token
│   └── utils/              # Các hàm bổ trợ dùng chung (format date, validate form...)
│
├── tailwind.config.ts      # Ghi đè cấu hình màu sắc chủ đạo: Medical Blue (#1890ff)
├── next.config.js          # File cấu hình Next.js (Redirects, Headers, API Proxy...)
├── .env.local              # Biến môi trường local (Lưu link Backend API và AI Service API)
└── package.json            # Quản lý dependencies và scripts chạy dự án
```

## 3. Cài đặt & Khởi chạy (Hướng dẫn nhanh)

```bash
# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Chạy môi trường phát triển cục bộ (Local Development)
npm run dev

# 3. Build mã nguồn tối ưu cho Production
npm run build

# 4. Khởi chạy production server
npm start
```
