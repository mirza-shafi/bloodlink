package com.bloodlink.config;

import com.bloodlink.entity.Admin;
import com.bloodlink.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initializes the default system admin dynamically on startup.
 * Values can be configured via environment variables ADMIN_EMAIL and ADMIN_PASSWORD.
 */
@Component
public class AdminInitializer {

    private static final Logger logger = LoggerFactory.getLogger(AdminInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email:admin@bloodlink.com}")
    private String adminEmail;

    @Value("${admin.password:password}")
    private String adminPassword;

    public AdminInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void initAdmin() {
        logger.info("Checking for admin presence with email: {}", adminEmail);

        if (!userRepository.existsByEmail(adminEmail)) {
            logger.info("Admin user not found. Creating admin user...");
            String encodedPassword = passwordEncoder.encode(adminPassword);
            Admin admin = new Admin(
                    adminEmail,
                    encodedPassword,
                    "System Admin",
                    "+1-555-9999"
            );
            userRepository.save(admin);
            logger.info("Successfully created admin user: {}", adminEmail);
        } else {
            logger.info("Admin user already exists: {}", adminEmail);
        }
    }
}
