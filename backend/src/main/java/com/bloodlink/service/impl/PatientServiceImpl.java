package com.bloodlink.service.impl;

import com.bloodlink.dto.PatientDTO;
import com.bloodlink.entity.Patient;
import com.bloodlink.exception.ResourceNotFoundException;
import com.bloodlink.repository.PatientRepository;
import com.bloodlink.service.interfaces.IPatientService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Patient Service Implementation.
 */
@Service
@Transactional(readOnly = true)
public class PatientServiceImpl implements IPatientService {

    private final PatientRepository patientRepository;

    public PatientServiceImpl(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Override
    public List<PatientDTO> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PatientDTO getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + id));
        return mapToDTO(patient);
    }

    @Override
    @Transactional
    public PatientDTO updatePatientProfile(Long patientId, PatientDTO patientDTO) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + patientId));

        patient.setFullName(patientDTO.getFullName());
        patient.setPhoneNumber(patientDTO.getPhoneNumber());
        patient.setGender(patientDTO.getGender());
        patient.setAge(patientDTO.getAge());
        patient.setCurrentLocation(patientDTO.getCurrentLocation());
        patient.setMedicalCondition(patientDTO.getMedicalCondition());
        patient.setRequiredBloodGroup(patientDTO.getRequiredBloodGroup());
        patient.setHospitalName(patientDTO.getHospitalName());
        patient.setEmergencyLevel(patientDTO.getEmergencyLevel());
        patient.setProfilePhoto(patientDTO.getProfilePhoto());

        patient = patientRepository.save(patient);
        return mapToDTO(patient);
    }

    private PatientDTO mapToDTO(Patient patient) {
        PatientDTO dto = new PatientDTO();
        dto.setId(patient.getId());
        dto.setEmail(patient.getEmail());
        dto.setFullName(patient.getFullName());
        dto.setPhoneNumber(patient.getPhoneNumber());
        dto.setRole(patient.getRole());
        dto.setGender(patient.getGender());
        dto.setAge(patient.getAge());
        dto.setCurrentLocation(patient.getCurrentLocation());
        dto.setProfilePhoto(patient.getProfilePhoto());
        dto.setCreatedAt(patient.getCreatedAt());
        dto.setIsActive(patient.getIsActive());
        dto.setMedicalCondition(patient.getMedicalCondition());
        dto.setRequiredBloodGroup(patient.getRequiredBloodGroup());
        dto.setHospitalName(patient.getHospitalName());
        dto.setEmergencyLevel(patient.getEmergencyLevel());
        dto.setRequiredDate(patient.getRequiredDate());
        return dto;
    }
}
