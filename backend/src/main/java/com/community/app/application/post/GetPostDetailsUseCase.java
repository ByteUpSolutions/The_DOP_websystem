package com.community.app.application.post;

import com.community.app.domain.post.Comment;
import com.community.app.domain.post.CommentRepository;
import com.community.app.domain.post.Post;
import com.community.app.domain.post.PostRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class GetPostDetailsUseCase {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    public GetPostDetailsUseCase(PostRepository postRepository, CommentRepository commentRepository) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
    }

    public PostDetails execute(UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        List<Comment> comments = commentRepository.findByPostId(postId);
        return new PostDetails(post, comments);
    }

    public record PostDetails(Post post, List<Comment> comments) {}
}
