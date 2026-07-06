package com.medicore.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.appointment")
public class AppointmentRulesProperties {
    private int minHoursBeforeBooking;
    private int minHoursBeforeCancellation;
    private int maxActivePerPatient;
    private int maxCreatedPerPatientPerDay;
}
