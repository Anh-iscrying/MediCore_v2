package com.medicore;

import com.medicore.repository.SpecialtyRepository;
import com.medicore.repository.PatientRepository;
import com.medicore.repository.DoctorRepository;
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

    @Test
    void contextLoads() {
        // Test này kiểm tra xem Spring có khởi tạo được toàn bộ hệ thống không.
    }

    @Test
    void printDatabaseData() {
        System.out.println("==================================================");
        System.out.println("=== DATA FROM SUPABASE DATABASE ===");
        
        System.out.println("--- Specialties ---");
        specialtyRepository.findAll().forEach(s -> 
            System.out.println("  [Specialty] ID: " + s.getId() + " | Name: " + s.getSpecialtyName())
        );

        System.out.println("--- Patients ---");
        patientRepository.findAll().forEach(p -> 
            System.out.println("  [Patient] ID: " + p.getId() + " | Code: " + p.getPatientCode() + " | Name: " + p.getFullName() + " | Phone: " + p.getPhone())
        );

        System.out.println("--- Doctors ---");
        doctorRepository.findAll().forEach(d -> 
            System.out.println("  [Doctor] ID: " + d.getId() + " | Code: " + d.getDoctorCode() + " | Name: " + d.getDoctorName() + " | Phone: " + d.getPhone())
        );
        System.out.println("==================================================");
    }
}