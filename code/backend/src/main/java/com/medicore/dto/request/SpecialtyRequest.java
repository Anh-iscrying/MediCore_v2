package com.medicore.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpecialtyRequest {
    @NotBlank(message = "Tên chuyên khoa không được để trống")
    private String name;

    private Map<String, Object> examTemplate;
}
