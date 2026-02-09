package com.community.app.application.post;

import com.community.app.domain.community.CommunityRepository;
import com.community.app.domain.post.Post;
import com.community.app.domain.post.PostRepository;
import com.community.app.domain.user.User;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CreatePostUseCase {

    private final PostRepository postRepository;
    private final CommunityRepository communityRepository;

    public CreatePostUseCase(PostRepository postRepository, CommunityRepository communityRepository) {
        this.postRepository = postRepository;
        this.communityRepository = communityRepository;
    }

    public Post execute(String title, String content, User author, UUID communityId) {
        var community = communityRepository.findById(communityId)
                .orElseThrow(() -> new RuntimeException("Community not found"));

        Post newPost = Post.createNew(title, content, author, community);
        return postRepository.save(newPost);
    }
}
