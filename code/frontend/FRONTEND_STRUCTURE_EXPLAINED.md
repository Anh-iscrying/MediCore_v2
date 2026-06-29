# Giải thích cấu trúc Frontend MediCore v2

Tài liệu này mô tả thư mục `MediCore_v2/code/frontend`: từng thư mục/file chính đang dùng để làm gì, hoạt động như thế nào, và luồng dữ liệu quan trọng trong ứng dụng.

> Phạm vi: chỉ giải thích source code và cấu hình của frontend. Các thư mục sinh tự động như `.next/`, `node_modules/` và lockfile dài chỉ được nhắc ở mức vai trò, không phân tích từng file bên trong.

---

## 1. Tổng quan dự án

Frontend là ứng dụng **Next.js App Router** viết bằng **React + TypeScript**.

Các công nghệ chính:

- **Next.js 16**: framework React, quản lý route trong thư mục `app/`.
- **React 19**: xây dựng UI bằng component.
- **TypeScript**: type checking cho mã nguồn.
- **Tailwind CSS v4**: styling bằng utility class và CSS variables.
- **shadcn/ui + Radix UI**: bộ component UI tái sử dụng trong `components/base/ui/`.
- **next-themes**: quản lý theme dark/light.
- **lucide-react**: icon.
- **recharts**: biểu đồ dashboard.
- **@vercel/analytics**: analytics cho ứng dụng.

Ứng dụng có 4 nhóm chức năng lớn:

1. **Landing page**: trang giới thiệu bệnh viện/dịch vụ.
2. **Auth giả lập**: login/signup client-side, chưa có backend xác thực thật.
3. **Dashboard bệnh nhân**: hồ sơ, lịch hẹn, bệnh án, đơn thuốc, AI assistant.
4. **API mock**: route API đọc/ghi dữ liệu bác sĩ và lịch hẹn vào file JSON local.

---

## 2. Cấu trúc cấp cao

```text
frontend/
├── app/                         # Next.js App Router: page, layout, API routes
├── components/                  # Component UI chia theo domain
├── hooks/                       # Custom React hooks dùng lại toàn app
├── lib/                         # Hàm tiện ích và mock database
├── public/                      # Ảnh/icon tĩnh phục vụ UI
├── styles/                      # CSS global và theme tokens
├── .next/                       # Build/dev output của Next.js, sinh tự động
├── node_modules/                # Dependency đã cài, sinh bởi npm/pnpm
├── components.json              # Cấu hình shadcn/ui
├── next.config.mjs              # Cấu hình Next.js
├── package.json                 # Scripts và dependencies
├── postcss.config.mjs           # Cấu hình PostCSS/Tailwind
└── tsconfig.json                # Cấu hình TypeScript
```

---

## 3. Các file cấu hình ở root

### `.gitignore`

Quy định file/thư mục không đưa vào Git, thường gồm `node_modules`, `.next`, file môi trường, log, build output.

### `package.json`

Khai báo thông tin package, script chạy app và dependencies.

Scripts chính:

- `npm run dev`: chạy Next.js dev server.
- `npm run build`: build production.
- `npm run start`: chạy production server sau khi build.
- `npm run lint`: chạy ESLint.

Dependencies quan trọng:

- `next`, `react`, `react-dom`: nền tảng ứng dụng.
- `@radix-ui/*`: primitive UI cho dialog, dropdown, tabs, toast, tooltip...
- `lucide-react`: icon.
- `class-variance-authority`, `clsx`, `tailwind-merge`: hỗ trợ tạo class Tailwind linh hoạt.
- `next-themes`: theme provider.
- `recharts`: biểu đồ.
- `react-hook-form`, `zod`: thư viện form/validation đã cài, dù một số form hiện đang validate thủ công.

### `package-lock.json` và `pnpm-lock.yaml`

Lockfile dependency. Hai file này ghi chính xác version package đã cài. Dự án hiện có cả npm lockfile và pnpm lockfile, nghĩa là từng được dùng cả npm và pnpm. Nên thống nhất một package manager để tránh lệch dependency.

### `next.config.mjs`

Cấu hình Next.js.

Điểm đáng chú ý:

- `typescript.ignoreBuildErrors: true`: build vẫn chạy dù có lỗi TypeScript. Tiện cho demo, nhưng không an toàn khi production.
- `images.unoptimized: true`: không dùng tối ưu ảnh mặc định của Next Image.

### `tsconfig.json`

Cấu hình TypeScript.

Điểm chính:

- Bật `strict: true`.
- Alias `@/*` trỏ về root frontend, ví dụ `@/lib/db`, `@/components/base/ui/button`.
- Include type sinh bởi Next trong `.next/types`.

