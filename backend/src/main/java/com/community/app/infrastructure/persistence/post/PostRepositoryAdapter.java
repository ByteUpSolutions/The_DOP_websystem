package com.community.app.infrastructure.persistence.post;

import com.community.app.domain.post.Post;
import com.community.app.domain.post.PostRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class PostRepositoryAdapter implements PostRepository {

    private final PostJpaRepository jpaRepository;

    public PostRepositoryAdapter(PostJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Post save(Post post) {
        PostJpaEntity entity = PostMapper.toJpaEntity(post);
        return PostMapper.toDomain(jpaRepository.save(entity));
    }

    @Override
    public Optional<Post> findById(UUID id) {
        return jpaRepository.findById(id).map(PostMapper::toDomain);
    }

    @Override
    public List<Post> findByCommunityId(UUID communityId, int page, int size) {
        return jpaRepository.findByCommunityId(communityId, PageRequest.of(page, size))
                .stream()
                .map(PostMapper::toDomain)
                .collect(Collectors.toList());
    }
}
