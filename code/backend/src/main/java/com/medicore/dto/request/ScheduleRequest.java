package com.medicore.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ScheduleRequest {
    private Integer doctorId;
    private LocalDate workDate;
    private String timeSlot;
}