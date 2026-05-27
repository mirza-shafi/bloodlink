package com.bloodlink.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Message DTO for transferring message data.
 */
@Data
public class MessageDTO {
    private Long id;
    private Long chatId;
    private Long senderId;
    private String senderName;
    private String senderPhoto;
    private String content;
    private LocalDateTime timestamp;
    private Boolean isRead;
}
