package com.bloodlink.enums;

/**
 * User roles for role-based authorization.
 * Supports Spring Security's GrantedAuthority pattern.
 */
public enum UserRole {
    DONOR,
    PATIENT,
    ADMIN
}
