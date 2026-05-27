package com.bloodlink.service.interfaces;

import com.bloodlink.dto.*;

/**
 * User service interface defining the contract for user operations.
 * Demonstrates OOP Abstraction - defines what, not how.
 * Demonstrates Interface Segregation - focused on user operations only.
 */
public interface IUserService {
    JwtAuthResponse login(LoginRequest request);
    JwtAuthResponse register(RegisterRequest request);
    UserDTO getCurrentUser(Long userId);
    UserDTO updateProfile(Long userId, RegisterRequest request);
    void changePassword(Long userId, String oldPassword, String newPassword);
}
