package com.medicore.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiseaseRequest {
    @NotBlank(message = "Mã ICD-10 không được để trống")
    @Size(max = 10, message = "Mã ICD-10 không được vượt quá 10 ký tự")
    private String code;

    @NotBlank(message = "Tên bệnh không được để trống")
    private String name;

    private String category;
    private String description;
}
