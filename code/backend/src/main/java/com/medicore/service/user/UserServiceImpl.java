package com.medicore.service.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

// TODO: Tích hợp Supabase Auth flow
// Luồng đăng ký mới:
//   1. Frontend/Backend tạo user trong Supabase Auth → nhận auth.users.id (UUID)
//   2. Backend insert profile vào public.users với cùng UUID
//   3. Backend insert patients hoặc doctors tùy theo role
//
// Luồng cũ đã bỏ vì:
//   - public.users không có cột email, password, is_active
//   - Email/password do Supabase Auth quản lý ở bảng auth.users

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

}