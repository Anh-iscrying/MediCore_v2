package com.medicore.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO hứng dữ liệu từ giao diện "Gán lịch theo chu kỳ"
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CycleScheduleRequest {

    // 1. ID của bác sĩ được chọn từ dropdown "Bác sĩ"
    private Integer doctorId;

    // 2. Loại ca trực: "Ca sáng" hoặc "Ca chiều"
    private String shiftType;

    // 3. Danh sách các tuần được chọn (Vd: [1, 2, 5])
    private List<Integer> weeks;

    // 4. Danh sách các thứ trong tuần (Vd: [2, 3, 4] tương ứng T2, T3, T4)
    // Quy ước: 2 = Thứ 2, ..., 7 = Thứ 7, 8 = Chủ Nhật
    private List<Integer> daysOfWeek;

    // 5. Tháng và năm để hệ thống biết cần rải lịch vào tháng nào
    private Integer month;
    private Integer year;
}