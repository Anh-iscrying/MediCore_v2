package com.medicore.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationInMs;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateToken(String email, String role, Integer doctorId, String doctorCode) {
        try {
            // Header
            Map<String, String> headerMap = new HashMap<>();
            headerMap.put("alg", "HS256");
            headerMap.put("typ", "JWT");
            String headerJson = objectMapper.writeValueAsString(headerMap);

            // Payload
            long now = System.currentTimeMillis();
            long expiry = now + jwtExpirationInMs;

            Map<String, Object> payloadMap = new HashMap<>();
            payloadMap.put("sub", email);
            payloadMap.put("role", role);
            payloadMap.put("doctorId", doctorId);
            payloadMap.put("doctorCode", doctorCode);
            payloadMap.put("iat", now / 1000);
            payloadMap.put("exp", expiry / 1000);
            String payloadJson = objectMapper.writeValueAsString(payloadMap);

            // Base64Url encode
            String base64Header = base64UrlEncode(headerJson.getBytes(StandardCharsets.UTF_8));
            String base64Payload = base64UrlEncode(payloadJson.getBytes(StandardCharsets.UTF_8));

            // Signature
            String signatureInput = base64Header + "." + base64Payload;
            String signature = hmacSha256(signatureInput, jwtSecret);

            return signatureInput + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi sinh JWT token", e);
        }
    }

    public boolean validateToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) return false;

            String header = parts[0];
            String payload = parts[1];
            String signature = parts[2];

            String signatureInput = header + "." + payload;
            String expectedSignature = hmacSha256(signatureInput, jwtSecret);

            if (!signature.equals(expectedSignature)) return false;

            // Check expiry
            byte[] decodedPayloadBytes = base64UrlDecode(payload);
            Map<?, ?> payloadMap = objectMapper.readValue(decodedPayloadBytes, Map.class);
            
            Number expNum = (Number) payloadMap.get("exp");
            if (expNum == null) return false;
            
            long exp = expNum.longValue();
            return exp >= System.currentTimeMillis() / 1000;
        } catch (Exception e) {
            return false;
        }
    }

    public String getEmailFromToken(String token) {
        try {
            String payload = token.split("\\.")[1];
            byte[] decodedPayloadBytes = base64UrlDecode(payload);
            Map<?, ?> payloadMap = objectMapper.readValue(decodedPayloadBytes, Map.class);
            return (String) payloadMap.get("sub");
        } catch (Exception e) {
            return null;
        }
    }

    public String getRoleFromToken(String token) {
        try {
            String payload = token.split("\\.")[1];
            byte[] decodedPayloadBytes = base64UrlDecode(payload);
            Map<?, ?> payloadMap = objectMapper.readValue(decodedPayloadBytes, Map.class);
            return (String) payloadMap.get("role");
        } catch (Exception e) {
            return null;
        }
    }

    private String base64UrlEncode(byte[] input) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(input);
    }

    private byte[] base64UrlDecode(String input) {
        return Base64.getUrlDecoder().decode(input);
    }

    private String hmacSha256(String data, String secret) throws Exception {
        byte[] hash = secret.getBytes(StandardCharsets.UTF_8);
        Mac sha256Hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(hash, "HmacSHA256");
        sha256Hmac.init(secretKey);
        byte[] signedBytes = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return base64UrlEncode(signedBytes);
    }
}
