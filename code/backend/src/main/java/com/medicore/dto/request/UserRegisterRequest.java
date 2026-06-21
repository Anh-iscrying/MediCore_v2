package com.medicore.dto.request;

import com.medicore.common.constants.UserRole;
import com.medicore.common.constants.GenderType;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter @Setter
public class UserRegisterRequest {
    private String email;
    private String password;
    private UserRole role;
    
    // Bổ sung các trường từ MC-03
    private String fullName;
    private String phoneNumber;
    private LocalDate dob;
    private GenderType gender;
}