### `postcss.config.mjs`

Cấu hình PostCSS dùng plugin `@tailwindcss/postcss`, phục vụ Tailwind CSS v4.

### `components.json`

Cấu hình shadcn/ui.

Ý nghĩa:

- Xác định style shadcn là `new-york`.
- Component UI được đặt ở `components/base/ui`.
- Utility nằm ở `lib/utils`.
- CSS global là `styles/globals.css`.
- Icon library là `lucide`.

### `next-env.d.ts`

File type declaration sinh bởi Next.js. Không nên sửa thủ công.

### `design.md`

Tài liệu thiết kế/ý tưởng giao diện. Không chạy trực tiếp trong app, dùng như tài liệu tham khảo cho thiết kế.

### `.next/`

Thư mục build/dev cache của Next.js. Sinh tự động khi chạy `next dev` hoặc `next build`. Không nên chỉnh tay.

### `node_modules/`

Thư mục chứa package đã cài. Sinh từ lockfile/package manager. Không nên chỉnh tay.

---

## 4. Thư mục `app/` - Next.js App Router

`app/` là nơi Next.js định nghĩa route bằng cấu trúc thư mục.

Quy ước quan trọng:

- `page.tsx`: tạo một route có thể truy cập.
- `layout.tsx`: layout bọc các page con.
- `route.ts`: API route handler.
- `[id]`: dynamic route segment.

### `app/layout.tsx`

Root layout của toàn ứng dụng.

Chức năng:

- Import font `Inter` từ Google Font với subset `latin` và `vietnamese`.
- Import `styles/globals.css`.
- Khai báo metadata mặc định cho site.
- Bọc toàn app bằng `ThemeProvider`.
- Theme mặc định là `dark` và không dùng system theme.
- Gắn `Analytics` của Vercel.

Tất cả route trong app đều nằm bên trong layout này.

### `app/page.tsx`

Route `/`.

Chức năng:

- Import `LandingPage` từ `app/landingpage/page`.
- Render landing page ở trang chủ.

Nói cách khác, `/` và `/landingpage` đang dùng cùng một UI landing.

---

## 5. `app/landingpage/`

### `app/landingpage/page.tsx`

Route `/landingpage`.

Chức năng:

- Ghép các section landing page thành một trang hoàn chỉnh.
- Import component từ `components/base` và `components/landingpage`.

Các phần chính thường gồm:

- Header.
- Hero section.
- Science/specialty section.
- AI care section.
- Tech section.
- Doctors section.
- Patient stories/testimonials.
- Mission section.
- Footer.

Đây là trang marketing/giới thiệu bệnh viện và dẫn người dùng tới login/signup.

---

## 6. `app/auth/` - Nhóm route đăng nhập/đăng ký

### `app/auth/layout.tsx`

Layout cho nhóm `/auth`.

Hiện tại layout này rất mỏng, chủ yếu trả về `children`. Nó tồn tại để sau này có thể thêm background/layout chung cho login/signup.

### `app/auth/login/page.tsx`

Route `/auth/login`.

Chức năng:

- Client component.
- Render màn hình đăng nhập.
- Dùng `AuthForm` với `type="login"`.
- Sau khi submit thành công giả lập, điều hướng sang `/dashboard`.
- Có hiệu ứng reveal/animation bằng client-side logic.

Lưu ý: chưa có gọi API đăng nhập thật, chưa lưu session/token.

### `app/auth/signup/page.tsx`

Route `/auth/signup`.

Chức năng:

- Client component.
- Render màn hình đăng ký.
- Dùng `AuthForm` với `type="signup"`.
- Sau khi submit thành công giả lập, điều hướng sang `/dashboard`.

Lưu ý: chưa có tạo tài khoản thật ở backend.

---

## 7. `app/dashboard/` - Patient portal

### `app/dashboard/layout.tsx`

Layout chung cho toàn bộ dashboard.

Chức năng:

- Tạo dashboard shell.
- Hiển thị sidebar cố định bên trái bằng `DashboardSidebar`.
- Hiển thị header sticky phía trên bằng `DashboardHeader`.
- Render nội dung page con trong vùng main.

Mọi route `/dashboard/*` đều dùng layout này.

### `app/dashboard/page.tsx`

Route `/dashboard`.

Chức năng:

- Trang tổng quan của bệnh nhân.
- Hiển thị lời chào, summary, card chức năng.
- Dẫn tới các module như hồ sơ, lịch hẹn, bệnh án, đơn thuốc, AI assistant.
- Dữ liệu phần lớn là hardcoded/mock.

### `app/dashboard/profile/page.tsx`

Route `/dashboard/profile`.

Chức năng:

