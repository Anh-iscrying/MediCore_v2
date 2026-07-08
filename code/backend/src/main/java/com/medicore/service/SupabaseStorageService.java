package com.medicore.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.exception.CustomBusinessException;
import com.medicore.config.SupabaseStorageProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SupabaseStorageService {
    private final SupabaseStorageProperties properties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    public void uploadPdf(String objectPath, byte[] content) {
        ensureConfigured();
        String endpoint = storageBaseUrl() + "/object/" + properties.getMedicalRecordsBucket() + "/" + objectPath;
        HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint))
                .timeout(Duration.ofSeconds(30))
                .header("Authorization", "Bearer " + properties.getServiceRoleKey())
                .header("apikey", properties.getServiceRoleKey())
                .header("Content-Type", MediaType.APPLICATION_PDF_VALUE)
                .header("x-upsert", "true")
                .POST(HttpRequest.BodyPublishers.ofByteArray(content))
                .build();

        HttpResponse<String> response = send(request);
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new CustomBusinessException(ErrorCodes.INTERNAL_SERVER_ERROR,
                    "Không thể tải PDF hồ sơ lên Supabase Storage");
        }
    }

    public byte[] downloadPdf(String objectPath) {
        ensureConfigured();
        String endpoint = storageBaseUrl() + "/object/" + properties.getMedicalRecordsBucket() + "/" + objectPath;
        HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint))
                .timeout(Duration.ofSeconds(30))
                .header("Authorization", "Bearer " + properties.getServiceRoleKey())
                .header("apikey", properties.getServiceRoleKey())
                .GET()
                .build();

        try {
            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new CustomBusinessException(ErrorCodes.INTERNAL_SERVER_ERROR,
                        "Không thể tải xuống PDF hồ sơ từ Supabase Storage");
            }
            return response.body();
        } catch (IOException ex) {
            throw new CustomBusinessException(ErrorCodes.INTERNAL_SERVER_ERROR, "Không thể kết nối Supabase Storage để tải PDF");
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new CustomBusinessException(ErrorCodes.INTERNAL_SERVER_ERROR, "Kết nối tải PDF bị gián đoạn");
        }
    }

    public String createSignedUrl(String objectPath) {
        if (!StringUtils.hasText(objectPath) || !isConfigured()) {
            return null;
        }

        try {
            String endpoint = storageBaseUrl() + "/object/sign/" + properties.getMedicalRecordsBucket() + "/" + objectPath;
            String body = objectMapper.writeValueAsString(Map.of("expiresIn", properties.getSignedUrlTtlSeconds()));
            HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint))
                    .timeout(Duration.ofSeconds(15))
                    .header("Authorization", "Bearer " + properties.getServiceRoleKey())
                    .header("apikey", properties.getServiceRoleKey())
                    .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = send(request);
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return null;
            }
            JsonNode node = objectMapper.readTree(response.body());
            String signedUrl = node.path("signedURL").asText(null);
            if (!StringUtils.hasText(signedUrl)) {
                signedUrl = node.path("signedUrl").asText(null);
            }
            if (!StringUtils.hasText(signedUrl)) {
                return null;
            }
            if (signedUrl.startsWith("http")) {
                return signedUrl;
            }
            String normalizedSignedUrl = signedUrl.startsWith("/") ? signedUrl : "/" + signedUrl;
            return storageBaseUrl() + normalizedSignedUrl;
        } catch (Exception ex) {
            return null;
        }
    }

    public boolean isConfigured() {
        return StringUtils.hasText(properties.getUrl())
                && isHttpUrl(properties.getUrl())
                && StringUtils.hasText(properties.getServiceRoleKey());
    }

    private void ensureConfigured() {
        if (!StringUtils.hasText(properties.getUrl()) || !StringUtils.hasText(properties.getServiceRoleKey())) {
            throw new CustomBusinessException(ErrorCodes.INTERNAL_SERVER_ERROR,
                    "Thiếu cấu hình SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY để lưu PDF hồ sơ");
        }
        if (!isHttpUrl(properties.getUrl())) {
            throw new CustomBusinessException(ErrorCodes.INTERNAL_SERVER_ERROR,
                    "SUPABASE_URL phải là URL HTTPS của project Supabase, không phải DB_URL JDBC");
        }
    }

    private HttpResponse<String> send(HttpRequest request) {
        try {
            return httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        } catch (IOException ex) {
            throw new CustomBusinessException(ErrorCodes.INTERNAL_SERVER_ERROR, "Không thể kết nối Supabase Storage");
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new CustomBusinessException(ErrorCodes.INTERNAL_SERVER_ERROR, "Kết nối Supabase Storage bị gián đoạn");
        }
    }

    private boolean isHttpUrl(String url) {
        if (!StringUtils.hasText(url)) {
            return false;
        }
        String normalized = url.trim().toLowerCase();
        return normalized.startsWith("https://") || normalized.startsWith("http://");
    }

    private String storageBaseUrl() {
        return normalizedUrl() + "/storage/v1";
    }

    private String normalizedUrl() {
        String url = properties.getUrl().trim();
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
