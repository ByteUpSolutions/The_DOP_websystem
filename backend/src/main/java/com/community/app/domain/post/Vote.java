package com.community.app.domain.post;

import com.community.app.domain.user.User;

import java.util.UUID;

public record Vote(
    UUID id,
    User user,
    Post post,
    Comment comment,
    VoteType type
) {
    public enum VoteType {
        UP, DOWN
    }

    public static Vote forPost(User user, Post post, VoteType type) {
        return new Vote(UUID.randomUUID(), user, post, null, type);
    }

    public static Vote forComment(User user, Comment comment, VoteType type) {
        return new Vote(UUID.randomUUID(), user, null, comment, type);
    }
}
