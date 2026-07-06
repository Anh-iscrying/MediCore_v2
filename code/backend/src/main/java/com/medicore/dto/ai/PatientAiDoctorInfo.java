package com.medicore.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

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
    private List<String> achievements;
}
