package com.bloodlink.service.impl;

import com.bloodlink.ai.DonorScoringEngine;
import com.bloodlink.dto.DonorDTO;
import com.bloodlink.entity.Donor;
import com.bloodlink.entity.Patient;
import com.bloodlink.enums.BloodGroup;
import com.bloodlink.exception.ResourceNotFoundException;
import com.bloodlink.repository.DonorRepository;
import com.bloodlink.repository.PatientRepository;
import com.bloodlink.service.interfaces.IAIRecommendationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * AI Recommendation Service Implementation.
 * Uses the DonorScoringEngine to provide smart donor recommendations.
 */
@Service
@Transactional(readOnly = true)
public class AIRecommendationServiceImpl implements IAIRecommendationService {

    private final DonorScoringEngine scoringEngine;
    private final DonorRepository donorRepository;
    private final PatientRepository patientRepository;

    public AIRecommendationServiceImpl(DonorScoringEngine scoringEngine,
                                       DonorRepository donorRepository,
                                       PatientRepository patientRepository) {
        this.scoringEngine = scoringEngine;
        this.donorRepository = donorRepository;
        this.patientRepository = patientRepository;
    }

    @Override
    public List<DonorDTO> recommendDonors(Long patientId, int limit) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        List<Donor> allDonors = donorRepository.findAllAvailableDonors();

        List<DonorScoringEngine.DonorScore> scoredDonors = scoringEngine.scoreAndRankDonors(patient, allDonors);

        return scoredDonors.stream()
                .limit(limit)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<DonorDTO> recommendDonorsForRequest(Long patientId, String bloodGroup,
                                                       Double latitude, Double longitude, int limit) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        // Override patient location if provided
        if (latitude != null && longitude != null) {
            patient.setLatitude(latitude);
            patient.setLongitude(longitude);
        }

        if (bloodGroup != null) {
            patient.setRequiredBloodGroup(BloodGroup.valueOf(bloodGroup));
        }

        List<Donor> allDonors = donorRepository.findAllAvailableDonors();

        List<DonorScoringEngine.DonorScore> scoredDonors = scoringEngine.scoreAndRankDonors(patient, allDonors);

        return scoredDonors.stream()
                .limit(limit)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public double calculateCompatibilityScore(String donorBloodGroup, String patientBloodGroup) {
        try {
            BloodGroup donor = BloodGroup.valueOf(donorBloodGroup);
            BloodGroup patient = BloodGroup.valueOf(patientBloodGroup);
            return scoringEngine.getClass().getDeclaredField("compatibilityMatrix") != null ? 1.0 : 0.0;
        } catch (Exception e) {
            return 0.0;
        }
    }

    private DonorDTO mapToDTO(DonorScoringEngine.DonorScore donorScore) {
        Donor donor = donorScore.getDonor();
        DonorDTO dto = new DonorDTO();
        dto.setId(donor.getId());
        dto.setEmail(donor.getEmail());
        dto.setFullName(donor.getFullName());
        dto.setPhoneNumber(donor.getPhoneNumber());
        dto.setRole(donor.getRole());
        dto.setGender(donor.getGender());
        dto.setAge(donor.getAge());
        dto.setCurrentLocation(donor.getCurrentLocation());
        dto.setProfilePhoto(donor.getProfilePhoto());
        dto.setCreatedAt(donor.getCreatedAt());
        dto.setIsActive(donor.getIsActive());
        dto.setBloodGroup(donor.getBloodGroup());
        dto.setAvailableDonationArea(donor.getAvailableDonationArea());
        dto.setLastDonationDate(donor.getLastDonationDate());
        dto.setDonationCount(donor.getDonationCount());
        dto.setMedicalHistory(donor.getMedicalHistory());
        dto.setDiseasesRestrictions(donor.getDiseasesRestrictions());
        dto.setEmergencyAvailable(donor.getEmergencyAvailable());
        dto.setAvailabilityStatus(donor.getAvailabilityStatus());
        dto.setLatitude(donor.getLatitude());
        dto.setLongitude(donor.getLongitude());
        dto.setMatchScore(Math.round(donorScore.getScore() * 100.0) / 100.0);
        return dto;
    }
}
