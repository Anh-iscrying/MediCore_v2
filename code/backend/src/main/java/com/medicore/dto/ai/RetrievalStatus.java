package com.medicore.dto.ai;

public enum RetrievalStatus {
    /** Truy vấn thành công, có kết quả */
    FOUND,
    /** Truy vấn thành công nhưng không có kết quả */
    NOT_FOUND,
    /** Bỏ qua vì thiếu input bắt buộc */
    SKIPPED_MISSING_INPUT,
    /** Dùng fallback thay vì target chính */
    FALLBACK_USED
}
