package com.community.app.infrastructure.persistence.post;

import com.community.app.domain.post.Vote;
import com.community.app.domain.post.VoteRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public class VoteRepositoryAdapter implements VoteRepository {

    private final VoteJpaRepository jpaRepository;

    public VoteRepositoryAdapter(VoteJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Vote save(Vote vote) {
        VoteJpaEntity entity = PostMapper.toJpaEntity(vote);
        return PostMapper.toDomain(jpaRepository.save(entity));
    }

    @Override
    public Optional<Vote> findByUserIdAndPostId(UUID userId, UUID postId) {
        return jpaRepository.findByUserIdAndPostId(userId, postId).map(PostMapper::toDomain);
    }

    @Override
    public Optional<Vote> findByUserIdAndCommentId(UUID userId, UUID commentId) {
        return jpaRepository.findByUserIdAndCommentId(userId, commentId).map(PostMapper::toDomain);
    }

    @Override
    public void delete(Vote vote) {
        if (vote.id() != null) {
            jpaRepository.deleteById(vote.id());
        }
    }
}
