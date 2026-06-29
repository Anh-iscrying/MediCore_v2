package com.medicore.service;

import com.medicore.dto.request.MedicalRecordRequest;

public interface MedicalRecordService {
    // Hàm xử lý lưu toàn bộ hồ sơ, bệnh và đơn thuốc
    void createMedicalRecord(MedicalRecordRequest request);
}