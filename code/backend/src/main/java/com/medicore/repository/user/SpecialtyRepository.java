package com.medicore.repository.user;

import com.medicore.entity.catalog.Specialty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpecialtyRepository extends JpaRepository<Specialty, Integer> {
    boolean existsBySpecialtyName(String specialtyName);
    boolean existsBySpecialtyNameAndIdNot(String specialtyName, Integer id);
}