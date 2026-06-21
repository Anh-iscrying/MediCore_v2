# AI Workflows (Quy trình làm việc của AI)

Tài liệu này hướng dẫn các bước làm việc (workflow) tiêu chuẩn để AI phối hợp tốt nhất với lập trình viên.

## Workflow 1: Thêm tính năng mới (Adding new feature)
1. **Khảo sát cấu trúc**: Khảo sát mã nguồn hiện tại ở cả `code/frontend` và `code/backend` để hiểu cách tổ chức.
2. **Đề xuất giải pháp**: Giải thích giải pháp kỹ thuật dự kiến áp dụng.
3. **Thực thi**:
   - Cập nhật cơ sở dữ liệu (nếu có).
   - Viết logic xử lý backend và tích hợp unit test.
   - Xây dựng giao diện frontend tương ứng.
4. **Cập nhật tài liệu**: Cập nhật danh sách backlog hoặc tài liệu SRS liên quan để phản ánh tính năng mới đã hoàn thành.

## Workflow 2: Sửa lỗi (Bug Fixing)
1. **Tái hiện lỗi**: Yêu cầu lập trình viên cung cấp log lỗi hoặc mô tả hành vi không mong muốn.
2. **Tìm nguyên nhân**: Phân tích code hiện tại, sử dụng các công cụ tìm kiếm hoặc grep để khoanh vùng file lỗi.
3. **Đề xuất bản vá**: Giải thích rõ tại sao lỗi xảy ra và cách sửa đổi cụ thể.
4. **Kiểm tra lại**: Sau khi sửa lỗi, đảm bảo lỗi đã được giải quyết và không tạo ra lỗi mới (regression bugs).
