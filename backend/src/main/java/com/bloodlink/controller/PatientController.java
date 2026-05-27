package com.bloodlink.controller;

import com.bloodlink.dto.ApiResponse;
import com.bloodlink.dto.PatientDTO;
import com.bloodlink.service.interfaces.IPatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Patient Controller.
 * Handles patient profile operations.
 * REST API endpoint: /api/patients
 */
@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final IPatientService patientService;

    public PatientController(IPatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PatientDTO>>> getAllPatients() {
        List<PatientDTO> patients = patientService.getAllPatients();
        return ResponseEntity.ok(ApiResponse.success(patients));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientDTO>> getPatientById(@PathVariable Long id) {
        PatientDTO patient = patientService.getPatientById(id);
        return ResponseEntity.ok(ApiResponse.success(patient));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<PatientDTO>> updatePatientProfile(
            @PathVariable Long id,
            @RequestBody PatientDTO patientDTO) {
        PatientDTO patient = patientService.updatePatientProfile(id, patientDTO);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", patient));
    }
}
