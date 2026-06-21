package com.medicore.entity.user;

import com.medicore.common.base.BaseEntity;
import com.medicore.entity.catalog.Specialty;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "doctors")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Doctor extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // Mỗi bác sĩ có 1 tài khoản đăng nhập

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialty_id")
    private Specialty specialty; // Bác sĩ thuộc về 1 chuyên khoa

    @Column(name = "doctor_code", nullable = false, unique = true, length = 20)
    private String doctorCode; // DOC-NNNN

    @Column(name = "doctor_name", nullable = false)
    private String doctorName;
}