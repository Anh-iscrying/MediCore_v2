package com.medicore.repository;

import com.medicore.entity.clinical.DoctorSchedule;
import com.medicore.entity.user.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Integer> {
    List<DoctorSchedule> findByDoctorIdAndWorkDate(Integer doctorId, LocalDate workDate);
    List<DoctorSchedule> findByDoctorId(Integer doctorId);
    List<DoctorSchedule> findByWorkDate(LocalDate workDate);
    List<DoctorSchedule> findByWorkDateBetween(LocalDate fromDate, LocalDate toDate);
    boolean existsByDoctorIdAndWorkDateAndTimeSlot(Integer doctorId, LocalDate workDate, String timeSlot);
    boolean existsByDoctorIdAndWorkDateAndTimeSlotAndIdNot(Integer doctorId, LocalDate workDate, String timeSlot, Integer id);

    // Xóa lịch tương lai chưa được đặt (Dùng cho AC-04)
    void deleteByDoctorAndWorkDateAfterAndIsBookedFalse(Doctor doctor, LocalDate date);
}