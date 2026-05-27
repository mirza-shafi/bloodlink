package com.bloodlink.controller;

import com.bloodlink.dto.ApiResponse;
import com.bloodlink.dto.DonorDTO;
import com.bloodlink.dto.DonorSearchRequest;
import com.bloodlink.enums.AvailabilityStatus;
import com.bloodlink.service.interfaces.IDonorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Donor Controller.
 * Handles donor profile operations and search.
 * REST API endpoint: /api/donors
 */
@RestController
@RequestMapping("/api/donors")
public class DonorController {

    private final IDonorService donorService;

    public DonorController(IDonorService donorService) {
        this.donorService = donorService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DonorDTO>>> getAllDonors() {
        List<DonorDTO> donors = donorService.getAllDonors();
        return ResponseEntity.ok(ApiResponse.success(donors));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DonorDTO>> getDonorById(@PathVariable Long id) {
        DonorDTO donor = donorService.getDonorById(id);
        return ResponseEntity.ok(ApiResponse.success(donor));
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<DonorDTO>>> searchDonors(@RequestBody DonorSearchRequest request) {
        List<DonorDTO> donors = donorService.searchDonors(request);
        return ResponseEntity.ok(ApiResponse.success(donors));
    }

    @GetMapping("/blood-group/{bloodGroup}")
    public ResponseEntity<ApiResponse<List<DonorDTO>>> getDonorsByBloodGroup(@PathVariable String bloodGroup) {
        List<DonorDTO> donors = donorService.getDonorsByBloodGroup(bloodGroup);
        return ResponseEntity.ok(ApiResponse.success(donors));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<ApiResponse<DonorDTO>> updateDonorProfile(
            @PathVariable Long id,
            @RequestBody DonorDTO donorDTO) {
        DonorDTO donor = donorService.updateDonorProfile(id, donorDTO);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", donor));
    }

    @PutMapping("/{id}/availability")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<ApiResponse<DonorDTO>> updateAvailability(
            @PathVariable Long id,
            @RequestParam AvailabilityStatus status) {
        DonorDTO donor = donorService.updateAvailabilityStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Availability updated", donor));
    }
}
