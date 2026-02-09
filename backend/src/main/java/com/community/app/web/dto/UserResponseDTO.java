package com.community.app.web.dto;

import com.community.app.domain.user.User;
import java.util.UUID;

public record UserResponseDTO(
    UUID id,
    String fullName,
    String email,
    String role,
    String avatarUrl
) {
    public static UserResponseDTO fromDomain(User user) {
        return new UserResponseDTO(user.id(), user.fullName(), user.email(), user.role(), user.avatarUrl());
    }
}
