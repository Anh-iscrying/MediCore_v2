package com.medicore.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientAiDoctorInfo {
    private String doctorName;
    private String doctorCode;
    private String specialtyName;
    private String degree;
    private Integer experienceYears;
}
