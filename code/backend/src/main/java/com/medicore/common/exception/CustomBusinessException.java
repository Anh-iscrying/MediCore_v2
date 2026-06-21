package com.medicore.common.exception;

import com.medicore.common.constants.ErrorCodes;
import lombok.Getter;

@Getter
public class CustomBusinessException extends RuntimeException {
    private final ErrorCodes errorCode;

    public CustomBusinessException(ErrorCodes errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}