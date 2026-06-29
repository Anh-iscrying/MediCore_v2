package com.medicore.repository;

import com.medicore.entity.user.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Integer> {
    long countBySpecialtyId(Integer specialtyId);
    List<Doctor> findBySpecialtyId(Integer specialtyId);

    @Query("SELECT d.specialty.id, COUNT(d) FROM Doctor d WHERE d.specialty IS NOT NULL GROUP BY d.specialty.id")
    List<Object[]> countGroupBySpecialtyId();
}