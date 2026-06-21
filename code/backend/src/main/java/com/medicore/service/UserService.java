package com.medicore.service;

import com.medicore.dto.request.UserRegisterRequest;
import com.medicore.entity.user.User;

public interface UserService {
    User register(UserRegisterRequest request);
}