package com.medicore.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ScheduleRequest {
    @NotNull(message = "Bác sĩ không được để trống")
    private Integer doctorId;

    @NotNull(message = "Ngày trực không được để trống")
    private LocalDate workDate;

    @NotBlank(message = "Ca trực không được để trống")
    private String timeSlot;
}