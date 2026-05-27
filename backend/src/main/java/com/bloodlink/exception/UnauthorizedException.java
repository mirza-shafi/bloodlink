package com.bloodlink.exception;

/**
 * Exception thrown for authentication failures.
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
