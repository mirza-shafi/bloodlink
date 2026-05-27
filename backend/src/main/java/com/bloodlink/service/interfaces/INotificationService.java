package com.bloodlink.service.interfaces;

import com.bloodlink.dto.NotificationDTO;

import java.util.List;

/**
 * Notification service interface for notification operations.
 */
public interface INotificationService {
    List<NotificationDTO> getUserNotifications(Long userId);
    List<NotificationDTO> getUnreadNotifications(Long userId);
    NotificationDTO createNotification(Long userId, String type, String title, String message, Long relatedRequestId);
    void markAsRead(Long notificationId);
    void markAllAsRead(Long userId);
    Long getUnreadCount(Long userId);
}
