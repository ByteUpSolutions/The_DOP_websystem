package com.community.app.domain.post;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PostRepository {
    Post save(Post post);
    Optional<Post> findById(UUID id);
    List<Post> findByCommunityId(UUID communityId, int page, int size);
}
