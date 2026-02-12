package com.community.app.infrastructure.persistence.post;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface VoteJpaRepository extends JpaRepository<VoteJpaEntity, UUID> {

    @Query("SELECT v FROM VoteJpaEntity v WHERE v.user.id = :userId AND v.post.id = :postId")
    Optional<VoteJpaEntity> findByUserIdAndPostId(@Param("userId") UUID userId, @Param("postId") UUID postId);

    @Query("SELECT v FROM VoteJpaEntity v WHERE v.user.id = :userId AND v.comment.id = :commentId")
    Optional<VoteJpaEntity> findByUserIdAndCommentId(@Param("userId") UUID userId, @Param("commentId") UUID commentId);
}
