package com.medicore;

import com.medicore.repository.user.SpecialtyRepository;
import com.medicore.repository.user.PatientRepository;
import com.medicore.repository.user.DoctorRepository;
import com.medicore.repository.clinical.MedicalRecordRepository;
import com.medicore.repository.clinical.PrescriptionDetailRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class MediCoreApplicationTests {

    @Autowired
    private SpecialtyRepository specialtyRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private PrescriptionDetailRepository prescriptionDetailRepository;

    @Test
    void contextLoads() {
        // Test này kiểm tra xem Spring có khởi tạo được toàn bộ hệ thống không.
    }
}