package com.medicore.repository;

import com.medicore.common.constants.AppointmentStatus;
import com.medicore.entity.clinical.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    List<Appointment> findByPatientPatientCode(String patientCode);
    List<Appointment> findByDoctorId(Integer doctorId);
    List<Appointment> findByDoctorIdAndAppointmentDate(Integer doctorId, LocalDate appointmentDate);
    List<Appointment> findByDoctorIdAndAppointmentDateAndStatusNot(Integer doctorId, LocalDate appointmentDate, AppointmentStatus status);
    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.patient LEFT JOIN FETCH a.doctor d LEFT JOIN FETCH d.specialty WHERE d.id = :doctorId AND a.appointmentDate = :appointmentDate AND a.status IN :statuses ORDER BY a.timeSlot ASC")
    List<Appointment> findByDoctorIdAndAppointmentDateAndStatusIn(
            @Param("doctorId") Integer doctorId,
            @Param("appointmentDate") LocalDate appointmentDate,
            @Param("statuses") List<AppointmentStatus> statuses);
    boolean existsByDoctorIdAndAppointmentDate(Integer doctorId, LocalDate appointmentDate);
    boolean existsByPatientPatientCodeAndStatusIn(String patientCode, List<AppointmentStatus> statuses);
    boolean existsByPatientPatientCodeAndStatusInAndIdNot(String patientCode, List<AppointmentStatus> statuses, Integer id);
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.patient.patientCode = :patientCode AND a.createdAt >= :startOfDay AND a.createdAt < :startOfNextDay")
    long countAppointmentsCreatedToday(
            @Param("patientCode") String patientCode,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("startOfNextDay") LocalDateTime startOfNextDay);

    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.patient LEFT JOIN FETCH a.doctor d LEFT JOIN FETCH d.specialty")
    List<Appointment> findAllWithRelations();
}
