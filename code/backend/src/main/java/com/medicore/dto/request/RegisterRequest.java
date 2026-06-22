package com.medicore.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    @NotBlank(message = "Tên bác sĩ không được để trống")
    private String name;

    @NotNull(message = "Chuyên khoa không được để trống")
    private Integer specialtyId;

    private String phone;
    private String title; // degree

    @Min(value = 0, message = "Số năm kinh nghiệm không được nhỏ hơn 0")
    private Integer experience;
}
