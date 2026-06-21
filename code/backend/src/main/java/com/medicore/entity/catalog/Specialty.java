package com.medicore.entity.catalog;

import com.medicore.common.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "specialties")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Specialty extends BaseEntity {
    @Column(name = "specialty_name", nullable = false, unique = true)
    private String specialtyName;

    private String location; // Vị trí phòng khám (VD: Tầng 2, Phòng 201)
}