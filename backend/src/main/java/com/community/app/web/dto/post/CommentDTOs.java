package com.community.app.web.dto.post;

import com.community.app.domain.post.Comment;
import com.community.app.web.dto.UserResponseDTO;

import java.time.LocalDateTime;
import java.util.UUID;

public class CommentDTOs {

    public record CommentResponse(
            UUID id,
            String content,
            UserResponseDTO author,
            LocalDateTime createdAt,
            UUID parentCommentId) {
        public static CommentResponse fromDomain(Comment comment) {
            return new CommentResponse(
                    comment.id(),
                    comment.content(),
                    UserResponseDTO.fromDomain(comment.author()),
                    comment.createdAt(),
                    comment.parentComment() != null ? comment.parentComment().id() : null);
        }
    }
}
