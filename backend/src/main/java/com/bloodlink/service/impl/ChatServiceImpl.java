package com.bloodlink.service.impl;

import com.bloodlink.dto.ChatDTO;
import com.bloodlink.dto.MessageDTO;
import com.bloodlink.entity.AbstractUser;
import com.bloodlink.entity.Chat;
import com.bloodlink.entity.Message;
import com.bloodlink.exception.ResourceNotFoundException;
import com.bloodlink.repository.ChatRepository;
import com.bloodlink.repository.MessageRepository;
import com.bloodlink.repository.UserRepository;
import com.bloodlink.service.interfaces.IChatService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Chat Service Implementation.
 * Manages chat conversations and messages.
 */
@Service
@Transactional
public class ChatServiceImpl implements IChatService {

    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public ChatServiceImpl(ChatRepository chatRepository, MessageRepository messageRepository,
                           UserRepository userRepository) {
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    @Override
    public ChatDTO createChat(Long user1Id, Long user2Id) {
        if (user1Id.equals(user2Id)) {
            throw new IllegalArgumentException("Cannot create chat with yourself");
        }

        // Check if chat already exists
        var existing = chatRepository.findByParticipants(user1Id, user2Id);
        if (existing.isPresent()) {
            return mapToChatDTO(existing.get(), user1Id);
        }

        AbstractUser user1 = userRepository.findById(user1Id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        AbstractUser user2 = userRepository.findById(user2Id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Chat chat = new Chat();
        chat.setParticipant1(user1);
        chat.setParticipant2(user2);
        chat.setCreatedAt(LocalDateTime.now());
        chat.setLastMessageAt(LocalDateTime.now());

        chat = chatRepository.save(chat);
        return mapToChatDTO(chat, user1Id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatDTO> getUserChats(Long userId) {
        return chatRepository.findByParticipantId(userId).stream()
                .map(chat -> mapToChatDTO(chat, userId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageDTO> getChatMessages(Long chatId, Long userId) {
        return messageRepository.findByChatIdOrderByTimestampAsc(chatId).stream()
                .map(this::mapToMessageDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MessageDTO sendMessage(Long chatId, Long senderId, String content) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found"));
        AbstractUser sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));

        Message message = new Message();
        message.setChat(chat);
        message.setSender(sender);
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());
        message.setIsRead(false);

        message = messageRepository.save(message);

        // Update chat last message time
        chat.setLastMessageAt(LocalDateTime.now());
        chatRepository.save(chat);

        return mapToMessageDTO(message);
    }

    @Override
    public void markAsRead(Long chatId, Long userId) {
        messageRepository.markMessagesAsRead(chatId, userId);
    }

    private ChatDTO mapToChatDTO(Chat chat, Long currentUserId) {
        ChatDTO dto = new ChatDTO();
        dto.setId(chat.getId());

        // Set the other participant as the "contact"
        AbstractUser contact;
        if (chat.getParticipant1().getId().equals(currentUserId)) {
            contact = chat.getParticipant2();
        } else {
            contact = chat.getParticipant1();
        }

        dto.setParticipant1Id(chat.getParticipant1().getId());
        dto.setParticipant1Name(chat.getParticipant1().getFullName());
        dto.setParticipant1Photo(chat.getParticipant1().getProfilePhoto());
        dto.setParticipant2Id(chat.getParticipant2().getId());
        dto.setParticipant2Name(chat.getParticipant2().getFullName());
        dto.setParticipant2Photo(chat.getParticipant2().getProfilePhoto());
        dto.setCreatedAt(chat.getCreatedAt());
        dto.setLastMessageAt(chat.getLastMessageAt());

        // Set contact info
        dto.setLastMessage(chat.getLastMessageAt() != null ? "" : null);
        Long unreadCount = messageRepository.countUnreadMessages(chat.getId(), currentUserId);
        dto.setUnread(unreadCount != null && unreadCount > 0);

        return dto;
    }

    private MessageDTO mapToMessageDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setChatId(message.getChat().getId());
        dto.setSenderId(message.getSender().getId());
        dto.setSenderName(message.getSender().getFullName());
        dto.setSenderPhoto(message.getSender().getProfilePhoto());
        dto.setContent(message.getContent());
        dto.setTimestamp(message.getTimestamp());
        dto.setIsRead(message.getIsRead());
        return dto;
    }
}
