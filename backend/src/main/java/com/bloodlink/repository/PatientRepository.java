package com.bloodlink.repository;

import com.bloodlink.entity.Patient;
import com.bloodlink.enums.BloodGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Patient entity.
 */
@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    List<Patient> findByRequiredBloodGroup(BloodGroup bloodGroup);
}
