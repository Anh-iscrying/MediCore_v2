package com.medicore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineResponse {
    private Integer id;
    private String name;
    private String code;
    private String category;
    private String unit;
    private Double price;
    private Integer stock;
    private String manufacturer;
    private String status; // available, low, out
}
