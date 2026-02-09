package com.community.app.application.post;

import com.community.app.domain.post.*;
import com.community.app.domain.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class VoteUseCase {

    private final VoteRepository voteRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    public VoteUseCase(VoteRepository voteRepository, PostRepository postRepository, CommentRepository commentRepository) {
        this.voteRepository = voteRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
    }

    @Transactional
    public void executeForPost(User user, UUID postId, Vote.VoteType type) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        voteRepository.findByUserIdAndPostId(user.id(), postId).ifPresent(vote -> {
            // Lógica para remover voto antigo
            voteRepository.delete(vote);
        });

        Vote newVote = Vote.forPost(user, post, type);
        voteRepository.save(newVote);

        // Lógica para atualizar contagem de votos (simplificada)
        // Em um cenário real, isso seria mais robusto
        if (type == Vote.VoteType.UP) {
            post = new Post(post.id(), post.title(), post.content(), post.author(), post.community(), post.createdAt(), post.upvotes() + 1, post.downvotes());
        } else {
            post = new Post(post.id(), post.title(), post.content(), post.author(), post.community(), post.createdAt(), post.upvotes(), post.downvotes() + 1);
        }
        postRepository.save(post);
    }

    // Implementar executeForComment de forma similar
}
