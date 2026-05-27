package com.bloodlink.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO for the Admin Dashboard statistics summary.
 * Provides platform-wide analytics for the admin panel.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsDTO {
    private long totalDonors;
    private long totalPatients;
    private long totalRequests;
    private long pendingRequests;
    private long acceptedRequests;
    private long completedRequests;
    private long totalActiveUsers;
    private long availableDonors;
    /** Map of blood group name -> count of available donors */
    private Map<String, Long> bloodAvailability;
}
