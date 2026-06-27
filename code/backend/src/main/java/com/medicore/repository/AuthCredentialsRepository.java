package com.medicore.repository;

import com.medicore.entity.user.AuthCredentials;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuthCredentialsRepository extends JpaRepository<AuthCredentials, String> {
    Optional<AuthCredentials> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<AuthCredentials> findByDoctorId(Integer doctorId);
}
