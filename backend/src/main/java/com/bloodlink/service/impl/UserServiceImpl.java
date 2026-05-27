package com.bloodlink.service.impl;

import com.bloodlink.dto.*;
import com.bloodlink.entity.AbstractUser;
import com.bloodlink.entity.Donor;
import com.bloodlink.entity.Patient;
import com.bloodlink.enums.UserRole;
import com.bloodlink.exception.BadRequestException;
import com.bloodlink.exception.UnauthorizedException;
import com.bloodlink.repository.DonorRepository;
import com.bloodlink.repository.PatientRepository;
import com.bloodlink.repository.UserRepository;
import com.bloodlink.service.JwtService;
import com.bloodlink.service.interfaces.IUserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * User Service Implementation.
 * Demonstrates OOP: Implements interface (Polymorphism),
 * encapsulates business logic (Encapsulation).
 */
@Service
@Transactional
public class UserServiceImpl implements IUserService {

    private final UserRepository userRepository;
    private final DonorRepository donorRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserServiceImpl(UserRepository userRepository, DonorRepository donorRepository,
                           PatientRepository patientRepository, PasswordEncoder passwordEncoder,
                           JwtService jwtService) {
        this.userRepository = userRepository;
        this.donorRepository = donorRepository;
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    public JwtAuthResponse login(LoginRequest request) {
        AbstractUser user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new UnauthorizedException("Account is deactivated");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new JwtAuthResponse(token, user.getId(), user.getEmail(), user.getRole().name());
    }

    @Override
    public JwtAuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        AbstractUser user;
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        if (request.getRole() == UserRole.DONOR) {
            user = createDonor(request, encodedPassword);
        } else if (request.getRole() == UserRole.PATIENT) {
            user = createPatient(request, encodedPassword);
        } else {
            throw new BadRequestException("Invalid role specified");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new JwtAuthResponse(token, user.getId(), user.getEmail(), user.getRole().name());
    }

    private Donor createDonor(RegisterRequest request, String encodedPassword) {
        Donor donor = new Donor();
        donor.setEmail(request.getEmail());
        donor.setPassword(encodedPassword);
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
        donor.setAvailabilityStatus(com.bloodlink.enums.AvailabilityStatus.AVAILABLE);
        donor.setDonationCount(0);
        donor.setIsActive(true);
        return donorRepository.save(donor);
    }

    private Patient createPatient(RegisterRequest request, String encodedPassword) {
        Patient patient = new Patient();
        patient.setEmail(request.getEmail());
        patient.setPassword(encodedPassword);
        patient.setFullName(request.getFullName());
        patient.setPhoneNumber(request.getPhoneNumber());
        patient.setRole(UserRole.PATIENT);
        patient.setGender(request.getGender());
        patient.setAge(request.getAge());
        patient.setCurrentLocation(request.getCurrentLocation());
        patient.setFullAddress(request.getFullAddress());
        patient.setLatitude(request.getLatitude());
        patient.setLongitude(request.getLongitude());
        patient.setMedicalCondition(request.getMedicalCondition());
        patient.setRequiredBloodGroup(request.getRequiredBloodGroup());
        patient.setHospitalName(request.getHospitalName());
        if (request.getEmergencyLevel() != null) {
            patient.setEmergencyLevel(com.bloodlink.enums.EmergencyLevel.valueOf(request.getEmergencyLevel()));
        }
        patient.setIsActive(true);
        return patientRepository.save(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getCurrentUser(Long userId) {
        AbstractUser user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        return mapToUserDTO(user);
    }

    @Override
    public UserDTO updateProfile(Long userId, RegisterRequest request) {
        AbstractUser user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setGender(request.getGender());
        user.setAge(request.getAge());
        user.setCurrentLocation(request.getCurrentLocation());
        user.setFullAddress(request.getFullAddress());
        user.setLatitude(request.getLatitude());
        user.setLongitude(request.getLongitude());
        if (request.getProfilePhoto() != null) {
            user.setProfilePhoto(request.getProfilePhoto());
        }

        if (user instanceof Donor) {
            Donor donor = (Donor) user;
            if (request.getBloodGroup() != null) {
                donor.setBloodGroup(request.getBloodGroup());
            }
            if (request.getAvailableDonationArea() != null) {
                donor.setAvailableDonationArea(request.getAvailableDonationArea());
            }
            if (request.getMedicalHistory() != null) {
                donor.setMedicalHistory(request.getMedicalHistory());
            }
            if (request.getDiseasesRestrictions() != null) {
                donor.setDiseasesRestrictions(request.getDiseasesRestrictions());
            }
            if (request.getEmergencyAvailable() != null) {
                donor.setEmergencyAvailable(request.getEmergencyAvailable());
            }
        } else if (user instanceof Patient) {
            Patient patient = (Patient) user;
            if (request.getMedicalCondition() != null) {
                patient.setMedicalCondition(request.getMedicalCondition());
            }
            if (request.getRequiredBloodGroup() != null) {
                patient.setRequiredBloodGroup(request.getRequiredBloodGroup());
            }
            if (request.getHospitalName() != null) {
                patient.setHospitalName(request.getHospitalName());
            }
            if (request.getEmergencyLevel() != null) {
                patient.setEmergencyLevel(com.bloodlink.enums.EmergencyLevel.valueOf(request.getEmergencyLevel()));
            }
        }

        user = userRepository.save(user);
        return mapToUserDTO(user);
    }

    @Override
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        AbstractUser user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private UserDTO mapToUserDTO(AbstractUser user) {
        if (user instanceof Donor) {
            Donor donor = (Donor) user;
            DonorDTO dto = new DonorDTO();
            populateBaseFields(user, dto);
            dto.setBloodGroup(donor.getBloodGroup());
            dto.setAvailableDonationArea(donor.getAvailableDonationArea());
            dto.setLastDonationDate(donor.getLastDonationDate());
            dto.setDonationCount(donor.getDonationCount());
            dto.setMedicalHistory(donor.getMedicalHistory());
            dto.setDiseasesRestrictions(donor.getDiseasesRestrictions());
            dto.setEmergencyAvailable(donor.getEmergencyAvailable());
            dto.setAvailabilityStatus(donor.getAvailabilityStatus());
            return dto;
        } else if (user instanceof Patient) {
            Patient patient = (Patient) user;
            PatientDTO dto = new PatientDTO();
            populateBaseFields(user, dto);
            dto.setMedicalCondition(patient.getMedicalCondition());
            dto.setRequiredBloodGroup(patient.getRequiredBloodGroup());
            dto.setHospitalName(patient.getHospitalName());
            dto.setEmergencyLevel(patient.getEmergencyLevel());
            dto.setRequiredDate(patient.getRequiredDate());
            return dto;
        } else {
            UserDTO dto = new UserDTO();
            populateBaseFields(user, dto);
            return dto;
        }
    }

    private void populateBaseFields(AbstractUser user, UserDTO dto) {
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole());
        dto.setGender(user.getGender());
        dto.setAge(user.getAge());
        dto.setCurrentLocation(user.getCurrentLocation());
        dto.setFullAddress(user.getFullAddress());
        dto.setProfilePhoto(user.getProfilePhoto());
        dto.setLatitude(user.getLatitude());
        dto.setLongitude(user.getLongitude());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setIsActive(user.getIsActive());
    }
}
