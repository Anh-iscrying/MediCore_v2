package com.medicore.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorRequest {
    @NotBlank(message = "Tên bác sĩ không được để trống")
    private String name;

    @NotNull(message = "Chuyên khoa không được để trống")
    private Integer specialtyId;

    private String title;
    private String bio;
    private String phone;

    @Min(value = 0, message = "Số năm kinh nghiệm không được nhỏ hơn 0")
    private Integer experience;

    private String email;
    private String password;
    private String status;
    private String avatarUrl;
}
