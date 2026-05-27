package com.bloodlink;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * BloodLink - AI-powered Blood Donor & Patient Connection Platform
 * Main Spring Boot Application Entry Point
 * 
 * This application demonstrates enterprise Java OOP patterns:
 * - Encapsulation: All entity fields private with controlled access
 * - Inheritance: AbstractUser base class with Donor/Patient subclasses
 * - Polymorphism: Service interfaces with multiple implementations
 * - Abstraction: Service layers hide complex business logic
 * - SOLID: Single responsibility per class, dependency injection throughout
 */
@SpringBootApplication
public class BloodLinkApplication {

    public static void main(String[] args) {
        SpringApplication.run(BloodLinkApplication.class, args);
        System.out.println("╔══════════════════════════════════════════════════════════╗");
        System.out.println("║            BloodLink Platform Started                    ║");
        System.out.println("║     AI-Powered Blood Donor Connection System             ║");
        System.out.println("╚══════════════════════════════════════════════════════════╝");
    }
}
