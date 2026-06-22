package com.medicore.entity.user;

import com.medicore.common.constants.UserRole;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "auth_credentials")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class AuthCredentials {

    @Id
    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private UserRole role;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;
}
