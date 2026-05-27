package com.bloodlink.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * JWT authentication response containing tokens.
 */
@Data
@AllArgsConstructor
public class JwtAuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private Long userId;
    private String email;
    private String role;

    public JwtAuthResponse(String accessToken, Long userId, String email, String role) {
        this.accessToken = accessToken;
        this.userId = userId;
        this.email = email;
        this.role = role;
    }
}
