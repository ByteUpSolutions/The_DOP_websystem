package com.community.app.application.post;

import com.community.app.domain.community.Community;
import com.community.app.domain.post.*;
import com.community.app.domain.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("VoteUseCase")
class VoteUseCaseTest {

    @Mock
    private VoteRepository voteRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private CommentRepository commentRepository;

    @InjectMocks
    private VoteUseCase useCase;

    private User user;
    private Post post;
    private UUID postId;

    @BeforeEach
    void setUp() {
        postId = UUID.randomUUID();
        user = new User(UUID.randomUUID(), "Votante", "votante@test.com",
                "hash", "USER", "fuid", null, LocalDateTime.now(), true);

        Community community = new Community(UUID.randomUUID(), "Dev Talk", "Desc",
                null, false, LocalDateTime.now());

        post = new Post(postId, "Post Title", "Content", user, community,
                LocalDateTime.now(), 0, 0);
    }

    @Test
    @DisplayName("deve incrementar upvotes quando primeiro voto é UP")
    void shouldIncrementUpvotesOnFirstUpvote() {
        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(voteRepository.findByUserIdAndPostId(user.id(), postId)).thenReturn(Optional.empty());
        when(postRepository.save(any(Post.class))).thenAnswer(inv -> inv.getArgument(0));

        Post result = useCase.executeForPost(user, postId, Vote.VoteType.UP);

        assertThat(result.upvotes()).isEqualTo(1);
        assertThat(result.downvotes()).isZero();
        verify(voteRepository).save(any(Vote.class));
    }

    @Test
    @DisplayName("deve incrementar downvotes quando primeiro voto é DOWN")
    void shouldIncrementDownvotesOnFirstDownvote() {
        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(voteRepository.findByUserIdAndPostId(user.id(), postId)).thenReturn(Optional.empty());
        when(postRepository.save(any(Post.class))).thenAnswer(inv -> inv.getArgument(0));

        Post result = useCase.executeForPost(user, postId, Vote.VoteType.DOWN);

        assertThat(result.downvotes()).isEqualTo(1);
        assertThat(result.upvotes()).isZero();
    }

    @Test
    @DisplayName("deve remover voto (toggle) ao votar do mesmo tipo duas vezes")
    void shouldRemoveVoteWhenSameTypeVotedTwice() {
        Post postWithUpvote = new Post(postId, "Post Title", "Content", user,
                post.community(), LocalDateTime.now(), 1, 0);

        Vote existingVote = Vote.forPost(user, postWithUpvote, Vote.VoteType.UP);

        when(postRepository.findById(postId)).thenReturn(Optional.of(postWithUpvote));
        when(voteRepository.findByUserIdAndPostId(user.id(), postId)).thenReturn(Optional.of(existingVote));
        when(postRepository.save(any(Post.class))).thenAnswer(inv -> inv.getArgument(0));

        Post result = useCase.executeForPost(user, postId, Vote.VoteType.UP);

        assertThat(result.upvotes()).isZero();
        verify(voteRepository).delete(existingVote);
    }

    @Test
    @DisplayName("deve trocar voto de UP para DOWN e atualizar ambos os contadores")
    void shouldSwitchVoteFromUpToDown() {
        Post postWithUpvote = new Post(postId, "Post Title", "Content", user,
                post.community(), LocalDateTime.now(), 1, 0);

        Vote existingUpVote = Vote.forPost(user, postWithUpvote, Vote.VoteType.UP);

        when(postRepository.findById(postId)).thenReturn(Optional.of(postWithUpvote));
        when(voteRepository.findByUserIdAndPostId(user.id(), postId)).thenReturn(Optional.of(existingUpVote));
        when(postRepository.save(any(Post.class))).thenAnswer(inv -> inv.getArgument(0));

        Post result = useCase.executeForPost(user, postId, Vote.VoteType.DOWN);

        assertThat(result.upvotes()).isZero();
        assertThat(result.downvotes()).isEqualTo(1);
        verify(voteRepository).save(any(Vote.class));
    }

    @Test
    @DisplayName("deve lançar exceção quando post não é encontrado")
    void shouldThrowExceptionWhenPostNotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(postRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> useCase.executeForPost(user, nonExistentId, Vote.VoteType.UP))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Post not found");
    }
}
