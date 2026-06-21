package com.medicore.common.constants;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCodes {
    SUCCESS(200, "Thành công"),
    NOT_FOUND(404, "Không tìm thấy dữ liệu"),
    BAD_REQUEST(400, "Dữ liệu không hợp lệ hoặc đã tồn tại"),
    UNAUTHORIZED(401, "Chưa xác thực"),
    FORBIDDEN(403, "Không có quyền truy cập"),
    INTERNAL_SERVER_ERROR(500, "Lỗi hệ thống");

    private final int code;
    private final String message;
}