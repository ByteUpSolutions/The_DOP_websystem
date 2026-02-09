package com.community.app.application.post;

import com.community.app.domain.post.Post;
import com.community.app.domain.post.PostRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ListCommunityPostsUseCase {

    private final PostRepository postRepository;

    public ListCommunityPostsUseCase(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public List<Post> execute(UUID communityId, int page, int size) {
        return postRepository.findByCommunityId(communityId, page, size);
    }
}
