package com.bloodlink.dto;

import com.bloodlink.enums.BloodGroup;
import com.bloodlink.enums.EmergencyLevel;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * Patient DTO extending UserDTO with patient-specific fields.
 * Demonstrates OOP Inheritance in DTO layer.
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class PatientDTO extends UserDTO {
    private String medicalCondition;
    private BloodGroup requiredBloodGroup;
    private String hospitalName;
    private EmergencyLevel emergencyLevel;
    private LocalDate requiredDate;
}
