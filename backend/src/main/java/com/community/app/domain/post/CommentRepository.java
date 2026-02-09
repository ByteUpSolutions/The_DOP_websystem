package com.community.app.domain.post;

import java.util.List;
import java.util.UUID;

public interface CommentRepository {
    Comment save(Comment comment);
    List<Comment> findByPostId(UUID postId);
}
