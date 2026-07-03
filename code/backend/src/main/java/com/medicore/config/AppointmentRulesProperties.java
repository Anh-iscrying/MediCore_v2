package com.medicore.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.appointment")
public class AppointmentRulesProperties {
    private int minHoursBeforeBooking = 2;
    private int minHoursBeforeCancellation = 2;
    private int maxActivePerPatient = 3;
    private int maxCreatedPerPatientPerDay = 3;
}
