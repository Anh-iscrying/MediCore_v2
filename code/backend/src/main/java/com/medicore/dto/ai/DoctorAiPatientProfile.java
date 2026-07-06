package com.medicore.dto.ai;

import com.medicore.common.constants.GenderType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorAiPatientProfile {
    private String fullName;
    private LocalDate dob;
    private Integer age;
    private GenderType gender;
}
