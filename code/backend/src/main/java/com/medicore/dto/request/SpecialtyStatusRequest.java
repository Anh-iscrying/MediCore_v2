package com.medicore.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpecialtyStatusRequest {
    @NotNull(message = "Trạng thái chuyên khoa không được để trống")
    private Boolean active;
}
