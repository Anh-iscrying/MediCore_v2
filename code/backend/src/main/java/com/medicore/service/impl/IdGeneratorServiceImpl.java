package com.medicore.service.impl;

import com.medicore.service.IdGeneratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class IdGeneratorServiceImpl implements IdGeneratorService {

    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public String generatePatientCode() {
        Long seq = jdbcTemplate.queryForObject("SELECT nextval('patient_code_seq')", Long.class);
        int currentYear = LocalDate.now().getYear();
        return String.format("PAT-%d-%04d", currentYear, seq);
    }

    @Override
    @Transactional
    public String generateEmrCode() {
        Long seq = jdbcTemplate.queryForObject("SELECT nextval('emr_code_seq')", Long.class);
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return String.format("EMR-%s-%03d", datePart, seq);
    }

    @Override
    @Transactional
    public String generateDoctorCode() {
        // Nên dùng doctor_code_seq riêng để tránh nhảy số của Patient
        Long seq = jdbcTemplate.queryForObject("SELECT nextval('doctor_code_seq')", Long.class);
        return String.format("DOC-%04d", seq);
    }
}