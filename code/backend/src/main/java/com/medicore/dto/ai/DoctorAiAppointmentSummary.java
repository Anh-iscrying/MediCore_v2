package com.medicore.dto.ai;

import com.medicore.common.constants.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorAiAppointmentSummary {
    private LocalDate appointmentDate;
    private String timeSlot;
    private AppointmentStatus status;
    private String symptomsInitial;
    private String doctorName;
    private String specialtyName;
}
