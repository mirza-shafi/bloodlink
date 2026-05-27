package com.bloodlink.entity;

import com.bloodlink.enums.UserRole;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Admin entity extending AbstractUser.
 * Demonstrates OOP Inheritance.
 * Uses @DiscriminatorValue for Single Table Inheritance mapping.
 */
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@Entity
@DiscriminatorValue("ADMIN")
public class Admin extends AbstractUser {

    public Admin(String email, String password, String fullName, String phoneNumber) {
        super();
        setEmail(email);
        setPassword(password);
        setFullName(fullName);
        setPhoneNumber(phoneNumber);
        setRole(UserRole.ADMIN);
        setIsActive(true);
    }
}
