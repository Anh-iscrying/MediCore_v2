package com.medicore.service;

import com.medicore.dto.request.MedicalRecordRequest;
import com.medicore.dto.response.MedicalRecordResponse; // Thêm import
import java.util.List;

public interface MedicalRecordService {
    // Hàm xử lý lưu toàn bộ hồ sơ, bệnh và đơn thuốc
    void createMedicalRecord(MedicalRecordRequest request);
    List<MedicalRecordResponse> getHistoryByEmail(String email);
}