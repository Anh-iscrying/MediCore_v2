package com.medicore.repository.auth;

import com.medicore.entity.user.AuthCredentials;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuthCredentialsRepository extends JpaRepository<AuthCredentials, String> {
    Optional<AuthCredentials> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<AuthCredentials> findByDoctorId(Integer doctorId);
    Optional<AuthCredentials> findByPatientId(Integer patientId);

    @Query("SELECT ac.doctor.id, ac.email FROM AuthCredentials ac WHERE ac.doctor IS NOT NULL")
    List<Object[]> findAllDoctorEmails();
}
