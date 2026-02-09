package com.community.app.infrastructure.persistence.post;

import com.community.app.domain.post.Comment;
import com.community.app.domain.post.Post;
import com.community.app.domain.post.Vote;
import com.community.app.infrastructure.persistence.CommunityMapper;
import com.community.app.infrastructure.persistence.UserMapper;

public class PostMapper {

    public static PostJpaEntity toJpaEntity(Post domain) {
        return PostJpaEntity.builder()
                .id(domain.id())
                .title(domain.title())
                .content(domain.content())
                .author(UserMapper.toJpaEntity(domain.author()))
                .community(CommunityMapper.toJpaEntity(domain.community()))
                .createdAt(domain.createdAt())
                .upvotes(domain.upvotes())
                .downvotes(domain.downvotes())
                .build();
    }

    public static Post toDomain(PostJpaEntity entity) {
        return new Post(
                entity.getId(),
                entity.getTitle(),
                entity.getContent(),
                UserMapper.toDomain(entity.getAuthor()),
                CommunityMapper.toDomain(entity.getCommunity()),
                entity.getCreatedAt(),
                entity.getUpvotes(),
                entity.getDownvotes()
        );
    }

    public static CommentJpaEntity toJpaEntity(Comment domain) {
        return CommentJpaEntity.builder()
                .id(domain.id())
                .content(domain.content())
                .author(UserMapper.toJpaEntity(domain.author()))
                .post(toJpaEntity(domain.post()))
                .parentComment(domain.parentComment() != null ? toJpaEntity(domain.parentComment()) : null)
                .createdAt(domain.createdAt())
                .build();
    }

    public static Comment toDomain(CommentJpaEntity entity) {
        return new Comment(
                entity.getId(),
                entity.getContent(),
                UserMapper.toDomain(entity.getAuthor()),
                toDomain(entity.getPost()),
                entity.getParentComment() != null ? toDomain(entity.getParentComment()) : null,
                entity.getCreatedAt()
        );
    }

    public static VoteJpaEntity toJpaEntity(Vote domain) {
        return VoteJpaEntity.builder()
                .id(domain.id())
                .user(UserMapper.toJpaEntity(domain.user()))
                .post(domain.post() != null ? toJpaEntity(domain.post()) : null)
                .comment(domain.comment() != null ? toJpaEntity(domain.comment()) : null)
                .type(domain.type())
                .build();
    }

    public static Vote toDomain(VoteJpaEntity entity) {
        return new Vote(
                entity.getId(),
                UserMapper.toDomain(entity.getUser()),
                entity.getPost() != null ? toDomain(entity.getPost()) : null,
                entity.getComment() != null ? toDomain(entity.getComment()) : null,
                entity.getType()
        );
    }
}
