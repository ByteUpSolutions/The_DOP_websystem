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

    public VoteUseCase(VoteRepository voteRepository, PostRepository postRepository,
            CommentRepository commentRepository) {
        this.voteRepository = voteRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
    }

    @Transactional
    public Post executeForPost(User user, UUID postId, Vote.VoteType type) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        java.util.Optional<Vote> existingVoteOpt = voteRepository.findByUserIdAndPostId(user.id(), postId);

        if (existingVoteOpt.isPresent()) {
            Vote existingVote = existingVoteOpt.get();
            if (existingVote.type() == type) {
                // Remove o voto se for do mesmo tipo (toggle)
                voteRepository.delete(existingVote);

                // Decrementa contagem
                if (type == Vote.VoteType.UP) {
                    post = new Post(post.id(), post.title(), post.content(), post.author(), post.community(),
                            post.createdAt(), Math.max(0, post.upvotes() - 1), post.downvotes());
                } else {
                    post = new Post(post.id(), post.title(), post.content(), post.author(), post.community(),
                            post.createdAt(), post.upvotes(), Math.max(0, post.downvotes() - 1));
                }
            } else {
                // Atualiza o voto se for diferente
                Vote updatedVote = new Vote(existingVote.id(), existingVote.user(), existingVote.post(),
                        existingVote.comment(), type);
                voteRepository.save(updatedVote);

                // Atualiza contagens (remove do anterior, adiciona no novo)
                if (type == Vote.VoteType.UP) {
                    post = new Post(post.id(), post.title(), post.content(), post.author(), post.community(),
                            post.createdAt(), post.upvotes() + 1, Math.max(0, post.downvotes() - 1));
                } else {
                    post = new Post(post.id(), post.title(), post.content(), post.author(), post.community(),
                            post.createdAt(), Math.max(0, post.upvotes() - 1), post.downvotes() + 1);
                }
            }
        } else {
            // Cria novo voto
            Vote newVote = Vote.forPost(user, post, type);
            voteRepository.save(newVote);

            if (type == Vote.VoteType.UP) {
                post = new Post(post.id(), post.title(), post.content(), post.author(), post.community(),
                        post.createdAt(), post.upvotes() + 1, post.downvotes());
            } else {
                post = new Post(post.id(), post.title(), post.content(), post.author(), post.community(),
                        post.createdAt(), post.upvotes(), post.downvotes() + 1);
            }
        }

        return postRepository.save(post);
    }

    // Implementar executeForComment de forma similar
}
