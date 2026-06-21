package com.medicore.entity.user;

import com.medicore.common.base.BaseEntity;
import com.medicore.common.constants.GenderType;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "patients")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Patient extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // Mỗi bệnh nhân có 1 tài khoản đăng nhập

    @Column(name = "patient_code", nullable = false, unique = true, length = 20)
    private String patientCode; // PAT-YYYY-NNNN

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private LocalDate dob; // Ngày sinh

    @Enumerated(EnumType.STRING)
    private GenderType gender;

    @Column(name = "phone_number", nullable = false, unique = true)
    private String phoneNumber;
}