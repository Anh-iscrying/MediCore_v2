package com.medicore.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.ai")
public class AiProperties {
    private String baseUrl;
    private String apiKey;
    private String model;
    private int timeoutMs;
    private double temperature;
    private boolean routePlannerEnabled;
    private boolean keywordFallbackEnabled;
    private double plannerTemperature;
    private int plannerMaxTokens;
    private boolean jsonResponseFormatEnabled;
    private int maxInputChars;
    private int maxHistoryMessages;
    private int maxImagesPerMessage;
    private long maxImageBytes;
    private List<String> allowedImageMimeTypes;
    private boolean contextRetryEnabled = true;
    private int contextRetryMaxAttempts = 1;
}
