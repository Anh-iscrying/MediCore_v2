package com.medicore.entity.catalog;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.Map;

@Entity
@Table(name = "specialties")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Specialty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "specialty_name", nullable = false, unique = true, length = 100)
    private String specialtyName;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "exam_template", columnDefinition = "jsonb")
    private Map<String, Object> examTemplate;
}