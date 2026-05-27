package com.bloodlink.controller;

import com.bloodlink.dto.ApiResponse;
import com.bloodlink.dto.ChatDTO;
import com.bloodlink.dto.MessageDTO;
import com.bloodlink.service.interfaces.IChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Chat Controller (REST API fallback).
 * REST API endpoint: /api/chats
 */
@RestController
@RequestMapping("/api/chats")
public class ChatController {

    private final IChatService chatService;

    public ChatController(IChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ChatDTO>> createChat(
            @RequestAttribute("userId") Long userId,
            @RequestParam Long otherUserId) {
        ChatDTO chat = chatService.createChat(userId, otherUserId);
        return ResponseEntity.ok(ApiResponse.success(chat));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ChatDTO>>> getUserChats(@RequestAttribute("userId") Long userId) {
        List<ChatDTO> chats = chatService.getUserChats(userId);
        return ResponseEntity.ok(ApiResponse.success(chats));
    }

    @GetMapping("/{chatId}/messages")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getChatMessages(
            @PathVariable Long chatId,
            @RequestAttribute("userId") Long userId) {
        List<MessageDTO> messages = chatService.getChatMessages(chatId, userId);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @PostMapping("/{chatId}/messages")
    public ResponseEntity<ApiResponse<MessageDTO>> sendMessage(
            @PathVariable Long chatId,
            @RequestAttribute("userId") Long userId,
            @RequestParam String content) {
        MessageDTO message = chatService.sendMessage(chatId, userId, content);
        return ResponseEntity.ok(ApiResponse.success(message));
    }

    @PutMapping("/{chatId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long chatId,
            @RequestAttribute("userId") Long userId) {
        chatService.markAsRead(chatId, userId);
        return ResponseEntity.ok(ApiResponse.success("Messages marked as read", null));
    }
}
