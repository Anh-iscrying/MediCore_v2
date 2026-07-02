package com.medicore.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientUpdateRequest {
    @NotBlank(message = "Tên bệnh nhân không được để trống")
    private String name;

    @NotBlank(message = "Ngày sinh không được để trống")
    private String dateOfBirth;

    private String gender;

    @Pattern(regexp = "^$|^\\d{10}$", message = "Số điện thoại phải đủ 10 số")
    private String phone;

    private String address;
}
