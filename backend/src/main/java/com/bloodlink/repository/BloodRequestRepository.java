package com.bloodlink.repository;

import com.bloodlink.entity.BloodRequest;
import com.bloodlink.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for BloodRequest entity.
 */
@Repository
public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {

    List<BloodRequest> findByPatientId(Long patientId);

    List<BloodRequest> findByDonorId(Long donorId);

    List<BloodRequest> findByStatus(RequestStatus status);

    @Query("SELECT br FROM BloodRequest br WHERE br.patient.id = :patientId ORDER BY br.createdAt DESC")
    List<BloodRequest> findByPatientIdOrderByCreatedAtDesc(@Param("patientId") Long patientId);

    @Query("SELECT br FROM BloodRequest br WHERE br.donor.id = :donorId ORDER BY br.createdAt DESC")
    List<BloodRequest> findByDonorIdOrderByCreatedAtDesc(@Param("donorId") Long donorId);

    @Query("SELECT COUNT(br) FROM BloodRequest br WHERE br.status = :status")
    Long countByStatus(@Param("status") RequestStatus status);
}
