package com.bloodlink.websocket.dto;

import lombok.Data;

/**
 * WebSocket chat notification payload.
 */
@Data
public class ChatNotification {
    private Long chatId;
    private Long senderId;
    private String senderName;
    private String content;
    private String type;
}
