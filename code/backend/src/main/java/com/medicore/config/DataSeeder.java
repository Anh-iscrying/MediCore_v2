package com.medicore.config;

import com.medicore.entity.catalog.Specialty;
import com.medicore.repository.SpecialtyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final SpecialtyRepository specialtyRepository;

    @Override
    public void run(String... args) throws Exception {
        if (specialtyRepository.count() == 0) { // Chỉ thêm nếu bảng đang trống
            List<Specialty> initialSpecialties = List.of(
                Specialty.builder().specialtyName("Nội tổng quát").location("Tầng 1 - Khu A").build(),
                Specialty.builder().specialtyName("Nhi khoa").location("Tầng 2 - Khu B").build(),
                Specialty.builder().specialtyName("Sản phụ khoa").location("Tầng 2 - Khu C").build(),
                Specialty.builder().specialtyName("Răng Hàm Mặt").location("Tầng 3 - Khu A").build(),
                Specialty.builder().specialtyName("Tai Mũi Họng").location("Tầng 3 - Khu B").build()
            );
            specialtyRepository.saveAll(initialSpecialties);
            System.out.println(">> DataSeeder: Đã khởi tạo danh mục chuyên khoa mẫu.");
        }
    }
}