- Hiển thị hồ sơ bệnh nhân.
- Có thông tin định danh, liên hệ, người liên hệ khẩn cấp, bệnh nền, dị ứng...
- Dữ liệu hiện tại hardcoded trong page.

### `app/dashboard/appointments/page.tsx`

Route `/dashboard/appointments`.

Chức năng:

- Client page quản lý lịch hẹn.
- Fetch dữ liệu bác sĩ từ `GET /api/doctors`.
- Fetch danh sách lịch hẹn từ `GET /api/appointments`.
- Cho phép chọn chuyên khoa/ngày/giờ/triệu chứng.
- Tạo lịch mới bằng `POST /api/appointments`.
- Hủy lịch bằng `PATCH /api/appointments` với status `CANCELLED`.
- Có link xem chi tiết bác sĩ tới `/dashboard/doctors/[id]`.
- Gắn floating AI assistant bằng component `AIHealthAssistant`.

Đây là một trong các page có dữ liệu động thực sự vì kết nối với API route và file `lib/db.json`.

### `app/dashboard/doctors/[id]/page.tsx`

Route động `/dashboard/doctors/:id`.

Chức năng:

- Client page chi tiết bác sĩ.
- Lấy danh sách bác sĩ từ `GET /api/doctors` rồi tìm bác sĩ theo `id` trên URL.
- Hiển thị thông tin chuyên khoa, kinh nghiệm, học vấn, bio, rating, phí khám.
- Có form đặt lịch trực tiếp cho bác sĩ đó.
- Tạo lịch bằng `POST /api/appointments`.
- Sau khi đặt lịch thành công, chuyển về `/dashboard/appointments?tab=appointments`.

### `app/dashboard/history/page.tsx`

Route `/dashboard/history`.

Chức năng:

- Hiển thị lịch sử khám/hồ sơ bệnh án.
- Dữ liệu hardcoded.
- Mỗi record có ngày khám, bác sĩ, chuyên khoa, chẩn đoán, điều trị, ghi chú/tái khám.

### `app/dashboard/prescriptions/page.tsx`

Route `/dashboard/prescriptions`.

Chức năng:

- Hiển thị đơn thuốc điện tử.
- Dữ liệu hardcoded.
- Có thông tin thuốc, liều, tần suất, thời hạn, hướng dẫn dùng thuốc.
- Nút tải PDF/in đơn thuốc chủ yếu là UI mô phỏng.

### `app/dashboard/ai-assistant/page.tsx`

Route `/dashboard/ai-assistant`.

Chức năng:

- Trang trợ lý AI toàn màn hình trong dashboard.
- Render component `VercelV0Chat` từ `components/ui/v0-ai-chat.tsx`.
- Chat phản hồi theo keyword, chưa gọi API AI thật.

---

## 8. `app/api/` - API routes mock

### `app/api/doctors/route.ts`

Endpoint: `GET /api/doctors`

Chức năng:

- Gọi `readDB()` từ `lib/db.ts`.
- Trả về `db.doctors` dưới dạng JSON.
- Nếu lỗi, trả status `500` với message `Failed to fetch doctors`.

Được dùng bởi:

- Trang đặt lịch `/dashboard/appointments`.
- Trang chi tiết bác sĩ `/dashboard/doctors/[id]`.

### `app/api/appointments/route.ts`

Endpoint:

- `GET /api/appointments`
- `POST /api/appointments`
- `PATCH /api/appointments`

Chức năng từng method:

#### `GET`

- Đọc DB bằng `readDB()`.
- Trả về `db.appointments`.

#### `POST`

- Đọc request body.
- Yêu cầu có `doctor`, `specialty`, `date`, `time`.
- Tạo appointment mới với:
  - `id` random ngắn.
  - `status: "PENDING"`.
  - `symptoms` nếu có.
- Thêm lịch mới vào đầu mảng `appointments`.
- Ghi lại DB bằng `writeDB()`.
- Trả appointment mới với status `201`.

#### `PATCH`

- Đọc `id` và `status` từ body.
- Tìm appointment theo `id`.
- Nếu không thấy, trả `404`.
- Nếu thấy, cập nhật status và ghi lại DB.

Lưu ý kỹ thuật:

- API chưa validate status có thuộc `CONFIRMED | PENDING | CANCELLED` hay không.
- Đây là mock API dùng file system local, phù hợp demo/dev hơn production.

---

## 9. Thư mục `components/`

`components/` chứa các React component tái sử dụng, chia theo domain.

```text
components/
├── auth/             # Form đăng nhập/đăng ký
├── base/             # Layout/common components và shadcn UI
├── dashboard/        # Component riêng cho patient dashboard
├── landingpage/      # Section landing page
└── ui/               # Component UI riêng ngoài base/ui, chủ yếu chat
```

