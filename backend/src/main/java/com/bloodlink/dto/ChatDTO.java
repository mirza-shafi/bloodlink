package com.bloodlink.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Chat DTO for transferring chat conversation data.
 */
@Data
public class ChatDTO {
    private Long id;
    private Long participant1Id;
    private String participant1Name;
    private String participant1Photo;
    private Long participant2Id;
    private String participant2Name;
    private String participant2Photo;
    private LocalDateTime createdAt;
    private LocalDateTime lastMessageAt;
    private String lastMessage;
    private Boolean unread;
}
