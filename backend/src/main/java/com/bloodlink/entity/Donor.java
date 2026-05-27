package com.bloodlink.entity;

import com.bloodlink.enums.AvailabilityStatus;
import com.bloodlink.enums.BloodGroup;
import com.bloodlink.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Donor entity extending AbstractUser.
 * Demonstrates OOP Inheritance - inherits all common user fields.
 * Demonstrates Encapsulation - donor-specific fields are private.
 * Uses @DiscriminatorValue for Single Table Inheritance mapping.
 */
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@Entity
@DiscriminatorValue("DONOR")
public class Donor extends AbstractUser {

    @Enumerated(EnumType.STRING)
    @Column(name = "blood_group")
    private BloodGroup bloodGroup;

    @Column(name = "available_donation_area")
    private String availableDonationArea;

    @Column(name = "last_donation_date")
    private LocalDate lastDonationDate;

    @Column(name = "donation_count")
    private Integer donationCount = 0;

    @Column(name = "medical_history", length = 2000)
    private String medicalHistory;

    @Column(name = "diseases_restrictions", length = 1000)
    private String diseasesRestrictions;

    @Column(name = "emergency_available")
    private Boolean emergencyAvailable = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "availability_status")
    private AvailabilityStatus availabilityStatus = AvailabilityStatus.AVAILABLE;

    public Donor(String email, String password, String fullName, String phoneNumber,
                 BloodGroup bloodGroup, String currentLocation) {
        super();
        setEmail(email);
        setPassword(password);
        setFullName(fullName);
        setPhoneNumber(phoneNumber);
        setRole(UserRole.DONOR);
        setBloodGroup(bloodGroup);
        setCurrentLocation(currentLocation);
        setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
        setDonationCount(0);
        setEmergencyAvailable(false);
        setIsActive(true);
    }
}
