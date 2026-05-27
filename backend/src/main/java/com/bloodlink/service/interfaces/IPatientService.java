package com.bloodlink.service.interfaces;

import com.bloodlink.dto.PatientDTO;

import java.util.List;

/**
 * Patient service interface for patient-specific operations.
 */
public interface IPatientService {
    List<PatientDTO> getAllPatients();
    PatientDTO getPatientById(Long id);
    PatientDTO updatePatientProfile(Long patientId, PatientDTO patientDTO);
}
