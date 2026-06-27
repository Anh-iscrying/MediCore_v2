package com.medicore.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicineRequest {
    @NotBlank(message = "Tên thuốc không được để trống")
    private String name;

    @NotBlank(message = "Đơn vị tính không được để trống")
    private String unit;

    private String category;
    private Double price;
    private Integer stock;
    private String manufacturer;
}
