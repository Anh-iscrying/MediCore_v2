package com.medicore.entity.user;

import com.medicore.common.base.BaseEntity;
import com.medicore.common.constants.UserRole;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users") // Map với bảng users trong DB
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING) // Lưu vào DB dưới dạng String ("ADMIN", "DOCTOR"...)
    @Column(name = "role", nullable = false)
    private UserRole role;
    
    @Builder.Default
    @Column(name = "is_active", nullable = false, columnDefinition = "boolean default true")
    private Boolean isActive = true; 
}