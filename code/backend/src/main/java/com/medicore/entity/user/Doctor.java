package com.medicore.entity.user;

import com.medicore.common.base.BaseEntity;
import com.medicore.entity.catalog.Specialty;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;

@Entity
@Table(name = "doctors")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Doctor extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialty_id")
    private Specialty specialty;

    @Column(name = "doctor_code", nullable = false, unique = true, length = 20)
    private String doctorCode; // DOC-NNNN

    @Column(name = "doctor_name", nullable = false)
    private String doctorName;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "degree")
    private String degree;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "experience_years")
    private Integer experienceYears;

   @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "achievements", columnDefinition = "text[]")
    private List<String> achievements;
}