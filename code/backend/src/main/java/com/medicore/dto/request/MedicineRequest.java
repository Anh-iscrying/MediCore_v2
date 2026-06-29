package com.medicore.dto.request;

import jakarta.validation.constraints.Min;
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

    @Min(value = 0, message = "Đơn giá không được âm")
    private Double price;

    @Min(value = 0, message = "Tồn kho không được âm")
    private Integer stock;

    private String manufacturer;
}
