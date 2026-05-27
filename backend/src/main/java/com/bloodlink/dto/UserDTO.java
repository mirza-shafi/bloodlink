package com.bloodlink.dto;

import com.bloodlink.enums.Gender;
import com.bloodlink.enums.UserRole;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * User DTO for transferring user data without sensitive information.
 */
@Data
public class UserDTO {
    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private UserRole role;
    private Gender gender;
    private Integer age;
    private String currentLocation;
    private String fullAddress;
    private String profilePhoto;
    private Double latitude;
    private Double longitude;
    private LocalDateTime createdAt;
    private Boolean isActive;
}
