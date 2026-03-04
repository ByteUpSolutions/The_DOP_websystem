package com.community.app.application.post;

import com.community.app.domain.community.Community;
import com.community.app.domain.post.Comment;
import com.community.app.domain.post.CommentRepository;
import com.community.app.domain.post.Post;
import com.community.app.domain.post.PostRepository;
import com.community.app.domain.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("CreateCommentUseCase")
class CreateCommentUseCaseTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private PostRepository postRepository;

    @InjectMocks
    private CreateCommentUseCase useCase;

    private User author;
    private Post post;
    private UUID postId;

    @BeforeEach
    void setUp() {
        postId = UUID.randomUUID();
        author = new User(UUID.randomUUID(), "Comentarista", "comentarista@test.com",
                "hash", "USER", "fuid", null, LocalDateTime.now(), true);

        Community community = new Community(UUID.randomUUID(), "Dev Talk", "Descricao",
                null, false, LocalDateTime.now());

        post = new Post(postId, "Post Title", "Post Content", author, community,
                LocalDateTime.now(), 0, 0);
    }

    @Test
    @DisplayName("deve criar comentário raiz (sem pai) com sucesso")
    void shouldCreateRootCommentSuccessfully() {
        Comment savedComment = Comment.createNew("Meu comentário", author, post, null);

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(commentRepository.save(any(Comment.class))).thenReturn(savedComment);

        Comment result = useCase.execute("Meu comentário", author, postId, null);

        assertThat(result).isNotNull();
        assertThat(result.content()).isEqualTo("Meu comentário");
        assertThat(result.author()).isEqualTo(author);
        assertThat(result.parentComment()).isNull();
    }

    @Test
    @DisplayName("deve criar reply para um comentário pai existente")
    void shouldCreateReplyToParentComment() {
        UUID parentId = UUID.randomUUID();
        Comment parentComment = new Comment(parentId, "Comentário pai", author, post,
                null, LocalDateTime.now());
        Comment savedReply = Comment.createNew("Minha resposta", author, post, parentComment);

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(commentRepository.findByPostId(postId)).thenReturn(List.of(parentComment));
        when(commentRepository.save(any(Comment.class))).thenReturn(savedReply);

        Comment result = useCase.execute("Minha resposta", author, postId, parentId);

        assertThat(result).isNotNull();
        assertThat(result.content()).isEqualTo("Minha resposta");
        assertThat(result.parentComment()).isEqualTo(parentComment);
    }

    @Test
    @DisplayName("deve lançar exceção quando post não é encontrado")
    void shouldThrowExceptionWhenPostNotFound() {
        UUID nonExistentPostId = UUID.randomUUID();
        when(postRepository.findById(nonExistentPostId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> useCase.execute("Conteúdo", author, nonExistentPostId, null))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Post not found");
    }
}
