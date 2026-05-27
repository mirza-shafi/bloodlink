package com.bloodlink.websocket.dto;

import lombok.Data;

/**
 * WebSocket chat message payload.
 */
@Data
public class ChatMessage {
    private Long chatId;
    private Long senderId;
    private Long recipientId;
    private String content;
    private String type;
}
