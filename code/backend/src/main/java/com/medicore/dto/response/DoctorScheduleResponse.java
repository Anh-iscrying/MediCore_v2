package com.medicore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorScheduleResponse {
    private Integer id;
    private Integer doctorId;
    private String doctorName;
    private String doctorCode;
    private String workDate;
    private String timeSlot;
    private Boolean isBooked;
}
