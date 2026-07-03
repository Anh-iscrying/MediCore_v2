package com.medicore.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.ai")
public class AiProperties {
    private String baseUrl;
    private String apiKey;
    private String model = "cx/gpt-5.5";
    private int timeoutMs = 30000;
    private double temperature = 0.4;
    private int maxInputChars = 4000;
    private int maxHistoryMessages = 10;
    private int maxImagesPerMessage = 3;
    private long maxImageBytes = 5 * 1024 * 1024;
    private List<String> allowedImageMimeTypes = new ArrayList<>(List.of("image/png", "image/jpeg", "image/webp"));
}
