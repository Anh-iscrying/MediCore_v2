package com.medicore.config;

import com.medicore.entity.catalog.Specialty;
import com.medicore.repository.SpecialtyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final SpecialtyRepository specialtyRepository;
    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Tạo bảng auth_credentials nếu chưa có
        try {
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS public.auth_credentials (" +
                    "email varchar(100) PRIMARY KEY, " +
                    "password_hash varchar(255) NOT NULL, " +
                    "role varchar(20) NOT NULL, " +
                    "doctor_id integer REFERENCES public.doctors(id) ON DELETE CASCADE" +
                    ")");
        } catch (Exception e) {
            System.err.println(">> DataSeeder Error: Không thể tạo bảng auth_credentials: " + e.getMessage());
        }

        // 2. Seed admin mẫu
        try {
            Integer adminCount = jdbcTemplate.queryForObject("SELECT count(*) FROM public.auth_credentials WHERE email = 'admin@medicore.com'", Integer.class);
            if (adminCount == null || adminCount == 0) {
                String encodedPassword = passwordEncoder.encode("admin123");
                jdbcTemplate.update("INSERT INTO public.auth_credentials (email, password_hash, role) VALUES ('admin@medicore.com', ?, 'ADMIN')", encodedPassword);
                System.out.println(">> DataSeeder: Đã khởi tạo tài khoản admin mẫu.");
            }
        } catch (Exception e) {
            System.err.println(">> DataSeeder Error: Không thể seed tài khoản admin: " + e.getMessage());
        }

        // 3. Tạo index chống đặt trùng lịch
        try {
            jdbcTemplate.execute("DROP INDEX IF EXISTS public.uk_appointments_doctor_date_time");
            jdbcTemplate.execute("DROP INDEX IF EXISTS public.uk_appointments_doctor_date_time_active");
            jdbcTemplate.execute("DROP INDEX IF EXISTS public.uk_appointments_patient_active");
            jdbcTemplate.execute("CREATE UNIQUE INDEX IF NOT EXISTS uk_appointments_doctor_date_time_active " +
                    "ON public.appointments (doctor_id, appointment_date, time_slot) WHERE status IN ('WAITING', 'CONFIRMED', 'IN_PROGRESS')");
            jdbcTemplate.execute("CREATE UNIQUE INDEX IF NOT EXISTS uk_appointments_patient_active " +
                    "ON public.appointments (patient_id) WHERE status IN ('WAITING', 'CONFIRMED', 'IN_PROGRESS')");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date_status " +
                    "ON public.appointments (doctor_id, appointment_date, status)");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_doctor_schedules_doctor_date " +
                    "ON public.doctor_schedules (doctor_id, work_date)");
            jdbcTemplate.execute("CREATE UNIQUE INDEX IF NOT EXISTS uk_doctor_schedules_doctor_date_time " +
                    "ON public.doctor_schedules (doctor_id, work_date, time_slot)");
        } catch (Exception e) {
            System.err.println(">> DataSeeder Error: Không thể tạo index lịch hẹn: " + e.getMessage());
        }

        // 4. Khởi tạo chuyên khoa
        if (specialtyRepository.count() == 0) { // Chỉ thêm nếu bảng đang trống
            List<Specialty> initialSpecialties = List.of(
                Specialty.builder().specialtyName("Nội tổng quát").build(),
                Specialty.builder().specialtyName("Nhi khoa").build(),
                Specialty.builder().specialtyName("Sản phụ khoa").build(),
                Specialty.builder().specialtyName("Răng Hàm Mặt").build(),
                Specialty.builder().specialtyName("Tai Mũi Họng").build()
            );
            specialtyRepository.saveAll(initialSpecialties);
            System.out.println(">> DataSeeder: Đã khởi tạo danh mục chuyên khoa mẫu.");
        }
    }
}