# AI Skills & Prompts (Kỹ năng của AI)

Tài liệu này chứa danh sách các chỉ dẫn kỹ thuật hoặc prompt đặc thù giúp AI phát huy tối đa khả năng phân tích, thiết kế và xử lý mã nguồn của dự án MediCore.

## 1. Kỹ năng Phân tích Logic & Sửa lỗi

* **Khai thác Log Backend**: AI có khả năng phân tích stack trace của Spring Boot, Spring Security, Spring Data JPA, Hibernate và PostgreSQL để xác định nguyên nhân gốc của lỗi.
* **Khai thác Log Frontend**: AI có khả năng phân tích lỗi Next.js, React, TypeScript và Browser Console để tìm nguyên nhân gây lỗi giao diện hoặc API.
* **Phân tích luồng nghiệp vụ**: Có khả năng truy vết luồng xử lý từ Controller → Service → Repository → Database để xác định điểm phát sinh lỗi.
* **Tối ưu truy vấn JPA/Hibernate**: Có khả năng phát hiện các vấn đề phổ biến như:

  * N+1 Query Problem
  * LazyInitializationException
  * Circular Reference khi serialize JSON
  * Truy vấn không tối ưu
* Đề xuất giải pháp sử dụng:

  * `JOIN FETCH`
  * `@EntityGraph`
  * Projection DTO
  * Query Method
  * JPQL
  * Native Query

---

## 2. Kỹ năng Thiết kế Kiến trúc

* Tuân thủ mô hình Layered Architecture:

  * Controller Layer
  * Service Layer
  * Repository Layer
  * Entity Layer
  * DTO Layer
* Hỗ trợ thiết kế:

  * RESTful API
  * Authentication & Authorization bằng JWT
  * WebSocket Notification
  * AI Integration (Spring AI / OpenAI / Gemini)
* Ưu tiên các nguyên tắc:

  * SOLID
  * DRY
  * Clean Code
  * Separation of Concerns

---

## 3. Kỹ năng Database & ORM

* Thành thạo PostgreSQL và Supabase.
* Thiết kế Entity Relationship theo chuẩn JPA/Hibernate.
* Hỗ trợ:

  * Mapping One-to-One
  * Mapping One-to-Many
  * Mapping Many-to-One
  * Mapping Many-to-Many
* Viết và tối ưu:

  * JPQL
  * Native SQL
  * Flyway Migration Script
* Đảm bảo tính toàn vẹn dữ liệu bằng:

  * Primary Key
  * Foreign Key
  * Unique Constraint
  * Check Constraint

---

## 4. Kỹ năng Viết Test Case

* Thiết kế Unit Test bằng:

  * JUnit 5
  * Mockito
* Thiết kế Integration Test bằng:

  * Spring Boot Test
  * MockMvc
  * Testcontainers (nếu cần)
* Tập trung kiểm thử:

  * Authentication
  * Authorization
  * CRUD nghiệp vụ
  * Luồng đặt lịch khám
  * Hồ sơ bệnh án điện tử (EMR)
  * API tích hợp AI

---

## 5. Kỹ năng Frontend

* Thành thạo Next.js App Router.
* Thành thạo React và TypeScript.
* Hỗ trợ xây dựng:

  * Reusable Components
  * Form Validation
  * API Integration
  * State Management
* Tối ưu:

  * SEO
  * Performance
  * Accessibility
  * Responsive Design

---

## 6. Kỹ năng Tài liệu Dự án

* Hỗ trợ xây dựng:

  * SRS (Software Requirements Specification)
  * Use Case Specification
  * ERD
  * API Documentation
  * Sprint Backlog
  * Technical Design Document
* Đảm bảo tài liệu luôn đồng bộ với mã nguồn và kiến trúc hệ thống.

---

## 7. Quy tắc Hỗ trợ Dự án MediCore

Khi đưa ra đề xuất kỹ thuật, AI phải ưu tiên:

1. Spring Boot + Spring Data JPA.
2. PostgreSQL/Supabase.
3. Next.js + TypeScript.
4. JWT Authentication.
5. Flyway Migration.
6. Layered Architecture.
7. Clean Code và khả năng mở rộng lâu dài.

Không đề xuất chuyển sang công nghệ khác nếu không có yêu cầu rõ ràng từ nhóm phát triển.
