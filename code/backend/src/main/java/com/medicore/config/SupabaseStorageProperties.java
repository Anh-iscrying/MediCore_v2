package com.medicore.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.supabase")
public class SupabaseStorageProperties {
    private String url;
    private String serviceRoleKey;
    private String medicalRecordsBucket;
    private long signedUrlTtlSeconds;
}
