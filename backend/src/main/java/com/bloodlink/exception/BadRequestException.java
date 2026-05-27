package com.bloodlink.exception;

/**
 * Exception thrown for invalid requests.
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
