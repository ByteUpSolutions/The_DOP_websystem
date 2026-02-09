package com.community.app.web.dto;

public record LoginResponseDTO(
    String accessToken,
    String chatToken,
    UserResponseDTO user
) {}
