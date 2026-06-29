package com.medicore.repository;

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
    boolean existsByDoctorIdAndAppointmentDate(Integer doctorId, LocalDate appointmentDate);
    boolean existsByDoctorIdAndAppointmentDateAndTimeSlot(Integer doctorId, LocalDate appointmentDate, String timeSlot);
    boolean existsByDoctorIdAndAppointmentDateAndTimeSlotAndIdNot(Integer doctorId, LocalDate appointmentDate, String timeSlot, Integer id);

    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.patient LEFT JOIN FETCH a.doctor d LEFT JOIN FETCH d.specialty")
    List<Appointment> findAllWithRelations();
}
