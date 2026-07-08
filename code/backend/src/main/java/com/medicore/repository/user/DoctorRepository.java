package com.medicore.repository.user;

import com.medicore.entity.user.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Integer> {
    long countBySpecialtyId(Integer specialtyId);
    List<Doctor> findBySpecialtyId(Integer specialtyId);

    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.specialty WHERE d.specialty.id = :specialtyId AND d.isActive = true")
    List<Doctor> findActiveBySpecialtyIdWithSpecialty(@Param("specialtyId") Integer specialtyId);

    @Query("SELECT d.specialty.id, COUNT(d) FROM Doctor d WHERE d.specialty IS NOT NULL GROUP BY d.specialty.id")
    List<Object[]> countGroupBySpecialtyId();

    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.specialty s " +
           "WHERE d.isActive = true AND (" +
           "LOWER(d.doctorName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.specialtyName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(d.bio) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(d.degree) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
           ")")
    List<Doctor> searchActiveDoctors(@Param("keyword") String keyword, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.specialty WHERE d.isActive = true")
    List<Doctor> findAllActiveDoctors(org.springframework.data.domain.Pageable pageable);
}