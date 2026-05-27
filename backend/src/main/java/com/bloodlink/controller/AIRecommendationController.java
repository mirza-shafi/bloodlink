package com.bloodlink.controller;

import com.bloodlink.dto.ApiResponse;
import com.bloodlink.dto.DonorDTO;
import com.bloodlink.service.interfaces.IAIRecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AI Recommendation Controller.
 * Provides AI-powered donor matching recommendations.
 * REST API endpoint: /api/ai
 */
@RestController
@RequestMapping("/api/ai")
public class AIRecommendationController {

    private final IAIRecommendationService aiService;

    public AIRecommendationController(IAIRecommendationService aiService) {
        this.aiService = aiService;
    }

    @GetMapping("/recommend/{patientId}")
    public ResponseEntity<ApiResponse<List<DonorDTO>>> recommendDonors(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "10") int limit) {
        List<DonorDTO> donors = aiService.recommendDonors(patientId, limit);
        return ResponseEntity.ok(ApiResponse.success(donors));
    }

    @GetMapping("/recommend")
    public ResponseEntity<ApiResponse<List<DonorDTO>>> recommendForRequest(
            @RequestParam Long patientId,
            @RequestParam(required = false) String bloodGroup,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(defaultValue = "10") int limit) {
        List<DonorDTO> donors = aiService.recommendDonorsForRequest(
                patientId, bloodGroup, latitude, longitude, limit);
        return ResponseEntity.ok(ApiResponse.success(donors));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Object>> getStats() {
        // Return platform statistics
        return ResponseEntity.ok(ApiResponse.success("AI Recommendation Engine is active"));
    }
}
