package com.medicore.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SequenceResetTask {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Tự động chạy lúc 00:00:00 hàng ngày (nửa đêm)
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void resetEmrSequence() {
        try {
            log.info("Bắt đầu reset máy đếm EMR_CODE cho ngày mới...");
            jdbcTemplate.execute("ALTER SEQUENCE emr_code_seq RESTART WITH 1");
            log.info("Reset máy đếm thành công!");
        } catch (Exception e) {
            log.error("Lỗi khi reset máy đếm: {}", e.getMessage());
        }
    }
}