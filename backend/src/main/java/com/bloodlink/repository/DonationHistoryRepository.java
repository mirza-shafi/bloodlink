package com.bloodlink.repository;

import com.bloodlink.entity.DonationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for DonationHistory entity.
 */
@Repository
public interface DonationHistoryRepository extends JpaRepository<DonationHistory, Long> {

    List<DonationHistory> findByDonorId(Long donorId);

    List<DonationHistory> findByDonorIdOrderByDonationDateDesc(Long donorId);
}
