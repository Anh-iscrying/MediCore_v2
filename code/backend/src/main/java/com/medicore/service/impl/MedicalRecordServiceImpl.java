package com.medicore.service.impl;

import com.medicore.common.constants.AppointmentStatus; // Import Enum chuẩn
import com.medicore.dto.request.MedicalRecordRequest;
import com.medicore.entity.catalog.Disease;
import com.medicore.entity.clinical.*;
import com.medicore.repository.*;
import com.medicore.service.IdGeneratorService;
import com.medicore.service.MedicalRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

import java.time.OffsetDateTime; // Dùng OffsetDateTime thay vì LocalDateTime
import java.util.ArrayList;

@Slf4j
@Service
@RequiredArgsConstructor
public class MedicalRecordServiceImpl implements MedicalRecordService {

    private final MedicalRecordRepository recordRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionDetailRepository prescriptionDetailRepository;
    private final MedicineRepository medicineRepository; // Cần cái này để tìm thuốc
    private final IdGeneratorService idGeneratorService;
    private final DiseaseRepository diseaseRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void createMedicalRecord(MedicalRecordRequest request) {
        // 1. Tìm lịch hẹn
        var appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));

        // 2. Tạo mã hồ sơ (MC-15)
        String emrCode = idGeneratorService.generateEmrCode();

        final String[] finalCodeArr = { null };

                if (request.getDiagnoses() != null && !request.getDiagnoses().isEmpty()) {
                        // Tìm cái nào là Primary
                        for (var diag : request.getDiagnoses()) {
                        if (Boolean.TRUE.equals(diag.getIsPrimary())) {
                                finalCodeArr[0] = diag.getIcd10Code();
                                break;
                        }
                        }
                        // Nếu không thấy cái nào Primary, lấy cái đầu tiên
                        if (finalCodeArr[0] == null) {
                        finalCodeArr[0] = request.getDiagnoses().get(0).getIcd10Code();
                        }
                }

                // 2. Gán vào một biến String bình thường để Java không báo lỗi nữa
                String primaryCode = finalCodeArr[0];

                // 3. Tìm thực thể Disease (Dùng biến primaryCode mới này)
                Disease primaryDisease = null;
                if (primaryCode != null) {
                        // Tạo biến tempFinalCode để dùng trong orElseThrow nếu cần
                        final String tempFinalCode = primaryCode; 
                        primaryDisease = diseaseRepository.findById(tempFinalCode)
                                .orElseThrow(() -> new RuntimeException("Mã bệnh không tồn tại: " + tempFinalCode));
                }

        // 3. Lưu MedicalRecord (Sửa lỗi OffsetDateTime)
        MedicalRecord record = MedicalRecord.builder()
                .emrCode(emrCode)
                .appointment(appointment)
                .patient(appointment.getPatient())
                .doctor(appointment.getDoctor())
                .clinicalNote(request.getClinicalNote())
                .historySummary(request.getHistorySummary())
                .careAdvice(request.getCareAdvice())
                .diagnosisIcd10(primaryDisease)
                .additionalData(request.getSpecialtyData())
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
                        .isFromTemplate(mReq.getIsFromTemplate())
                        .build();
                prescriptionDetailRepository.save(detail);
            }
        }

        // 6. Cập nhật trạng thái (Dùng Enum thay vì String)
        appointment.setStatus(AppointmentStatus.DONE); 
        appointmentRepository.save(appointment);
    }
}