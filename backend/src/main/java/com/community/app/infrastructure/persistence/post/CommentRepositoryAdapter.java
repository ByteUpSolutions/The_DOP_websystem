package com.community.app.infrastructure.persistence.post;

import com.community.app.domain.post.Comment;
import com.community.app.domain.post.CommentRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class CommentRepositoryAdapter implements CommentRepository {

    private final CommentJpaRepository jpaRepository;

    public CommentRepositoryAdapter(CommentJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Comment save(Comment comment) {
        CommentJpaEntity entity = PostMapper.toJpaEntity(comment);
        return PostMapper.toDomain(jpaRepository.save(entity));
    }

    @Override
    public List<Comment> findByPostId(UUID postId) {
        return jpaRepository.findByPostId(postId)
                .stream()
                .map(PostMapper::toDomain)
                .collect(Collectors.toList());
    }
}
