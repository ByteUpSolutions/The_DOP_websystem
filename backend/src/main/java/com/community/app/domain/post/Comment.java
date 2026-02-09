package com.community.app.domain.post;

import com.community.app.domain.user.User;

import java.time.LocalDateTime;
import java.util.UUID;

public record Comment(
    UUID id,
    String content,
    User author,
    Post post,
    Comment parentComment,
    LocalDateTime createdAt
) {
    public static Comment createNew(String content, User author, Post post, Comment parentComment) {
        return new Comment(UUID.randomUUID(), content, author, post, parentComment, LocalDateTime.now());
    }
}
