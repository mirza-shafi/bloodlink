package com.bloodlink.websocket;

import com.bloodlink.dto.MessageDTO;
import com.bloodlink.service.interfaces.IChatService;
import com.bloodlink.websocket.dto.ChatMessage;
import com.bloodlink.websocket.dto.ChatNotification;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 * WebSocket Controller for real-time chat.
 * Handles STOMP messaging over WebSocket.
 */
@Controller
public class ChatWebSocketController {

    private final IChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatWebSocketController(IChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        MessageDTO savedMessage = chatService.sendMessage(
                chatMessage.getChatId(),
                chatMessage.getSenderId(),
                chatMessage.getContent()
        );

        // Broadcast to chat room
        messagingTemplate.convertAndSend("/topic/chat/" + chatMessage.getChatId(), savedMessage);

        // Send notification to recipient
        ChatNotification notification = new ChatNotification();
        notification.setChatId(chatMessage.getChatId());
        notification.setSenderId(chatMessage.getSenderId());
        notification.setSenderName(savedMessage.getSenderName());
        notification.setContent(chatMessage.getContent());
        notification.setType("NEW_MESSAGE");

        messagingTemplate.convertAndSend("/topic/user/" + chatMessage.getRecipientId(), notification);
    }

    @MessageMapping("/chat.typing")
    public void typingIndicator(@Payload ChatMessage chatMessage) {
        messagingTemplate.convertAndSend(
                "/topic/chat/" + chatMessage.getChatId() + "/typing",
                chatMessage
        );
    }
}
