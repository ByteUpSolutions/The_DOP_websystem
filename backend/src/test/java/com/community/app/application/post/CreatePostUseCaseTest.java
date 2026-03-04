package com.community.app.application.post;

import com.community.app.domain.community.Community;
import com.community.app.domain.community.CommunityRepository;
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
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("CreatePostUseCase")
class CreatePostUseCaseTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private CommunityRepository communityRepository;

    @InjectMocks
    private CreatePostUseCase useCase;

    private User author;
    private Community community;
    private UUID communityId;

    @BeforeEach
    void setUp() {
        communityId = UUID.randomUUID();
        author = new User(UUID.randomUUID(), "Autor", "autor@test.com",
                "hash", "USER", "fuid", null, LocalDateTime.now(), true);
        community = new Community(communityId, "Dev Talk", "Comunidade de devs",
                null, false, LocalDateTime.now());
    }

    @Test
    @DisplayName("deve criar post com sucesso quando comunidade existe")
    void shouldCreatePostSuccessfully() {
        Post savedPost = Post.createNew("Meu Primeiro Post", "Conteúdo aqui", author, community);

        when(communityRepository.findById(communityId)).thenReturn(Optional.of(community));
        when(postRepository.save(any(Post.class))).thenReturn(savedPost);

        Post result = useCase.execute("Meu Primeiro Post", "Conteúdo aqui", author, communityId);

        assertThat(result).isNotNull();
        assertThat(result.title()).isEqualTo("Meu Primeiro Post");
        assertThat(result.content()).isEqualTo("Conteúdo aqui");
        assertThat(result.author()).isEqualTo(author);
        assertThat(result.upvotes()).isZero();
        assertThat(result.downvotes()).isZero();
    }

    @Test
    @DisplayName("deve lançar exceção quando comunidade não é encontrada")
    void shouldThrowExceptionWhenCommunityNotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(communityRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> useCase.execute("Título", "Conteúdo", author, nonExistentId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Community not found");
    }
}
