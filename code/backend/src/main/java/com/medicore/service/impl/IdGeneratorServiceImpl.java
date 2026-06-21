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
        Long nextVal = jdbcTemplate.queryForObject("SELECT nextval('patient_code_seq')", Long.class);
        int year = LocalDate.now().getYear();
        return String.format("PAT-%d-%04d", year, nextVal); // Kết quả: PAT-2024-0001
    }

    @Override
    public String generateDoctorCode() {
        Long nextVal = jdbcTemplate.queryForObject("SELECT nextval('doctor_code_seq')", Long.class);
        return String.format("DOC-%04d", nextVal); // Kết quả: DOC-0001
    }
}