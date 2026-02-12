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
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class PostRepositoryAdapter implements PostRepository {

    private final PostJpaRepository jpaRepository;

    public PostRepositoryAdapter(PostJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public Post save(Post post) {
        System.out.println("Saving post: " + post.id() + ", Upvotes: " + post.upvotes());
        PostJpaEntity entity = PostMapper.toJpaEntity(post);
        PostJpaEntity savedEntity = jpaRepository.save(entity);
        System.out.println("Saved entity: " + savedEntity.getId() + ", Upvotes: " + savedEntity.getUpvotes());
        return PostMapper.toDomain(savedEntity);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public Optional<Post> findById(UUID id) {
        return jpaRepository.findById(id).map(PostMapper::toDomain);
    }

    @Override
    public List<Post> findByCommunityId(UUID communityId, int page, int size) {
        return jpaRepository.findByCommunity_Id(communityId, PageRequest.of(page, size))
                .stream()
                .map(PostMapper::toDomain)
                .collect(Collectors.toList());
    }
}
