package com.medicore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorResponse {
    private Integer id;
    private String name;
    private Integer specialtyId;
    private String specialtyName;
    private String title;
    private String bio;
    private String email;
    private String phone;
    private Integer experience;
    private String status;
    private String avatar;
    private String doctorCode;
}
