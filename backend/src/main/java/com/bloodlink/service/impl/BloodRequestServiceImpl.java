package com.bloodlink.service.impl;

import com.bloodlink.dto.BloodRequestDTO;
import com.bloodlink.entity.BloodRequest;
import com.bloodlink.entity.Donor;
import com.bloodlink.entity.Patient;
import com.bloodlink.enums.RequestStatus;
import com.bloodlink.exception.BadRequestException;
import com.bloodlink.exception.ResourceNotFoundException;
import com.bloodlink.repository.BloodRequestRepository;
import com.bloodlink.repository.DonorRepository;
import com.bloodlink.repository.PatientRepository;
import com.bloodlink.service.interfaces.IBloodRequestService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Blood Request Service Implementation.
 * Manages the full lifecycle of blood donation requests.
 */
@Service
@Transactional
public class BloodRequestServiceImpl implements IBloodRequestService {

    private final BloodRequestRepository requestRepository;
    private final DonorRepository donorRepository;
    private final PatientRepository patientRepository;

    public BloodRequestServiceImpl(BloodRequestRepository requestRepository,
                                   DonorRepository donorRepository,
                                   PatientRepository patientRepository) {
        this.requestRepository = requestRepository;
        this.donorRepository = donorRepository;
        this.patientRepository = patientRepository;
    }

    @Override
    public BloodRequestDTO createRequest(Long patientId, BloodRequestDTO requestDTO) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        Donor donor = donorRepository.findById(requestDTO.getDonorId())
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found"));

        BloodRequest request = new BloodRequest();
        request.setPatient(patient);
        request.setDonor(donor);
        request.setBloodGroup(requestDTO.getBloodGroup());
        request.setUnitsRequired(requestDTO.getUnitsRequired());
        request.setHospitalName(requestDTO.getHospitalName());
        request.setHospitalAddress(requestDTO.getHospitalAddress());
        request.setEmergencyLevel(requestDTO.getEmergencyLevel());
        request.setRequiredDate(requestDTO.getRequiredDate());
        request.setMessage(requestDTO.getMessage());
        request.setStatus(RequestStatus.PENDING);

        request = requestRepository.save(request);
        return mapToDTO(request);
    }

    @Override
    @Transactional(readOnly = true)
    public BloodRequestDTO getRequestById(Long id) {
        BloodRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found: " + id));
        return mapToDTO(request);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BloodRequestDTO> getRequestsByPatient(Long patientId) {
        return requestRepository.findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BloodRequestDTO> getRequestsByDonor(Long donorId) {
        return requestRepository.findByDonorIdOrderByCreatedAtDesc(donorId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BloodRequestDTO updateRequestStatus(Long requestId, RequestStatus status) {
        BloodRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
        request.setStatus(status);
        request = requestRepository.save(request);
        return mapToDTO(request);
    }

    @Override
    public BloodRequestDTO acceptRequest(Long requestId, Long donorId) {
        BloodRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Request is not in pending status");
        }

        request.setStatus(RequestStatus.ACCEPTED);
        request = requestRepository.save(request);
        return mapToDTO(request);
    }

    @Override
    public BloodRequestDTO declineRequest(Long requestId, Long donorId) {
        BloodRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Request is not in pending status");
        }

        request.setStatus(RequestStatus.DECLINED);
        request = requestRepository.save(request);
        return mapToDTO(request);
    }

    @Override
    public BloodRequestDTO completeRequest(Long requestId) {
        BloodRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
        request.setStatus(RequestStatus.COMPLETED);
        request = requestRepository.save(request);
        return mapToDTO(request);
    }

    @Override
    public void cancelRequest(Long requestId) {
        BloodRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
        request.setStatus(RequestStatus.CANCELLED);
        requestRepository.save(request);
    }

    private BloodRequestDTO mapToDTO(BloodRequest request) {
        BloodRequestDTO dto = new BloodRequestDTO();
        dto.setId(request.getId());
        dto.setPatientId(request.getPatient().getId());
        dto.setPatientName(request.getPatient().getFullName());
        dto.setDonorId(request.getDonor().getId());
        dto.setDonorName(request.getDonor().getFullName());
        dto.setBloodGroup(request.getBloodGroup());
        dto.setUnitsRequired(request.getUnitsRequired());
        dto.setHospitalName(request.getHospitalName());
        dto.setHospitalAddress(request.getHospitalAddress());
        dto.setEmergencyLevel(request.getEmergencyLevel());
        dto.setRequiredDate(request.getRequiredDate());
        dto.setStatus(request.getStatus());
        dto.setMessage(request.getMessage());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        return dto;
    }
}
