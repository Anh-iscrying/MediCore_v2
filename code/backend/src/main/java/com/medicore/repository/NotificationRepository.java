package com.medicore.repository;

import com.medicore.entity.notification.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findTop20ByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);
    long countByRecipientEmailAndReadAtIsNull(String recipientEmail);
    List<Notification> findByRecipientEmailAndReadAtIsNull(String recipientEmail);
    boolean existsByRecipientEmailAndAppointmentIdAndType(String recipientEmail, Integer appointmentId, String type);
}
