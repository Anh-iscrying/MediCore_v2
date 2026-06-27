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

    @NotBlank(message = "Tên không được để trống")
    private String name;

    private String phone;
    
    // Thêm các trường cho Bệnh nhân
    private String dob;     // Ngày sinh
    private String gender;  // Giới tính
    private String address; // Địa chỉ
    private String role;    // PATIENT hoặc DOCTOR (mặc định nên là PATIENT)

    // Các trường cũ của Bác sĩ (có thể để null nếu là bệnh nhân)
    private Integer specialtyId;
    private String title; 
    private Integer experience;
}