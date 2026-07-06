package com.medicore.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiContextRetrievalAttempt {
    /** Loại action đã thực thi (VD: RECENT_RECORDS, RECORD_DETAIL) */
    private String actionType;
    /** Mô tả target mà user muốn lấy */
    private String targetText;
    private String emrCode;
    private String keyword;
    private Integer limit;
    private Integer offset;
    private Boolean sortAsc;
    private String dateFrom;
    private String dateTo;
    /** Kết quả truy vấn */
    private RetrievalStatus status;
    /** Số bản ghi trả về */
    private int resultCount;
    /** Ghi chú bổ sung */
    private String note;
}