---

## 10. `components/auth/`

### `components/auth/auth-form.tsx`

Form dùng chung cho login và signup.

Props chính:

- `type: "login" | "signup"`: quyết định form hiển thị field nào.
- `onSubmit`: callback khi form submit thành công.

Hoạt động:

- Giữ state cho email, password, name, confirmPassword.
- Validate thủ công:
  - Email bắt buộc và đúng định dạng.
  - Password tối thiểu 6 ký tự.
  - Signup yêu cầu name.
  - Signup yêu cầu confirm password khớp password.
- Khi submit hợp lệ, giả lập loading khoảng 1 giây rồi gọi `onSubmit`.

Lưu ý: component này không tự gọi backend; page cha quyết định hành động sau submit.

---

## 11. `components/base/`

Đây là nhóm component nền tảng dùng nhiều nơi.

### `components/base/header.tsx`

Header của landing page.

Chức năng:

- Hiển thị logo/tên thương hiệu.
- Menu điều hướng tới các section trong landing page bằng anchor như `#specialties`, `#ai-care`, `#tech`, `#doctors`, `#mission`.
- Có nút login/signup.
- Có mobile menu đóng/mở bằng state client-side.

### `components/base/footer.tsx`

Footer của landing page.

Chức năng:

- Hiển thị thông tin liên hệ.
- Nhóm link dịch vụ/chuyên khoa/about/patient.
- Link policy/terms/patient rights.

Dữ liệu hiện tại là hardcoded.

### `components/base/theme-provider.tsx`

Wrapper quanh `ThemeProvider` của `next-themes`.

Chức năng:

- Cho phép app dùng class `dark`/theme.
- Được gọi ở `app/layout.tsx` để bọc toàn bộ app.

### `components/base/animated-text.tsx`

Component hiển thị text với animation.

Thường dùng cho landing page để tạo hiệu ứng chữ xuất hiện.

### `components/base/scroll-blur-text.tsx`

Component text có hiệu ứng blur/appear theo scroll hoặc visibility.

Dùng để tăng hiệu ứng trình bày ở landing page.

### `components/base/medical-icons.tsx`

Chứa các SVG/icon custom về y tế.

Các icon gồm:

- `HeartCareIcon`
- `BrainHealthIcon`
- `BoneJointIcon`
- `PulmonaryIcon`

Dùng cho section chuyên khoa/dịch vụ.

---

## 12. `components/base/ui/` - Bộ UI shadcn/Radix

Thư mục này chứa nhiều component UI dạng primitive/wrapper, đa số theo style shadcn/ui. Các component này thường nhận `className`, dùng `cn()` từ `lib/utils.ts`, và bọc Radix primitive hoặc HTML element.

### Nhóm action/button

- `button.tsx`: button chính, thường có variant/size.
- `button-group.tsx`: nhóm nhiều button cạnh nhau.
- `toggle.tsx`: nút bật/tắt.
- `toggle-group.tsx`: nhóm toggle.

### Nhóm form/input

- `input.tsx`: input text cơ bản.
- `textarea.tsx`: textarea trong hệ shadcn base.
- `checkbox.tsx`: checkbox.
- `radio-group.tsx`: radio group.
- `select.tsx`: select/dropdown chọn giá trị.
- `label.tsx`: label cho form control.
- `form.tsx`: helper form tích hợp với `react-hook-form`.
- `field.tsx`: layout/field helper.
- `input-otp.tsx`: input OTP nhiều ô.
- `input-group.tsx`: nhóm input kèm icon/button.
- `slider.tsx`: thanh trượt chọn số.
- `switch.tsx`: công tắc on/off.
- `calendar.tsx`: lịch chọn ngày.

### Nhóm layout/data display

- `card.tsx`: card container.
- `table.tsx`: table.
- `tabs.tsx`: tab UI.
- `accordion.tsx`: nội dung đóng/mở.
- `separator.tsx`: đường phân tách.
- `scroll-area.tsx`: vùng scroll tùy biến.
- `resizable.tsx`: panel resize.
- `sidebar.tsx`: primitives cho sidebar.
- `item.tsx`: item layout.
- `empty.tsx`: trạng thái rỗng.
- `aspect-ratio.tsx`: giữ tỷ lệ khung hình.
- `avatar.tsx`: avatar.
- `badge.tsx`: nhãn/trạng thái.
- `breadcrumb.tsx`: breadcrumb navigation.
- `pagination.tsx`: phân trang.
- `progress.tsx`: progress bar.
- `skeleton.tsx`: loading placeholder.
- `spinner.tsx`: loading spinner.
- `kbd.tsx`: hiển thị phím tắt.

