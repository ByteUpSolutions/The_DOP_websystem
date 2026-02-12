package com.community.app.web.controller;

import com.community.app.application.post.*;
import com.community.app.domain.user.User;
import com.community.app.domain.user.UserRepository;
import com.community.app.web.dto.post.PostDTOs;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class PostController {

    private final CreatePostUseCase createPostUseCase;
    private final ListCommunityPostsUseCase listCommunityPostsUseCase;
    private final GetPostDetailsUseCase getPostDetailsUseCase;
    private final CreateCommentUseCase createCommentUseCase;
    private final VoteUseCase voteUseCase;
    private final UserRepository userRepository;

    public PostController(CreatePostUseCase createPostUseCase, ListCommunityPostsUseCase listCommunityPostsUseCase,
            GetPostDetailsUseCase getPostDetailsUseCase, CreateCommentUseCase createCommentUseCase,
            VoteUseCase voteUseCase, UserRepository userRepository) {
        this.createPostUseCase = createPostUseCase;
        this.listCommunityPostsUseCase = listCommunityPostsUseCase;
        this.getPostDetailsUseCase = getPostDetailsUseCase;
        this.createCommentUseCase = createCommentUseCase;
        this.voteUseCase = voteUseCase;
        this.userRepository = userRepository;
    }

    @PostMapping("/communities/{id}/posts")
    public ResponseEntity<PostDTOs.PostResponse> createPost(@PathVariable UUID id,
            @RequestBody PostDTOs.CreatePostRequest request) {
        User currentUser = getCurrentUser();
        var post = createPostUseCase.execute(request.title(), request.content(), currentUser, id);
        return ResponseEntity.ok(PostDTOs.PostResponse.fromDomain(post));
    }

    @GetMapping("/communities/{id}/posts")
    public ResponseEntity<List<PostDTOs.PostResponse>> listPosts(@PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        var posts = listCommunityPostsUseCase.execute(id, page, size);
        return ResponseEntity.ok(posts.stream().map(PostDTOs.PostResponse::fromDomain).collect(Collectors.toList()));
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<PostDTOs.PostDetailsResponse> getPostDetails(@PathVariable UUID id) {
        var details = getPostDetailsUseCase.execute(id);
        var postResponse = PostDTOs.PostResponse.fromDomain(details.post());
        var commentsResponse = details.comments().stream()
                .map(com.community.app.web.dto.post.CommentDTOs.CommentResponse::fromDomain)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new PostDTOs.PostDetailsResponse(postResponse, commentsResponse));
    }

    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<Void> createComment(@PathVariable UUID id,
            @RequestBody PostDTOs.CreateCommentRequest request) {
        User currentUser = getCurrentUser();
        createCommentUseCase.execute(request.content(), currentUser, id, request.parentCommentId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/posts/{id}/vote")
    public ResponseEntity<PostDTOs.PostResponse> voteOnPost(@PathVariable UUID id,
            @RequestBody PostDTOs.VoteRequest request) {
        User currentUser = getCurrentUser();
        var post = voteUseCase.executeForPost(currentUser, id,
                com.community.app.domain.post.Vote.VoteType.valueOf(request.type()));
        return ResponseEntity.ok(PostDTOs.PostResponse.fromDomain(post));
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = (String) auth.getPrincipal();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
