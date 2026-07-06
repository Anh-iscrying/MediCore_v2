package com.medicore.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientAiContextAction {
    private PatientAiContextActionType type;
    private String emrCode;
    private String keyword;
    private Integer limit;
    /** true = sắp xếp cũ nhất trước (ASC), false/null = mới nhất trước (DESC) */
    private Boolean sortAsc;
    /** Bỏ qua N bản ghi đầu tiên (0-indexed). Ví dụ: offset=2 + sortAsc=true → lấy từ lần khám thứ 3 */
    private Integer offset;
}
