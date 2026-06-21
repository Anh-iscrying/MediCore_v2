package com.medicore.entity.clinical;

import com.medicore.common.base.BaseEntity;
import com.medicore.entity.user.Doctor;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "doctor_schedules")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class DoctorSchedule extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    private LocalDate workDate;
    private String timeSlot;
    
    @Builder.Default
    private Boolean isBooked = false;
}