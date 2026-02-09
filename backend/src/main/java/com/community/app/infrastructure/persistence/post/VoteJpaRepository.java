package com.community.app.infrastructure.persistence.post;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface VoteJpaRepository extends JpaRepository<VoteJpaEntity, UUID> {
    Optional<VoteJpaEntity> findByUserIdAndPostId(UUID userId, UUID postId);
    Optional<VoteJpaEntity> findByUserIdAndCommentId(UUID userId, UUID commentId);
}
