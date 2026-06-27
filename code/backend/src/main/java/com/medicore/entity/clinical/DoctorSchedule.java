package com.medicore.entity.clinical;

import com.medicore.entity.user.Doctor;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "doctor_schedules")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class DoctorSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "time_slot", nullable = false, length = 50)
    private String timeSlot;

    @Builder.Default
    @Column(name = "is_booked")
    private Boolean isBooked = false;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}