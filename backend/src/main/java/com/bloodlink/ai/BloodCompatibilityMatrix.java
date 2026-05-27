package com.bloodlink.ai;

import com.bloodlink.enums.BloodGroup;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Blood Compatibility Matrix for AI recommendation engine.
 * Encapsulates medical blood type compatibility rules.
 * O- (O_NEG) is the universal donor.
 * AB+ (AB_POS) is the universal recipient.
 */
@Component
public class BloodCompatibilityMatrix {

    private static final Map<BloodGroup, Map<BloodGroup, Double>> COMPATIBILITY_MAP = new HashMap<>();

    static {
        // Initialize compatibility scores (1.0 = perfect match, 0.0 = incompatible)
        // Rows = Donor, Columns = Patient
        putCompatibility(BloodGroup.O_NEG, BloodGroup.O_NEG, 1.0);
        putCompatibility(BloodGroup.O_NEG, BloodGroup.O_POS, 1.0);
        putCompatibility(BloodGroup.O_NEG, BloodGroup.A_NEG, 1.0);
        putCompatibility(BloodGroup.O_NEG, BloodGroup.A_POS, 1.0);
        putCompatibility(BloodGroup.O_NEG, BloodGroup.B_NEG, 1.0);
        putCompatibility(BloodGroup.O_NEG, BloodGroup.B_POS, 1.0);
        putCompatibility(BloodGroup.O_NEG, BloodGroup.AB_NEG, 1.0);
        putCompatibility(BloodGroup.O_NEG, BloodGroup.AB_POS, 1.0);

        putCompatibility(BloodGroup.O_POS, BloodGroup.O_POS, 1.0);
        putCompatibility(BloodGroup.O_POS, BloodGroup.A_POS, 1.0);
        putCompatibility(BloodGroup.O_POS, BloodGroup.B_POS, 1.0);
        putCompatibility(BloodGroup.O_POS, BloodGroup.AB_POS, 1.0);

        putCompatibility(BloodGroup.A_NEG, BloodGroup.A_NEG, 1.0);
        putCompatibility(BloodGroup.A_NEG, BloodGroup.A_POS, 1.0);
        putCompatibility(BloodGroup.A_NEG, BloodGroup.AB_NEG, 1.0);
        putCompatibility(BloodGroup.A_NEG, BloodGroup.AB_POS, 1.0);

        putCompatibility(BloodGroup.A_POS, BloodGroup.A_POS, 1.0);
        putCompatibility(BloodGroup.A_POS, BloodGroup.AB_POS, 1.0);

        putCompatibility(BloodGroup.B_NEG, BloodGroup.B_NEG, 1.0);
        putCompatibility(BloodGroup.B_NEG, BloodGroup.B_POS, 1.0);
        putCompatibility(BloodGroup.B_NEG, BloodGroup.AB_NEG, 1.0);
        putCompatibility(BloodGroup.B_NEG, BloodGroup.AB_POS, 1.0);

        putCompatibility(BloodGroup.B_POS, BloodGroup.B_POS, 1.0);
        putCompatibility(BloodGroup.B_POS, BloodGroup.AB_POS, 1.0);

        putCompatibility(BloodGroup.AB_NEG, BloodGroup.AB_NEG, 1.0);
        putCompatibility(BloodGroup.AB_NEG, BloodGroup.AB_POS, 1.0);

        putCompatibility(BloodGroup.AB_POS, BloodGroup.AB_POS, 1.0);
    }

    private static void putCompatibility(BloodGroup donor, BloodGroup patient, double score) {
        COMPATIBILITY_MAP.computeIfAbsent(donor, k -> new HashMap<>()).put(patient, score);
    }

    /**
     * Get compatibility score between donor and patient blood groups.
     * @return 1.0 for compatible, 0.0 for incompatible
     */
    public double getCompatibilityScore(BloodGroup donorBlood, BloodGroup patientBlood) {
        return COMPATIBILITY_MAP
                .getOrDefault(donorBlood, new HashMap<>())
                .getOrDefault(patientBlood, 0.0);
    }

    /**
     * Check if blood types are compatible.
     */
    public boolean isCompatible(BloodGroup donorBlood, BloodGroup patientBlood) {
        return getCompatibilityScore(donorBlood, patientBlood) > 0;
    }
}
