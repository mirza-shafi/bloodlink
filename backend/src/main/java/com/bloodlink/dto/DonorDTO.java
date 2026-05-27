package com.bloodlink.dto;

import com.bloodlink.enums.AvailabilityStatus;
import com.bloodlink.enums.BloodGroup;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * Donor DTO extending UserDTO with donor-specific fields.
 * Demonstrates OOP Inheritance in DTO layer.
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class DonorDTO extends UserDTO {
    private BloodGroup bloodGroup;
    private String availableDonationArea;
    private LocalDate lastDonationDate;
    private Integer donationCount;
    private String medicalHistory;
    private String diseasesRestrictions;
    private Boolean emergencyAvailable;
    private AvailabilityStatus availabilityStatus;
    private Double distance; // For search results
    private Double matchScore; // For AI recommendations
}
