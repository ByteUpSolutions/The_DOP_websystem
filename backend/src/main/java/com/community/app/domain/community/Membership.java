package com.community.app.domain.community;

import com.community.app.domain.user.User;
import java.time.LocalDateTime;
import java.util.UUID;

public record Membership(
    UUID id,
    User user,
    Community community,
    String role,
    LocalDateTime joinedAt
) {
    public static Membership createNew(User user, Community community) {
        return new Membership(UUID.randomUUID(), user, community, "MEMBER", LocalDateTime.now());
    }
}
