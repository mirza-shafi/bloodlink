package com.bloodlink.dto;

import com.bloodlink.enums.BloodGroup;
import lombok.Data;

/**
 * DTO for donor search criteria.
 */
@Data
public class DonorSearchRequest {
    private BloodGroup bloodGroup;
    private String location;
    private Double latitude;
    private Double longitude;
    private Double maxDistance; // in kilometers
    private Boolean availableOnly;
    private Boolean emergencyAvailable;
    private String sortBy; // distance, recent, frequency
}
