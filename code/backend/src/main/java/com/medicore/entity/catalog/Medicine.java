package com.medicore.entity.catalog;

import com.medicore.common.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "medicines")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Medicine extends BaseEntity {
    @Column(name = "medicine_name", nullable = false)
    private String medicineName;

    private String unit; // Viên, Gói, Lọ
}