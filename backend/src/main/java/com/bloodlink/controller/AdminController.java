package com.bloodlink.controller;

import com.bloodlink.dto.AdminDashboardStatsDTO;
import com.bloodlink.dto.ApiResponse;
import com.bloodlink.dto.DonorDTO;
import com.bloodlink.dto.RegisterRequest;
import com.bloodlink.service.interfaces.IAdminService;
import com.bloodlink.service.interfaces.IDonorService;
import com.bloodlink.service.interfaces.IUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin Controller.
 * All endpoints require ADMIN role — enforced via @PreAuthorize.
 * REST API base: /api/admin
 *
 * Demonstrates OOP Composition: delegates business logic to IAdminService.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final IAdminService adminService;
    private final IDonorService donorService;

    public AdminController(IAdminService adminService, IDonorService donorService) {
        this.adminService = adminService;
        this.donorService = donorService;
    }

    /**
     * GET /api/admin/dashboard
     * Returns platform-wide statistics for the admin dashboard.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardStatsDTO>> getDashboardStats() {
        AdminDashboardStatsDTO stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    /**
     * GET /api/admin/donors
     * Returns all donors for admin management.
     */
    @GetMapping("/donors")
    public ResponseEntity<ApiResponse<List<DonorDTO>>> getAllDonors() {
        List<DonorDTO> donors = donorService.getAllDonors();
        return ResponseEntity.ok(ApiResponse.success(donors));
    }

    /**
     * POST /api/admin/donors
     * Allows admin to manually create a donor account.
     */
    @PostMapping("/donors")
    public ResponseEntity<ApiResponse<DonorDTO>> createDonor(@Valid @RequestBody RegisterRequest request) {
        DonorDTO donor = adminService.createDonor(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Donor created successfully", donor));
    }

    /**
     * DELETE /api/admin/users/{userId}
     * Deletes a user account (donor or patient).
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    /**
     * PUT /api/admin/users/{userId}/toggle-active
     * Activates or deactivates a user account.
     */
    @PutMapping("/users/{userId}/toggle-active")
    public ResponseEntity<ApiResponse<Void>> toggleUserStatus(@PathVariable Long userId) {
        adminService.toggleUserActiveStatus(userId);
        return ResponseEntity.ok(ApiResponse.success("User status updated", null));
    }
}
