package com.bloodlink.dto;

import com.bloodlink.enums.BloodGroup;
import com.bloodlink.enums.Gender;
import com.bloodlink.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Registration request DTO.
 * Used for both donor and patient registration.
 */
@Data
public class RegisterRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private String phoneNumber;

    @NotNull(message = "Role is required")
    private UserRole role;

    private Gender gender;
    private Integer age;
    private String currentLocation;
    private String fullAddress;
    private Double latitude;
    private Double longitude;

    private String profilePhoto;

    // Donor-specific fields
    private BloodGroup bloodGroup;
    private String availableDonationArea;
    private String medicalHistory;
    private String diseasesRestrictions;
    private Boolean emergencyAvailable;

    // Patient-specific fields
    private String medicalCondition;
    private BloodGroup requiredBloodGroup;
    private String hospitalName;
    private String emergencyLevel;
}
