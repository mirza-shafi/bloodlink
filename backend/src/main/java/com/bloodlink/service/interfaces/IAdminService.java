package com.bloodlink.service.interfaces;

import com.bloodlink.dto.AdminDashboardStatsDTO;
import com.bloodlink.dto.DonorDTO;
import com.bloodlink.dto.RegisterRequest;

/**
 * Admin service interface defining admin-specific operations.
 * Demonstrates OOP Abstraction - defines contract only.
 */
public interface IAdminService {
    AdminDashboardStatsDTO getDashboardStats();
    void toggleUserActiveStatus(Long userId);
    void deleteUser(Long userId);
    DonorDTO createDonor(RegisterRequest request);
}
