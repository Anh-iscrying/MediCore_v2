package com.medicore.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRequest {
    @NotBlank(message = "Mã bệnh nhân hoặc ID không được để trống")
    private String patientId;

    @NotNull(message = "Bác sĩ không được để trống")
    private Integer doctorId;

    @NotBlank(message = "Ngày hẹn không được để trống")
    private String appointmentDate;

    @NotBlank(message = "Giờ hẹn không được để trống")
    private String timeSlot;

    private String symptomsInitial;
    private String status;
}
