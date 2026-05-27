package com.bloodlink.entity;

import com.bloodlink.enums.BloodGroup;
import com.bloodlink.enums.EmergencyLevel;
import com.bloodlink.enums.UserRole;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Patient entity extending AbstractUser.
 * Demonstrates OOP Inheritance - inherits all common user fields.
 * Contains patient-specific attributes for blood requirements.
 */
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@Entity
@DiscriminatorValue("PATIENT")
public class Patient extends AbstractUser {

    @Column(name = "medical_condition", length = 2000)
    private String medicalCondition;

    @Enumerated(EnumType.STRING)
    @Column(name = "required_blood_group")
    private BloodGroup requiredBloodGroup;

    @Column(name = "hospital_name")
    private String hospitalName;

    @Enumerated(EnumType.STRING)
    @Column(name = "emergency_level")
    private EmergencyLevel emergencyLevel;

    @Column(name = "required_date")
    private LocalDate requiredDate;

    public Patient(String email, String password, String fullName, String phoneNumber,
                   BloodGroup requiredBloodGroup, String hospitalName) {
        super();
        setEmail(email);
        setPassword(password);
        setFullName(fullName);
        setPhoneNumber(phoneNumber);
        setRole(UserRole.PATIENT);
        setRequiredBloodGroup(requiredBloodGroup);
        setHospitalName(hospitalName);
        setEmergencyLevel(EmergencyLevel.MEDIUM);
        setIsActive(true);
    }
}
