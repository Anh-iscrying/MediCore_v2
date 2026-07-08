package com.medicore.controller.system;

import com.medicore.common.base.ApiResponse;
import com.medicore.dto.response.NotificationListResponse;
import com.medicore.dto.response.NotificationResponse;
import com.medicore.service.system.PatientNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class NotificationController {

    private final PatientNotificationService patientNotificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<NotificationListResponse>> getNotifications() {
        return ResponseEntity.ok(ApiResponse.success(patientNotificationService.getCurrentPatientNotifications(currentEmail())));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(patientNotificationService.markAsRead(id, currentEmail())));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<NotificationListResponse>> markAllAsRead() {
        return ResponseEntity.ok(ApiResponse.success(patientNotificationService.markAllAsRead(currentEmail())));
    }

    private String currentEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}
