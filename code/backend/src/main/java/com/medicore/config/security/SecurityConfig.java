package com.medicore.config.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/ws/**").permitAll()

                // 1. Các API cụ thể cho Bệnh nhân (Phải để lên đầu)
                .requestMatchers(HttpMethod.GET, "/clinical/medical-records/me").hasRole("PATIENT")
                .requestMatchers(HttpMethod.GET, "/clinical/medical-records/appointment/**").hasAnyRole("ADMIN", "DOCTOR", "PATIENT")
                
                // 2. Các API cho Bác sĩ xử lý hồ sơ
                .requestMatchers(HttpMethod.POST, "/clinical/medical-records").hasAnyRole("ADMIN", "DOCTOR")
                .requestMatchers(HttpMethod.POST, "/clinical/medical-records/appointment/*/upload-pdf").hasAnyRole("ADMIN", "DOCTOR")

                // 3. API Hàng chờ/Lâm sàng chung: Chỉ ADMIN hoặc DOCTOR mới được truy cập
                .requestMatchers("/clinical/**").hasAnyRole("ADMIN", "DOCTOR")

                // 4. API quản trị bác sĩ/chuyên khoa
                .requestMatchers(HttpMethod.POST, "/doctors/**", "/specialties/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/doctors/**", "/specialties/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/doctors/**", "/specialties/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/doctors/profile").hasRole("DOCTOR")
                .requestMatchers(HttpMethod.PUT, "/doctors/**", "/specialties/**").hasRole("ADMIN")

                // Các API còn lại
                .anyRequest().authenticated()
        )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(origin -> !origin.isEmpty())
            .toList());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilterRegistration() {
        FilterRegistrationBean<CorsFilter> registration = new FilterRegistrationBean<>(new CorsFilter(corsConfigurationSource()));
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }

    @Bean
    public org.springframework.security.crypto.password.PasswordEncoder passwordEncoder() {
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    }
}