### Nhóm overlay/navigation

- `dialog.tsx`: modal/dialog.
- `alert-dialog.tsx`: dialog xác nhận/cảnh báo.
- `sheet.tsx`: panel trượt từ cạnh màn hình.
- `drawer.tsx`: drawer, thường dùng mobile.
- `dropdown-menu.tsx`: menu xổ xuống.
- `popover.tsx`: popover.
- `tooltip.tsx`: tooltip.
- `hover-card.tsx`: card hiện khi hover.
- `context-menu.tsx`: menu chuột phải.
- `menubar.tsx`: menu bar.
- `navigation-menu.tsx`: menu điều hướng nâng cao.
- `command.tsx`: command palette/search menu.
- `collapsible.tsx`: vùng đóng/mở.

### Nhóm feedback/toast/chart

- `alert.tsx`: alert message.
- `toast.tsx`: toast primitives.
- `toaster.tsx`: nơi render toast.
- `sonner.tsx`: tích hợp thư viện `sonner`.
- `chart.tsx`: helper chart, thường dùng với Recharts.

### Hook/helper nằm trong `components/base/ui/`

- `use-mobile.tsx`: hook kiểm tra viewport mobile, bản local cho UI base.
- `use-toast.ts`: toast store/hook, bản local cho UI base.

Lưu ý: dự án cũng có `hooks/use-mobile.ts` và `hooks/use-toast.ts`, tạo sự trùng lặp chức năng.

---

## 13. `components/dashboard/`

### `components/dashboard/dashboard-sidebar.tsx`

Sidebar của dashboard.

Chức năng:

- Dùng `usePathname()` để biết route hiện tại và active menu item.
- Hiển thị menu chính:
  - Trang chủ dashboard.
  - Hồ sơ sức khỏe/lịch sử.
  - Lịch hẹn khám.
  - Trợ lý sức khỏe AI.
- Có section “Bác sĩ của tôi” với danh sách bác sĩ hardcoded.

Lưu ý: một số route như `/dashboard/profile` và `/dashboard/prescriptions` có page nhưng không nhất thiết xuất hiện trong menu chính.

### `components/dashboard/dashboard-header.tsx`

Header phía trên dashboard.

Chức năng:

- Dùng `usePathname()` để đổi title/subtitle theo route.
- Có nút notification.
- Có user dropdown.
- Dropdown có link hồ sơ, cài đặt mô phỏng, đăng xuất về `/`.

### `components/dashboard/ai-health-assistant.tsx`

Floating chat AI trong dashboard.

Chức năng:

- Hiển thị nút chat ở góc dưới phải.
- Khi mở, hiện cửa sổ chat nhỏ.
- Quản lý messages, input, trạng thái typing.
- Auto resize textarea.
- Phản hồi theo keyword như đau đầu, ngủ, tập luyện...

Lưu ý: không gọi AI backend thật; toàn bộ phản hồi là logic client-side.

### `components/dashboard/dashboard-vitals-chart.tsx`

Biểu đồ chỉ số sinh tồn.

Chức năng:

- Dùng Recharts.
- Có dữ liệu mock theo giờ.
- Cho phép đổi metric như nhịp tim, SpO2, nhiệt độ.

Hiện có thể là component chuẩn bị sẵn, không nhất thiết đang được gắn ở layout/page chính.

### `components/dashboard/dashboard-player.tsx`

Player mô phỏng phiên tập phục hồi chức năng.

Chức năng:

- Có nút play/pause.
- Timer bằng `setInterval`.
- Progress slider.
- Các chỉ số mock như hydration/steps/calories.
- Nút đồng bộ thiết bị/danh sách/mở rộng.

Lưu ý: component này tồn tại nhưng chưa thấy là phần bắt buộc trong dashboard layout hiện tại.

### `components/dashboard/doctor-detail-modal.tsx`

Modal chi tiết bác sĩ.

Chức năng:

- Dùng `Dialog` từ shadcn/Radix.
- Hiển thị thông tin bác sĩ: tên, chuyên khoa, kinh nghiệm, học vấn, bio, rating, phí khám.

Lưu ý: hiện app có route riêng `/dashboard/doctors/[id]`, nên modal này có thể là component cũ hoặc phương án UI thay thế.

---

## 14. `components/landingpage/`

Các component ở đây là section của landing page. `app/landingpage/page.tsx` sẽ ghép các section này lại.

### `hero-section.tsx`

Hero section ở đầu landing page.

Chức năng thường có:

- Headline chính.
- Mô tả ngắn.
- CTA như đặt lịch hoặc vào dashboard/auth.
- Ảnh hero từ `public/images`.

