package com.bloodlink.repository;

import com.bloodlink.entity.AbstractUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for AbstractUser entity.
 * Provides CRUD operations and custom query methods.
 */
@Repository
public interface UserRepository extends JpaRepository<AbstractUser, Long> {
    Optional<AbstractUser> findByEmail(String email);
    boolean existsByEmail(String email);
}
