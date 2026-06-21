# AI Rules & Coding Guidelines

Tài liệu này định nghĩa các quy tắc cốt lõi mà AI Assistant cần tuân thủ khi viết code và tương tác trong dự án này.

## 1. Quy tắc viết Code
- **Bảo toàn chú thích**: Luôn giữ lại các comment, tài liệu và docstring hiện có trong file nguồn, trừ khi có yêu cầu viết lại hoặc thay đổi trực tiếp.
- **Tuân thủ Coding Convention**: Đọc kỹ file `docs/convention.md` để đảm bảo tuân thủ đúng định dạng đặt tên biến, hàm, cấu trúc commit và tổ chức code của dự án.
- **Không sử dụng placeholders**: Khi viết code hoặc viết các file cấu hình, tránh sử dụng các đoạn code giả lập, comment dạng `// TODO: implement here` mà không có logic thực sự, trừ khi đó là yêu cầu tạo khung rỗng từ người dùng.
- **Không tự ý cài đặt thư viện**: Khi cần cài đặt thêm bất kỳ thư viện hoặc dependency mới nào, AI phải hỏi ý kiến hoặc đề xuất rõ ràng cho lập trình viên trước khi cài đặt.

## 2. Quy tắc kiểm thử
- Mỗi khi hoàn thành một tính năng hoặc API mới, AI nên chủ động viết hoặc đề xuất các test case tương ứng trong thư mục `test/`.
- Luôn kiểm tra các trường hợp biên (edge cases), dữ liệu rỗng (null/undefined) và xử lý lỗi (error handling) cẩn thận.
