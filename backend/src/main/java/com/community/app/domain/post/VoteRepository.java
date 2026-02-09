package com.community.app.domain.post;

import java.util.Optional;
import java.util.UUID;

public interface VoteRepository {
    Vote save(Vote vote);
    Optional<Vote> findByUserIdAndPostId(UUID userId, UUID postId);
    Optional<Vote> findByUserIdAndCommentId(UUID userId, UUID commentId);
    void delete(Vote vote);
}