### `science-section.tsx`

Section nói về nền tảng khoa học/chuyên môn y tế.

Dùng để trình bày giá trị chuyên môn, chuyên khoa hoặc phương pháp điều trị.

### `ai-care-section.tsx`

Section giới thiệu chăm sóc sức khỏe bằng AI.

Dùng để quảng bá tính năng AI assistant/tư vấn thông minh trong sản phẩm.

### `tech-section.tsx`

Section giới thiệu công nghệ.

Có thể nhấn mạnh thiết bị, hệ thống số hóa, quản lý dữ liệu, hoặc công nghệ bệnh viện.

### `doctors-section.tsx`

Section giới thiệu đội ngũ bác sĩ.

Có thể dùng ảnh bác sĩ trong `public/images/doctor-*.png` và thông tin hardcoded.

### `testimonials-section.tsx`

Export component `PatientStoriesSection`.

Chức năng:

- Hiển thị câu chuyện/đánh giá bệnh nhân.
- Tăng độ tin cậy cho landing page.

### `mission-section.tsx`

Section sứ mệnh bệnh viện.

Có thể dùng ảnh nền `mission-background.png` và nội dung giới thiệu tầm nhìn/sứ mệnh.

### `product-section.tsx`

Section sản phẩm/dịch vụ.

Lưu ý: component tồn tại nhưng có thể chưa được import trong landing page hiện tại.

### `specialties-gallery.tsx`

Gallery chuyên khoa.

Chức năng:

- Hiển thị các chuyên khoa như tim mạch, thần kinh, cơ xương khớp...
- Có thể dùng ảnh `specialty-*.png`.

---

## 15. `components/ui/`

Thư mục này chứa component UI riêng, nằm ngoài bộ `components/base/ui`.

### `components/ui/v0-ai-chat.tsx`

Chat AI toàn màn hình cho route `/dashboard/ai-assistant`.

Chức năng:

- Client component.
- Hiển thị giao diện chat lớn.
- Có suggestion chips ban đầu.
- Quản lý danh sách message, input, loading/typing.
- Auto resize textarea.
- Sinh câu trả lời theo keyword như triệu chứng, đơn thuốc, phục hồi, huyết áp, dinh dưỡng...

Lưu ý: đây là AI chat mô phỏng, chưa gọi model/API thật.

### `components/ui/textarea.tsx`

Textarea riêng dùng cho chat UI.

Lưu ý: tồn tại song song với `components/base/ui/textarea.tsx`. Khi phát triển tiếp nên thống nhất nếu không cần hai bản khác nhau.

---

## 16. Thư mục `hooks/`

### `hooks/use-mobile.ts`

Custom hook phát hiện thiết bị mobile.

Hoạt động:

- Chạy phía client.
- Dùng `window.matchMedia`.
- Breakpoint là nhỏ hơn `768px`.
- Trả về boolean cho biết viewport có phải mobile không.

Dùng cho component cần đổi UI theo kích thước màn hình.

### `hooks/use-toast.ts`

Hook/toast state manager kiểu shadcn.

Chức năng:

- Quản lý danh sách toast trong memory state.
- Cung cấp hàm `toast()` để tạo toast.
- Cung cấp `useToast()` để component đọc/dismiss toast.
- Giới hạn số toast hiển thị là `TOAST_LIMIT = 1`.

Lưu ý: có bản tương tự trong `components/base/ui/use-toast.ts`.

---

## 17. Thư mục `lib/`

### `lib/utils.ts`

Chứa helper `cn()`.

Chức năng:

- Kết hợp `clsx` và `tailwind-merge`.
- Cho phép viết className có điều kiện và tự merge class Tailwind bị xung đột.

Ví dụ ý nghĩa:

```ts
cn("p-2", condition && "bg-primary", "p-4")
```

Kết quả sẽ merge class hợp lý thay vì giữ class Tailwind xung đột.

### `lib/db.ts`

Mock database server-side bằng file JSON.

Nội dung chính:

- Interface `Doctor`.
- Interface `Appointment`.
- Dữ liệu khởi tạo `initialDoctors`.
- Dữ liệu khởi tạo `initialAppointments`.
- Hàm `ensureDB()`.
- Hàm `readDB()`.
- Hàm `writeDB()`.

Cách hoạt động:

1. DB path được đặt là `process.cwd()/lib/db.json`.
2. Khi API gọi `readDB()` hoặc `writeDB()`, `ensureDB()` kiểm tra file DB có tồn tại chưa.
3. Nếu chưa có, nó tạo file `lib/db.json` với dữ liệu mặc định.
4. `readDB()` đọc file JSON và parse thành object.
5. `writeDB()` ghi object lại vào file JSON.

