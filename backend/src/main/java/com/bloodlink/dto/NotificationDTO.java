package com.bloodlink.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Notification DTO for transferring notification data.
 */
@Data
public class NotificationDTO {
    private Long id;
    private String type;
    private String title;
    private String message;
    private Long relatedRequestId;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
