package com.bloodlink.dto;

import com.bloodlink.enums.BloodGroup;
import com.bloodlink.enums.EmergencyLevel;
import com.bloodlink.enums.RequestStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Blood request DTO for transferring request data.
 */
@Data
public class BloodRequestDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long donorId;
    private String donorName;
    private BloodGroup bloodGroup;
    private Integer unitsRequired;
    private String hospitalName;
    private String hospitalAddress;
    private EmergencyLevel emergencyLevel;
    private LocalDate requiredDate;
    private RequestStatus status;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
