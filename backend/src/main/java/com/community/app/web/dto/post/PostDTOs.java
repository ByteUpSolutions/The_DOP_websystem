package com.community.app.web.dto.post;

import com.community.app.domain.post.Post;
import com.community.app.web.dto.UserResponseDTO;

import java.time.LocalDateTime;
import java.util.UUID;

public class PostDTOs {

    public record CreatePostRequest(String title, String content) {
    }

    public record PostResponse(UUID id, String title, String content, UserResponseDTO author, UUID communityId,
            LocalDateTime createdAt, int upvotes, int downvotes) {
        public static PostResponse fromDomain(Post post) {
            return new PostResponse(post.id(), post.title(), post.content(), UserResponseDTO.fromDomain(post.author()),
                    post.community().id(), post.createdAt(), post.upvotes(), post.downvotes());
        }
    }

    public record CreateCommentRequest(String content, UUID parentCommentId) {
    }

    public record VoteRequest(String type) {
    }

    public record PostDetailsResponse(PostResponse post,
            java.util.List<com.community.app.web.dto.post.CommentDTOs.CommentResponse> comments) {
    }
}
