package com.community.app.domain.post;

import com.community.app.domain.community.Community;
import com.community.app.domain.user.User;

import java.time.LocalDateTime;
import java.util.UUID;

public record Post(
    UUID id,
    String title,
    String content,
    User author,
    Community community,
    LocalDateTime createdAt,
    int upvotes,
    int downvotes
) {
    public static Post createNew(String title, String content, User author, Community community) {
        return new Post(UUID.randomUUID(), title, content, author, community, LocalDateTime.now(), 0, 0);
    }
}