Dùng bởi:

- `app/api/doctors/route.ts`
- `app/api/appointments/route.ts`

Lưu ý quan trọng:

- Đây là persistence local, phù hợp demo/dev.
- Không nên dùng như database thật trong production/serverless.
- Ghi file trực tiếp có thể gặp vấn đề khi deploy lên môi trường readonly hoặc nhiều instance.

### `lib/db.json`

File dữ liệu mock hiện tại.

Chứa:

- `doctors`: danh sách bác sĩ.
- `appointments`: danh sách lịch hẹn.

Khi người dùng đặt/hủy lịch qua UI, API sẽ cập nhật file này.

---

## 18. Thư mục `styles/`

### `styles/globals.css`

CSS global của toàn app.

Chức năng chính:

- Import Tailwind CSS v4 bằng `@import "tailwindcss"`.
- Import animation utility `tw-animate-css`.
- Tạo custom variant `dark`.
- Định nghĩa CSS variables cho theme sáng/tối.
- Map CSS variables vào Tailwind `@theme inline`.
- Thiết lập base style cho `body`.
- Tạo utility animation như:
  - `animate-fade-up`
  - `animation-delay-200`
  - `animation-delay-400`
  - `animation-delay-600`
  - `animate-zoom-in`
  - `scrollbar-hide`

Theme hiện tại là warm editorial/medical style:

- Nền cream hoặc dark warm.
- Primary coral `#cc785c`.
- Border và muted màu ấm.
- Có token riêng cho sidebar và chart.

---

## 19. Thư mục `public/`

`public/` chứa asset tĩnh. File trong thư mục này được serve trực tiếp từ root URL.

Ví dụ:

- `public/icon.svg` có thể truy cập qua `/icon.svg`.
- `public/images/hero-hospital.png` có thể truy cập qua `/images/hero-hospital.png`.

### Icon/placeholder ở `public/`

- `apple-icon.png`: icon cho Apple touch icon.
- `icon.svg`: icon SVG chính.
- `icon-dark-32x32.png`: icon cho dark mode.
- `icon-light-32x32.png`: icon cho light mode.
- `placeholder-logo.png`, `placeholder-logo.svg`: logo placeholder.
- `placeholder-user.jpg`: avatar placeholder.
- `placeholder.jpg`, `placeholder.svg`: ảnh placeholder chung.

### Ảnh trong `public/images/`

- `ai-avatar.png`: avatar dùng cho AI/chat.
- `doctor-chen.png`, `doctor-jenkins.png`, `doctor-vance.png`: ảnh bác sĩ.
- `hero-biometic.png`, `hero-hospital.png`: ảnh hero/landing.
- `mission-background.png`: ảnh nền section mission.
- `product-equilibrium.png`, `product-serenity.png`, `product-vitality.png`: ảnh sản phẩm/dịch vụ.
- `specialty-cardiology.png`, `specialty-neurology.png`, `specialty-orthopedics.png`: ảnh chuyên khoa.

---

## 20. Luồng hoạt động chính

### 20.1. Luồng vào landing page

```text
Người dùng vào /
→ app/page.tsx
→ render app/landingpage/page.tsx
→ ghép Header + các section landing + Footer
→ CTA dẫn tới /auth/login hoặc /auth/signup
```

### 20.2. Luồng auth giả lập

```text
Người dùng vào /auth/login hoặc /auth/signup
→ page render AuthForm
→ AuthForm validate input phía client
→ giả lập loading
→ callback onSubmit trong page
→ router.push('/dashboard')
```

Chưa có:

- Backend auth.
- Session/cookie.
- Middleware bảo vệ route dashboard.

Vì vậy người dùng có thể vào trực tiếp `/dashboard`.

### 20.3. Luồng dashboard

```text
Người dùng vào /dashboard/*
→ app/layout.tsx bọc toàn app
→ app/dashboard/layout.tsx tạo sidebar + header
→ page con render nội dung tương ứng
```

Header và sidebar dùng pathname hiện tại để hiển thị trạng thái active/title.

### 20.4. Luồng đặt lịch khám

```text
/dashboard/appointments
→ fetch GET /api/doctors
→ fetch GET /api/appointments
→ người dùng chọn bác sĩ/ngày/giờ/triệu chứng
→ POST /api/appointments
→ app/api/appointments/route.ts
→ readDB()
→ thêm appointment mới status PENDING
→ writeDB()
→ UI refresh danh sách lịch hẹn
```

Hủy lịch:

```text
Người dùng bấm hủy
→ PATCH /api/appointments với id + status CANCELLED
→ API tìm appointment trong db.appointments
→ cập nhật status
→ writeDB()
```

