package com.bloodlink.enums;

/**
 * Blood request lifecycle statuses.
 * Tracks the state of a blood request from creation to completion.
 */
public enum RequestStatus {
    PENDING,
    ACCEPTED,
    DECLINED,
    COMPLETED,
    CANCELLED
}
