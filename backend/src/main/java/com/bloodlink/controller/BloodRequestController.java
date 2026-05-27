package com.bloodlink.controller;

import com.bloodlink.dto.ApiResponse;
import com.bloodlink.dto.BloodRequestDTO;
import com.bloodlink.service.interfaces.IBloodRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Blood Request Controller.
 * Manages blood donation request lifecycle.
 * REST API endpoint: /api/requests
 */
@RestController
@RequestMapping("/api/requests")
public class BloodRequestController {

    private final IBloodRequestService requestService;

    public BloodRequestController(IBloodRequestService requestService) {
        this.requestService = requestService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<BloodRequestDTO>> createRequest(
            @RequestAttribute("userId") Long patientId,
            @RequestBody BloodRequestDTO requestDTO) {
        BloodRequestDTO request = requestService.createRequest(patientId, requestDTO);
        return ResponseEntity.ok(ApiResponse.success("Request created", request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BloodRequestDTO>> getRequestById(@PathVariable Long id) {
        BloodRequestDTO request = requestService.getRequestById(id);
        return ResponseEntity.ok(ApiResponse.success(request));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<BloodRequestDTO>>> getRequestsByPatient(@PathVariable Long patientId) {
        List<BloodRequestDTO> requests = requestService.getRequestsByPatient(patientId);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @GetMapping("/donor/{donorId}")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<ApiResponse<List<BloodRequestDTO>>> getRequestsByDonor(@PathVariable Long donorId) {
        List<BloodRequestDTO> requests = requestService.getRequestsByDonor(donorId);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @PutMapping("/{id}/accept")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<ApiResponse<BloodRequestDTO>> acceptRequest(
            @PathVariable Long id,
            @RequestAttribute("userId") Long donorId) {
        BloodRequestDTO request = requestService.acceptRequest(id, donorId);
        return ResponseEntity.ok(ApiResponse.success("Request accepted", request));
    }

    @PutMapping("/{id}/decline")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<ApiResponse<BloodRequestDTO>> declineRequest(
            @PathVariable Long id,
            @RequestAttribute("userId") Long donorId) {
        BloodRequestDTO request = requestService.declineRequest(id, donorId);
        return ResponseEntity.ok(ApiResponse.success("Request declined", request));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<BloodRequestDTO>> completeRequest(@PathVariable Long id) {
        BloodRequestDTO request = requestService.completeRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Request completed", request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelRequest(@PathVariable Long id) {
        requestService.cancelRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Request cancelled", null));
    }
}
