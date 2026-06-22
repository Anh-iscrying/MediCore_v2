package com.medicore.service.impl;

import com.medicore.service.IdGeneratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class IdGeneratorServiceImpl implements IdGeneratorService {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public String generatePatientCode() {
        try {
            jdbcTemplate.execute("CREATE SEQUENCE IF NOT EXISTS patient_code_seq START WITH 1");
            jdbcTemplate.execute("SELECT setval('patient_code_seq', COALESCE((SELECT MAX(CAST(SUBSTRING(patient_code FROM 10) AS INTEGER)) FROM patients), 0) + 1, false)");
        } catch (Exception e) {
            // Bỏ qua lỗi nếu không đủ quyền hoặc lỗi cú pháp định dạng
        }
        Long nextVal = jdbcTemplate.queryForObject("SELECT nextval('patient_code_seq')", Long.class);
        int year = LocalDate.now().getYear();
        return String.format("PAT-%d-%04d", year, nextVal); // Kết quả: PAT-2024-0001
    }

    @Override
    public String generateDoctorCode() {
        try {
            jdbcTemplate.execute("CREATE SEQUENCE IF NOT EXISTS doctor_code_seq START WITH 1");
            jdbcTemplate.execute("SELECT setval('doctor_code_seq', COALESCE((SELECT MAX(CAST(SUBSTRING(doctor_code FROM 5) AS INTEGER)) FROM doctors), 0) + 1, false)");
        } catch (Exception e) {
            // Bỏ qua lỗi
        }
        Long nextVal = jdbcTemplate.queryForObject("SELECT nextval('doctor_code_seq')", Long.class);
        return String.format("DOC-%04d", nextVal); // Kết quả: DOC-0001
    }
}