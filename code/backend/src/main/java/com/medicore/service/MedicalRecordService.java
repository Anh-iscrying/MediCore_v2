package com.medicore.service;

import com.medicore.dto.request.MedicalRecordRequest;
import com.medicore.dto.response.MedicalRecordResponse;

import java.util.List;

public interface MedicalRecordService {
    
    // Tạo hồ sơ bệnh án (Kết hợp trả về Response từ MC-09-v1)
    MedicalRecordResponse createMedicalRecord(MedicalRecordRequest request);

    // Lấy hồ sơ theo ID (Từ HEAD)
    MedicalRecordResponse getById(Integer id);

    // Lấy hồ sơ theo ID cuộc hẹn và email bệnh nhân (Từ MC-09-v1)
    MedicalRecordResponse getRecordByAppointment(Integer appointmentId, String email);

    // Lấy danh sách lịch sử bệnh án của bệnh nhân hiện tại (Hợp nhất từ cả hai nhánh)
    List<MedicalRecordResponse> getCurrentPatientRecords(String email);

    // Lưu trữ file PDF bệnh án (Tính năng mới từ MC-09-v1)
    void uploadPdf(Integer appointmentId, byte[] pdfBytes);
}