package com.medicore.entity.clinical;

import com.medicore.common.base.BaseEntity;
import com.medicore.common.constants.AppointmentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate; 
import com.medicore.entity.user.Patient;
import com.medicore.entity.user.Doctor;

@Entity
@Table(name = "appointments")
@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", referencedColumnName = "patient_code")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "time_slot", nullable = false)
    private String timeSlot;

    @Column(name = "symptoms_initial", columnDefinition = "TEXT")
    private String symptomsInitial;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.WAITING;
}