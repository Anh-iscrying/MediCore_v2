package com.medicore.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientRequest {
    @NotBlank(message = "Tên bệnh nhân không được để trống")
    private String name;

    @NotBlank(message = "Ngày sinh không được để trống")
    private String dateOfBirth;

    private String gender;

    private String phone;
    private String address;
    private String email;
    private String insuranceNumber;
    private String status;
    
    // Mẹo: Thêm cái này để dù Postman gửi "dob" hay "dateOfBirth" đều chạy được
    @JsonProperty("dob") 
    public void setDob(String dob) {
        this.dateOfBirth = dob;
    }
}
