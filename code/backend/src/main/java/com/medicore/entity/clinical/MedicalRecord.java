package com.medicore.entity.clinical;


import com.medicore.common.base.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "medical_records")
@Getter @Setter
public class MedicalRecord extends BaseEntity {
    @Column(unique = true, nullable = false)
    private String emrCode;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Column(columnDefinition = "TEXT")
    private String clinicalNote;
    
    @Column(columnDefinition = "TEXT")
    private String historySummary; // AI tóm tắt
}