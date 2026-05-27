package com.bloodlink.service.interfaces;

import com.bloodlink.dto.DonorDTO;

import java.util.List;

/**
 * AI Recommendation service interface.
 * Defines the contract for the smart donor matching algorithm.
 */
public interface IAIRecommendationService {
    List<DonorDTO> recommendDonors(Long patientId, int limit);
    List<DonorDTO> recommendDonorsForRequest(Long patientId, String bloodGroup, Double latitude, Double longitude, int limit);
    double calculateCompatibilityScore(String donorBloodGroup, String patientBloodGroup);
}
