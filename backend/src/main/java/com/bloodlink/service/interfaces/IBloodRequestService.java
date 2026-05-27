package com.bloodlink.service.interfaces;

import com.bloodlink.dto.BloodRequestDTO;
import com.bloodlink.enums.RequestStatus;

import java.util.List;

/**
 * Blood request service interface for request lifecycle management.
 */
public interface IBloodRequestService {
    BloodRequestDTO createRequest(Long patientId, BloodRequestDTO requestDTO);
    BloodRequestDTO getRequestById(Long id);
    List<BloodRequestDTO> getRequestsByPatient(Long patientId);
    List<BloodRequestDTO> getRequestsByDonor(Long donorId);
    BloodRequestDTO updateRequestStatus(Long requestId, RequestStatus status);
    BloodRequestDTO acceptRequest(Long requestId, Long donorId);
    BloodRequestDTO declineRequest(Long requestId, Long donorId);
    BloodRequestDTO completeRequest(Long requestId);
    void cancelRequest(Long requestId);
}
