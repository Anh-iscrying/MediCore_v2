package com.medicore.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorProfileRequest {
    @NotBlank(message = "Tên bác sĩ không được để trống")
    @JsonAlias({"doctorName", "doctor_name"})
    private String name;

    @NotNull(message = "Chuyên khoa không được để trống")
    private Integer specialtyId;

    @JsonAlias({"degree"})
    private String title;

    private String bio;

    private String phone;

    @Min(value = 0, message = "Số năm kinh nghiệm không được nhỏ hơn 0")
    @JsonAlias({"experienceYears", "experience_years"})
    private Integer experience;

    @JsonAlias({"avatar", "avatar_url"})
    private String avatarUrl;
}
