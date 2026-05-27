package com.bloodlink.ai;

import com.bloodlink.entity.Donor;
import com.bloodlink.entity.Patient;
import com.bloodlink.enums.AvailabilityStatus;
import com.bloodlink.util.GeoDistanceCalculator;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * AI-powered Donor Scoring Engine.
 * Implements a weighted multi-factor scoring algorithm to rank donors.
 * 
 * Scoring Factors:
 * - Distance (30%): Closer donors score higher
 * - Blood Match (25%): Perfect compatibility = 1.0
 * - Availability (20%): Available now = 1.0
 * - Donation History (15%): More donations = higher score
 * - Last Donation Recency (10%): Recent donors score lower (recovery period)
 */
@Component
public class DonorScoringEngine {

    private static final double WEIGHT_DISTANCE = 0.30;
    private static final double WEIGHT_BLOOD_MATCH = 0.25;
    private static final double WEIGHT_AVAILABILITY = 0.20;
    private static final double WEIGHT_DONATION_HISTORY = 0.15;
    private static final double WEIGHT_LAST_DONATION = 0.10;

    // Maximum distance to consider (km)
    private static final double MAX_DISTANCE = 50.0;
    // Minimum days between donations
    private static final int MIN_DAYS_BETWEEN_DONATIONS = 56;

    private final BloodCompatibilityMatrix compatibilityMatrix;

    public DonorScoringEngine(BloodCompatibilityMatrix compatibilityMatrix) {
        this.compatibilityMatrix = compatibilityMatrix;
    }

    /**
     * Calculate donor scores and return ranked list.
     */
    public List<DonorScore> scoreAndRankDonors(Patient patient, List<Donor> donors) {
        return donors.stream()
                .map(donor -> new DonorScore(donor, calculateTotalScore(patient, donor)))
                .filter(ds -> ds.getScore() > 0) // Only include donors with positive scores
                .sorted(Comparator.comparing(DonorScore::getScore).reversed())
                .collect(Collectors.toList());
    }

    private double calculateTotalScore(Patient patient, Donor donor) {
        double distanceScore = calculateDistanceScore(patient, donor);
        double bloodScore = calculateBloodScore(patient, donor);
        double availabilityScore = calculateAvailabilityScore(donor);
        double historyScore = calculateHistoryScore(donor);
        double recencyScore = calculateRecencyScore(donor);

        // If blood types are incompatible, score is 0
        if (bloodScore == 0) {
            return 0;
        }

        return (distanceScore * WEIGHT_DISTANCE)
                + (bloodScore * WEIGHT_BLOOD_MATCH)
                + (availabilityScore * WEIGHT_AVAILABILITY)
                + (historyScore * WEIGHT_DONATION_HISTORY)
                + (recencyScore * WEIGHT_LAST_DONATION);
    }

    private double calculateDistanceScore(Patient patient, Donor donor) {
        if (patient.getLatitude() == null || patient.getLongitude() == null
                || donor.getLatitude() == null || donor.getLongitude() == null) {
            return 0.5; // Neutral score if location unknown
        }

        double distance = GeoDistanceCalculator.calculate(
                patient.getLatitude(), patient.getLongitude(),
                donor.getLatitude(), donor.getLongitude()
        );

        // Normalize: closer = higher score, linear decay
        return Math.max(0, 1.0 - (distance / MAX_DISTANCE));
    }

    private double calculateBloodScore(Patient patient, Donor donor) {
        if (patient.getRequiredBloodGroup() == null || donor.getBloodGroup() == null) {
            return 0.5;
        }
        return compatibilityMatrix.getCompatibilityScore(donor.getBloodGroup(), patient.getRequiredBloodGroup());
    }

    private double calculateAvailabilityScore(Donor donor) {
        if (donor.getAvailabilityStatus() == AvailabilityStatus.AVAILABLE) {
            return donor.getEmergencyAvailable() ? 1.0 : 0.8;
        }
        return 0.0;
    }

    private double calculateHistoryScore(Donor donor) {
        int donationCount = donor.getDonationCount() != null ? donor.getDonationCount() : 0;
        // Normalize: max out at 20 donations
        return Math.min(1.0, donationCount / 20.0);
    }

    private double calculateRecencyScore(Donor donor) {
        if (donor.getLastDonationDate() == null) {
            return 1.0; // Never donated = highest score (fresh donor)
        }

        long daysSinceLastDonation = ChronoUnit.DAYS.between(donor.getLastDonationDate(), LocalDate.now());

        if (daysSinceLastDonation < MIN_DAYS_BETWEEN_DONATIONS) {
            return 0.0; // Too soon to donate again
        }

        // Score increases as more time passes since last donation
        return Math.min(1.0, daysSinceLastDonation / (double) (MIN_DAYS_BETWEEN_DONATIONS * 2));
    }

    /**
     * Inner class to hold donor-score pairs.
     */
    @Data
    @AllArgsConstructor
    public static class DonorScore {
        private Donor donor;
        private double score;
    }
}
