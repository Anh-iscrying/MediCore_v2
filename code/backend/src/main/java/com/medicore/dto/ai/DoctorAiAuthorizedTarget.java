package com.medicore.dto.ai;

import com.medicore.entity.clinical.Appointment;
import com.medicore.entity.user.Doctor;
import com.medicore.entity.user.Patient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorAiAuthorizedTarget {
    private Doctor doctor;
    private Patient patient;
    private Appointment appointment;
}
