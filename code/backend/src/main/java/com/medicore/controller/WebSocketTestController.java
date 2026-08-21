package com.medicore.controller;

import com.medicore.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test/ws")
@RequiredArgsConstructor
public class WebSocketTestController {

    private final NotificationService notificationService;

    // Test gửi cho tất cả (Broadcast)
    @PostMapping("/all")
    public String testAll(@RequestParam String msg) {
        notificationService.notifyQueueUpdate(msg);
        return "Đã gửi tới topic /topic/queue";
    }

    // Test gửi đích danh (Private)
    @PostMapping("/user")
    public String testUser(@RequestParam String email, @RequestParam String msg) {
        notificationService.notifyPatient(email, msg);
        return "Đã gửi tới user " + email;
    }
}