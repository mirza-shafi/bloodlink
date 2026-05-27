package com.bloodlink.service.impl;

import com.bloodlink.dto.DonorDTO;
import com.bloodlink.dto.DonorSearchRequest;
import com.bloodlink.entity.Donor;
import com.bloodlink.enums.AvailabilityStatus;
import com.bloodlink.enums.BloodGroup;
import com.bloodlink.exception.ResourceNotFoundException;
import com.bloodlink.repository.DonorRepository;
import com.bloodlink.service.interfaces.IDonorService;
import com.bloodlink.util.GeoDistanceCalculator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Donor Service Implementation.
 * Handles donor profile management and search operations.
 */
@Service
@Transactional(readOnly = true)
public class DonorServiceImpl implements IDonorService {

    private final DonorRepository donorRepository;

    public DonorServiceImpl(DonorRepository donorRepository) {
        this.donorRepository = donorRepository;
    }

    @Override
    public List<DonorDTO> getAllDonors() {
        return donorRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DonorDTO getDonorById(Long id) {
        Donor donor = donorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found: " + id));
        return mapToDTO(donor);
    }

    @Override
    @Transactional
    public DonorDTO updateDonorProfile(Long donorId, DonorDTO donorDTO) {
        Donor donor = donorRepository.findById(donorId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found: " + donorId));

        donor.setFullName(donorDTO.getFullName());
        donor.setPhoneNumber(donorDTO.getPhoneNumber());
        donor.setGender(donorDTO.getGender());
        donor.setAge(donorDTO.getAge());
        donor.setCurrentLocation(donorDTO.getCurrentLocation());
        donor.setFullAddress(donorDTO.getFullAddress());
        donor.setBloodGroup(donorDTO.getBloodGroup());
        donor.setAvailableDonationArea(donorDTO.getAvailableDonationArea());
        donor.setMedicalHistory(donorDTO.getMedicalHistory());
        donor.setDiseasesRestrictions(donorDTO.getDiseasesRestrictions());
        donor.setEmergencyAvailable(donorDTO.getEmergencyAvailable());
        donor.setProfilePhoto(donorDTO.getProfilePhoto());

        donor = donorRepository.save(donor);
        return mapToDTO(donor);
    }

    @Override
    @Transactional
    public DonorDTO updateAvailabilityStatus(Long donorId, AvailabilityStatus status) {
        Donor donor = donorRepository.findById(donorId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found: " + donorId));
        donor.setAvailabilityStatus(status);
        donor = donorRepository.save(donor);
        return mapToDTO(donor);
    }

    @Override
    public List<DonorDTO> searchDonors(DonorSearchRequest searchRequest) {
        List<Donor> donors;

        if (searchRequest.getBloodGroup() != null && searchRequest.getAvailableOnly() != null && searchRequest.getAvailableOnly()) {
            donors = donorRepository.findByBloodGroupAndAvailabilityStatus(searchRequest.getBloodGroup(), AvailabilityStatus.AVAILABLE);
        } else if (searchRequest.getBloodGroup() != null) {
            donors = donorRepository.findByBloodGroup(searchRequest.getBloodGroup());
        } else if (searchRequest.getAvailableOnly() != null && searchRequest.getAvailableOnly()) {
            donors = donorRepository.findByAvailabilityStatus(AvailabilityStatus.AVAILABLE);
        } else {
            donors = donorRepository.findAll();
        }

        // Filter by location if provided
        if (searchRequest.getLatitude() != null && searchRequest.getLongitude() != null && searchRequest.getMaxDistance() != null) {
            final double maxDist = searchRequest.getMaxDistance();
            final double lat = searchRequest.getLatitude();
            final double lon = searchRequest.getLongitude();
            donors = donors.stream()
                    .filter(d -> d.getLatitude() != null && d.getLongitude() != null)
                    .filter(d -> GeoDistanceCalculator.calculate(lat, lon, d.getLatitude(), d.getLongitude()) <= maxDist)
                    .collect(Collectors.toList());
        }

        // Filter by location string text if provided
        if (searchRequest.getLocation() != null && !searchRequest.getLocation().trim().isEmpty()) {
            String loc = searchRequest.getLocation().toLowerCase().trim();
            donors = donors.stream()
                    .filter(d -> (d.getCurrentLocation() != null && d.getCurrentLocation().toLowerCase().contains(loc)) ||
                                 (d.getAvailableDonationArea() != null && d.getAvailableDonationArea().toLowerCase().contains(loc)) ||
                                 (d.getFullAddress() != null && d.getFullAddress().toLowerCase().contains(loc)))
                    .collect(Collectors.toList());
        }

        // Filter emergency available
        if (searchRequest.getEmergencyAvailable() != null && searchRequest.getEmergencyAvailable()) {
            donors = donors.stream()
                    .filter(d -> Boolean.TRUE.equals(d.getEmergencyAvailable()))
                    .collect(Collectors.toList());
        }

        // Sort results
        List<DonorDTO> result = donors.stream().map(this::mapToDTO).collect(Collectors.toList());

        if (searchRequest.getLatitude() != null && searchRequest.getLongitude() != null) {
            final double lat = searchRequest.getLatitude();
            final double lon = searchRequest.getLongitude();
            for (DonorDTO dto : result) {
                if (dto.getLatitude() != null && dto.getLongitude() != null) {
                    dto.setDistance(GeoDistanceCalculator.calculate(lat, lon, dto.getLatitude(), dto.getLongitude()));
                }
            }
            if ("distance".equals(searchRequest.getSortBy())) {
                result.sort(Comparator.comparing(d -> d.getDistance() != null ? d.getDistance() : Double.MAX_VALUE));
            }
        }

        return result;
    }

    @Override
    public List<DonorDTO> getDonorsByBloodGroup(String bloodGroup) {
        try {
            BloodGroup bg = BloodGroup.valueOf(bloodGroup);
            return donorRepository.findByBloodGroup(bg).stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Invalid blood group: " + bloodGroup);
        }
    }

    private DonorDTO mapToDTO(Donor donor) {
        DonorDTO dto = new DonorDTO();
        dto.setId(donor.getId());
        dto.setEmail(donor.getEmail());
        dto.setFullName(donor.getFullName());
        dto.setPhoneNumber(donor.getPhoneNumber());
        dto.setRole(donor.getRole());
        dto.setGender(donor.getGender());
        dto.setAge(donor.getAge());
        dto.setCurrentLocation(donor.getCurrentLocation());
        dto.setProfilePhoto(donor.getProfilePhoto());
        dto.setCreatedAt(donor.getCreatedAt());
        dto.setIsActive(donor.getIsActive());
        dto.setBloodGroup(donor.getBloodGroup());
        dto.setAvailableDonationArea(donor.getAvailableDonationArea());
        dto.setLastDonationDate(donor.getLastDonationDate());
        dto.setDonationCount(donor.getDonationCount());
        dto.setMedicalHistory(donor.getMedicalHistory());
        dto.setDiseasesRestrictions(donor.getDiseasesRestrictions());
        dto.setEmergencyAvailable(donor.getEmergencyAvailable());
        dto.setAvailabilityStatus(donor.getAvailabilityStatus());
        dto.setLatitude(donor.getLatitude());
        dto.setLongitude(donor.getLongitude());
        return dto;
    }
}
