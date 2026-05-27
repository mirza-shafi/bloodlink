package com.bloodlink.service.interfaces;

import com.bloodlink.dto.DonorDTO;
import com.bloodlink.dto.DonorSearchRequest;
import com.bloodlink.enums.AvailabilityStatus;

import java.util.List;

/**
 * Donor service interface for donor-specific operations.
 */
public interface IDonorService {
    List<DonorDTO> getAllDonors();
    DonorDTO getDonorById(Long id);
    DonorDTO updateDonorProfile(Long donorId, DonorDTO donorDTO);
    DonorDTO updateAvailabilityStatus(Long donorId, AvailabilityStatus status);
    List<DonorDTO> searchDonors(DonorSearchRequest searchRequest);
    List<DonorDTO> getDonorsByBloodGroup(String bloodGroup);
}
