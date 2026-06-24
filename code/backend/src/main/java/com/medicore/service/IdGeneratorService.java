package com.medicore.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public interface IdGeneratorService {
    String generatePatientCode();
    String generateEmrCode();
    String generateDoctorCode();
}