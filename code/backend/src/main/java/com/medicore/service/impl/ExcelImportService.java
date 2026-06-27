package com.medicore.service.impl;

import com.medicore.entity.catalog.Disease;
import com.medicore.entity.catalog.Medicine;
import com.medicore.repository.DiseaseRepository;
import com.medicore.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExcelImportService {

    private final DiseaseRepository diseaseRepository;
    private final MedicineRepository medicineRepository;

    /**
     * Import Danh mục bệnh ICD-10
     * Cấu trúc file Excel: Cột A (Code), B (Name), C (Category), D (Description)
     */
    @Transactional
    public void importDiseases(MultipartFile file) {
        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            List<Disease> diseases = new ArrayList<>();

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // Bỏ qua tiêu đề

                String code = getCellValue(row.getCell(0));
                if (code == null || code.isEmpty()) continue;

                // Logic AC-01: Nếu tồn tại thì cập nhật thông tin mới nhất
                Disease disease = diseaseRepository.findById(code).orElse(new Disease());
                disease.setIcd10Code(code);
                disease.setDiseaseName(getCellValue(row.getCell(1)));
                disease.setCategory(getCellValue(row.getCell(2)));
                disease.setDescription(getCellValue(row.getCell(3)));
                
                if (disease.getCreatedAt() == null) {
                    disease.setCreatedAt(OffsetDateTime.now());
                }

                diseases.add(disease);
            }
            diseaseRepository.saveAll(diseases);
            log.info("Đã import thành công {} mã bệnh", diseases.size());
        } catch (Exception e) {
            log.error("Lỗi import bệnh: {}", e.getMessage());
            throw new RuntimeException("Không thể đọc file Excel bệnh: " + e.getMessage());
        }
    }

    /**
     * Import Danh mục thuốc
     * Cấu trúc file Excel: A (Name), B (Unit), C (Category), D (Price), E (Stock), F (Manufacturer)
     */
    @Transactional
    public void importMedicines(MultipartFile file) {
        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            List<Medicine> medicines = new ArrayList<>();

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue;

                String name = getCellValue(row.getCell(0));
                if (name == null || name.isEmpty()) continue;

                Medicine medicine = Medicine.builder()
                        .medicineName(name)
                        .unit(getCellValue(row.getCell(1)))
                        .category(getCellValue(row.getCell(2)))
                        .price(getNumericCellValue(row.getCell(3)))
                        .stock((int) getNumericCellValue(row.getCell(4)))
                        .manufacturer(getCellValue(row.getCell(5)))
                        .createdAt(OffsetDateTime.now())
                        .build();

                medicines.add(medicine);
            }
            medicineRepository.saveAll(medicines);
            log.info("Đã import thành công {} loại thuốc", medicines.size());
        } catch (Exception e) {
            log.error("Lỗi import thuốc: {}", e.getMessage());
            throw new RuntimeException("Không thể đọc file Excel thuốc: " + e.getMessage());
        }
    }

    // Hàm đọc chuỗi an toàn
    private String getCellValue(Cell cell) {
        if (cell == null) return null;
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue();
            case NUMERIC: return String.valueOf((int) cell.getNumericCellValue());
            default: return null;
        }
    }

    // Hàm đọc số an toàn
    private double getNumericCellValue(Cell cell) {
        if (cell == null) return 0;
        return cell.getCellType() == CellType.NUMERIC ? cell.getNumericCellValue() : 0;
    }
}