package com.community.app.application.post;

import com.community.app.domain.post.Comment;
import com.community.app.domain.post.CommentRepository;
import com.community.app.domain.post.PostRepository;
import com.community.app.domain.user.User;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CreateCommentUseCase {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    public CreateCommentUseCase(CommentRepository commentRepository, PostRepository postRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
    }

    public Comment execute(String content, User author, UUID postId, UUID parentCommentId) {
        var post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Comment parentComment = null;
        if (parentCommentId != null) {
            // Lógica para encontrar o comentário pai (simplificada)
            parentComment = commentRepository.findByPostId(postId).stream()
                .filter(c -> c.id().equals(parentCommentId)).findFirst().orElse(null);
        }

        Comment newComment = Comment.createNew(content, author, post, parentComment);
        return commentRepository.save(newComment);
    }
}
