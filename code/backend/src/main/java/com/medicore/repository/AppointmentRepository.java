package com.medicore.repository;

import com.medicore.common.constants.AppointmentStatus;
import com.medicore.entity.clinical.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    List<Appointment> findByPatientPatientCode(String patientCode);
    List<Appointment> findByDoctorId(Integer doctorId);
    List<Appointment> findByDoctorIdAndAppointmentDate(Integer doctorId, LocalDate appointmentDate);
    List<Appointment> findByDoctorIdAndAppointmentDateAndStatusNot(Integer doctorId, LocalDate appointmentDate, AppointmentStatus status);
    boolean existsByDoctorIdAndAppointmentDate(Integer doctorId, LocalDate appointmentDate);
    boolean existsByPatientPatientCodeAndStatusNot(String patientCode, AppointmentStatus status);
    boolean existsByPatientPatientCodeAndStatusNotAndIdNot(String patientCode, AppointmentStatus status, Integer id);

    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.patient LEFT JOIN FETCH a.doctor d LEFT JOIN FETCH d.specialty")
    List<Appointment> findAllWithRelations();
}
