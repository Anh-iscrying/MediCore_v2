package com.medicore.service.impl;

import com.medicore.common.constants.AppointmentStatus; // Import Enum chuẩn
import com.medicore.dto.request.MedicalRecordRequest;
import com.medicore.entity.clinical.*;
import com.medicore.repository.*;
import com.medicore.service.IdGeneratorService;
import com.medicore.service.MedicalRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime; // Dùng OffsetDateTime thay vì LocalDateTime
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class MedicalRecordServiceImpl implements MedicalRecordService {

    private final MedicalRecordRepository recordRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionDetailRepository prescriptionDetailRepository;
    private final MedicineRepository medicineRepository; // Cần cái này để tìm thuốc
    private final IdGeneratorService idGeneratorService;

    @Override
    @Transactional
    public void createMedicalRecord(MedicalRecordRequest request) {
        // 1. Tìm lịch hẹn
        var appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));

        // 2. Tạo mã hồ sơ (MC-15)
        String emrCode = idGeneratorService.generateEmrCode();

        // 3. Lưu MedicalRecord (Sửa lỗi OffsetDateTime)
        MedicalRecord record = MedicalRecord.builder()
                .emrCode(emrCode)
                .appointment(appointment)
                .patient(appointment.getPatient())
                .doctor(appointment.getDoctor())
                .clinicalNote(request.getClinicalNote())
                .historySummary(request.getHistorySummary())
                .careAdvice(request.getCareAdvice())
                .createdAt(OffsetDateTime.now()) // Sửa ở đây
                .build();
        record = recordRepository.save(record);

        // 4. Tạo Đơn thuốc
        Prescription prescription = Prescription.builder()
                .medicalRecord(record)
                .createdAt(OffsetDateTime.now()) // Sửa ở đây
                .build();
        prescription = prescriptionRepository.save(prescription);

        // 5. Lưu chi tiết thuốc
        if (request.getMedicines() != null) {
            for (var mReq : request.getMedicines()) {
                // Tìm thực thể Medicine thay vì chỉ dùng ID để tránh lỗi Builder
                var medicine = medicineRepository.findById(mReq.getMedicineId())
                        .orElseThrow(() -> new RuntimeException("Không thấy thuốc ID: " + mReq.getMedicineId()));

                PrescriptionDetail detail = PrescriptionDetail.builder()
                        .prescription(prescription)
                        .medicine(medicine) // Gán cả object Medicine vào
                        .quantity(mReq.getQuantity())
                        .dosageInstruction(mReq.getDosageInstruction())
                        .build();
                prescriptionDetailRepository.save(detail);
            }
        }

        // 6. Cập nhật trạng thái (Dùng Enum thay vì String)
        appointment.setStatus(AppointmentStatus.DONE); 
        appointmentRepository.save(appointment);
    }
}