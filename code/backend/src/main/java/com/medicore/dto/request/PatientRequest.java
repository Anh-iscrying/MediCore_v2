package com.medicore.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientRequest {
    @NotBlank(message = "Tên bệnh nhân không được để trống")
    private String name;

    @NotBlank(message = "Ngày sinh không được để trống")
    private String dateOfBirth;

    @NotNull(message = "Giới tính không được để trống")
    private String gender;

    private String phone;
    private String address;
    private String email;
    private String insuranceNumber;
    private String status;
}
