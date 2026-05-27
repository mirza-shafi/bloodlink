package com.bloodlink.service.interfaces;

import com.bloodlink.dto.ChatDTO;
import com.bloodlink.dto.MessageDTO;

import java.util.List;

/**
 * Chat service interface for messaging operations.
 */
public interface IChatService {
    ChatDTO createChat(Long user1Id, Long user2Id);
    List<ChatDTO> getUserChats(Long userId);
    List<MessageDTO> getChatMessages(Long chatId, Long userId);
    MessageDTO sendMessage(Long chatId, Long senderId, String content);
    void markAsRead(Long chatId, Long userId);
}
