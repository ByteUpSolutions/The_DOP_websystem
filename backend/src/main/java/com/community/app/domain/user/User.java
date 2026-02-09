package com.community.app.domain.user;

import java.time.LocalDateTime;
import java.util.UUID;

public record User(
    UUID id,
    String fullName,
    String email,
    String passwordHash,
    String role,
    String firebaseUid,
    String avatarUrl,
    LocalDateTime createdAt,
    Boolean active
) {
    public static User createNew(String fullName, String email, String passwordHash, String firebaseUid) {
        return new User(UUID.randomUUID(), fullName, email, passwordHash, "USER", firebaseUid, null, LocalDateTime.now(), true);
    }
}
