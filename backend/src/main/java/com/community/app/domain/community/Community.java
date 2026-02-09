package com.community.app.domain.community;

import java.time.LocalDateTime;
import java.util.UUID;

public record Community(
    UUID id,
    String name,
    String description,
    String iconUrl,
    Boolean isPrivate,
    LocalDateTime createdAt
) {
    public static Community createNew(String name, String description, Boolean isPrivate) {
        return new Community(UUID.randomUUID(), name, description, null, isPrivate, LocalDateTime.now());
    }
}
