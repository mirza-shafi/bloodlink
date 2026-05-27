package com.bloodlink.service.impl;

import com.bloodlink.dto.AdminDashboardStatsDTO;
import com.bloodlink.dto.DonorDTO;
import com.bloodlink.dto.RegisterRequest;
import com.bloodlink.entity.AbstractUser;
import com.bloodlink.entity.Donor;
import com.bloodlink.enums.AvailabilityStatus;
import com.bloodlink.enums.BloodGroup;
import com.bloodlink.enums.RequestStatus;
import com.bloodlink.enums.UserRole;
import com.bloodlink.exception.BadRequestException;
import com.bloodlink.exception.ResourceNotFoundException;
import com.bloodlink.repository.BloodRequestRepository;
import com.bloodlink.repository.DonorRepository;
import com.bloodlink.repository.PatientRepository;
import com.bloodlink.repository.UserRepository;
import com.bloodlink.service.interfaces.IAdminService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin Service Implementation.
 * Provides platform management operations exclusively for ADMIN role.
 * Demonstrates OOP Polymorphism - implements IAdminService contract.
 */
@Service
@Transactional
public class AdminServiceImpl implements IAdminService {

    private final UserRepository userRepository;
    private final DonorRepository donorRepository;
    private final PatientRepository patientRepository;
    private final BloodRequestRepository requestRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminServiceImpl(UserRepository userRepository,
                            DonorRepository donorRepository,
                            PatientRepository patientRepository,
                            BloodRequestRepository requestRepository,
                            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.donorRepository = donorRepository;
        this.patientRepository = patientRepository;
        this.requestRepository = requestRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardStatsDTO getDashboardStats() {
        long totalDonors = donorRepository.count();
        long totalPatients = patientRepository.count();
        long totalRequests = requestRepository.count();
        long pendingRequests = requestRepository.countByStatus(RequestStatus.PENDING);
        long acceptedRequests = requestRepository.countByStatus(RequestStatus.ACCEPTED);
        long completedRequests = requestRepository.countByStatus(RequestStatus.COMPLETED);
        long totalActiveUsers = userRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getIsActive()))
                .count();
        long availableDonors = donorRepository.findAllAvailableDonors().size();

        // Blood availability map: blood_group -> count of available donors
        Map<String, Long> bloodAvailability = new LinkedHashMap<>();
        for (BloodGroup bg : BloodGroup.values()) {
            List<Donor> eligible = donorRepository.findByBloodGroupAndAvailabilityStatus(bg, AvailabilityStatus.AVAILABLE);
            bloodAvailability.put(bg.name(), (long) eligible.size());
        }

        return new AdminDashboardStatsDTO(
                totalDonors, totalPatients, totalRequests,
                pendingRequests, acceptedRequests, completedRequests,
                totalActiveUsers, availableDonors, bloodAvailability
        );
    }

    @Override
    public void toggleUserActiveStatus(Long userId) {
        AbstractUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        userRepository.save(user);
    }

    @Override
    public void deleteUser(Long userId) {
        AbstractUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        // Prevent deleting admin accounts
        if (user.getRole() == UserRole.ADMIN) {
            throw new BadRequestException("Cannot delete admin accounts");
        }
        userRepository.delete(user);
    }

    @Override
    public DonorDTO createDonor(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        Donor donor = new Donor();
        donor.setEmail(request.getEmail());
        donor.setPassword(passwordEncoder.encode(request.getPassword()));
        donor.setFullName(request.getFullName());
        donor.setPhoneNumber(request.getPhoneNumber());
        donor.setRole(UserRole.DONOR);
        donor.setGender(request.getGender());
        donor.setAge(request.getAge());
        donor.setCurrentLocation(request.getCurrentLocation());
        donor.setFullAddress(request.getFullAddress());
        donor.setLatitude(request.getLatitude());
        donor.setLongitude(request.getLongitude());
        donor.setBloodGroup(request.getBloodGroup());
        donor.setAvailableDonationArea(request.getAvailableDonationArea());
        donor.setMedicalHistory(request.getMedicalHistory());
        donor.setDiseasesRestrictions(request.getDiseasesRestrictions());
        donor.setEmergencyAvailable(request.getEmergencyAvailable() != null ? request.getEmergencyAvailable() : false);
        donor.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
        donor.setDonationCount(0);
        donor.setIsActive(true);

        donor = donorRepository.save(donor);
        return mapDonorToDTO(donor);
    }

    private DonorDTO mapDonorToDTO(Donor donor) {
        DonorDTO dto = new DonorDTO();
        dto.setId(donor.getId());
        dto.setEmail(donor.getEmail());
        dto.setFullName(donor.getFullName());
        dto.setPhoneNumber(donor.getPhoneNumber());
        dto.setRole(donor.getRole());
        dto.setGender(donor.getGender());
        dto.setAge(donor.getAge());
        dto.setCurrentLocation(donor.getCurrentLocation());
        dto.setFullAddress(donor.getFullAddress());
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
