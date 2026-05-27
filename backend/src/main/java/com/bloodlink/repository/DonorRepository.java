package com.bloodlink.repository;

import com.bloodlink.entity.Donor;
import com.bloodlink.enums.AvailabilityStatus;
import com.bloodlink.enums.BloodGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Donor entity.
 * Provides donor-specific query methods including AI recommendation queries.
 */
@Repository
public interface DonorRepository extends JpaRepository<Donor, Long> {

    List<Donor> findByBloodGroup(BloodGroup bloodGroup);

    List<Donor> findByAvailabilityStatus(AvailabilityStatus status);

    List<Donor> findByBloodGroupAndAvailabilityStatus(BloodGroup bloodGroup, AvailabilityStatus status);

    @Query("SELECT d FROM Donor d WHERE d.bloodGroup = :bloodGroup AND d.availabilityStatus = 'AVAILABLE' AND d.isActive = true")
    List<Donor> findEligibleDonors(@Param("bloodGroup") BloodGroup bloodGroup);

    @Query("SELECT d FROM Donor d WHERE d.availabilityStatus = 'AVAILABLE' AND d.isActive = true")
    List<Donor> findAllAvailableDonors();

    @Query("SELECT d FROM Donor d WHERE d.emergencyAvailable = true AND d.availabilityStatus = 'AVAILABLE'")
    List<Donor> findEmergencyAvailableDonors();
}