### 20.5. Luồng xem chi tiết bác sĩ

```text
/dashboard/doctors/[id]
→ lấy id từ URL
→ fetch GET /api/doctors
→ tìm doctor.id tương ứng
→ render thông tin bác sĩ
→ người dùng đặt lịch
→ POST /api/appointments
→ chuyển về /dashboard/appointments?tab=appointments
```

### 20.6. Luồng AI assistant mô phỏng

Có 2 UI chat:

1. `AIHealthAssistant`: floating chat, dùng trong trang appointments.
2. `VercelV0Chat`: full page chat, dùng ở `/dashboard/ai-assistant`.

Cả hai đều:

```text
Người dùng nhập tin nhắn
→ component đọc keyword trong nội dung
→ chọn câu trả lời hardcoded phù hợp
→ thêm message assistant vào UI
```

Chưa có gọi API AI/backend thật.

---

## 21. Các điểm cần lưu ý khi phát triển tiếp

### 21.1. Auth hiện chỉ là mô phỏng

Hiện login/signup chỉ validate client-side và redirect. Nếu làm thật cần thêm:

- API auth.
- Database user.
- Password hashing.
- Session/JWT/cookie.
- Middleware bảo vệ `/dashboard`.

### 21.2. Mock DB bằng file JSON

`lib/db.ts` ghi vào `lib/db.json`. Cách này dễ demo nhưng không phù hợp production.

Nếu triển khai thật nên chuyển sang database như PostgreSQL, MySQL, MongoDB hoặc backend API riêng.

### 21.3. Build đang bỏ qua lỗi TypeScript

`next.config.mjs` có `ignoreBuildErrors: true`. Khi production nên tắt để lỗi type không bị bỏ qua.

### 21.4. Có duplicate component/hook

Các cặp trùng lặp:

- `components/base/ui/textarea.tsx` và `components/ui/textarea.tsx`.
- `components/base/ui/use-toast.ts` và `hooks/use-toast.ts`.
- `components/base/ui/use-mobile.tsx` và `hooks/use-mobile.ts`.

Nên thống nhất import để dễ bảo trì.

### 21.5. Một số component có thể chưa dùng

Có component tồn tại nhưng chưa chắc đang được gắn vào page chính:

- `DashboardPlayer`
- `DashboardVitalsChart`
- `DoctorDetailModal`
- `ProductSection`

Có thể giữ làm tính năng tương lai hoặc xóa nếu không dùng.

### 21.6. API validation còn đơn giản

Ví dụ `PATCH /api/appointments` chỉ kiểm tra có `id` và `status`, chưa kiểm tra status có hợp lệ không.

Nên bổ sung validation bằng Zod hoặc logic thủ công nếu muốn chắc chắn hơn.

---

## 22. Bảng tóm tắt nhanh từng khu vực

| Khu vực | Vai trò |
|---|---|
| `app/layout.tsx` | Layout gốc, theme, font, metadata, analytics |
| `app/page.tsx` | Trang `/`, render landing page |
| `app/landingpage` | Trang marketing/giới thiệu |
| `app/auth` | Login/signup giả lập |
| `app/dashboard` | Patient portal |
| `app/api` | API mock doctors/appointments |
| `components/auth` | Form auth dùng chung |
| `components/base` | Header/footer/theme/icon/animation |
| `components/base/ui` | Bộ UI shadcn/Radix |
| `components/dashboard` | Sidebar/header/chart/chat/modal dashboard |
| `components/landingpage` | Các section landing page |
| `components/ui` | Chat UI và textarea riêng |
| `hooks` | Hooks dùng lại |
| `lib` | Utility và mock DB |
| `styles` | Global CSS/theme/animation |
| `public` | Ảnh và icon tĩnh |

---

## 23. Gợi ý đọc code theo thứ tự

Nếu bạn muốn hiểu dự án từ dễ đến sâu, nên đọc theo thứ tự:

1. `package.json` để biết công nghệ.
2. `app/layout.tsx` để hiểu layout gốc.
3. `app/page.tsx` và `app/landingpage/page.tsx` để hiểu trang public.
4. `components/landingpage/*` để hiểu landing UI.
5. `app/auth/*` và `components/auth/auth-form.tsx` để hiểu login/signup.
6. `app/dashboard/layout.tsx`, `dashboard-sidebar`, `dashboard-header` để hiểu dashboard shell.
7. `app/dashboard/appointments/page.tsx` để hiểu chức năng động chính.
8. `app/api/*` và `lib/db.ts` để hiểu mock backend.
9. `styles/globals.css` để hiểu theme.
10. `components/base/ui/*` khi cần chỉnh component UI cụ thể.
