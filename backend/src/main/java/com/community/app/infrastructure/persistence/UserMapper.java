package com.community.app.infrastructure.persistence;

import com.community.app.domain.user.User;

public class UserMapper {
    public static UserJpaEntity toJpaEntity(User domain) {
        return UserJpaEntity.builder()
                .id(domain.id())
                .fullName(domain.fullName())
                .email(domain.email())
                .passwordHash(domain.passwordHash())
                .role(domain.role())
                .firebaseUid(domain.firebaseUid())
                .avatarUrl(domain.avatarUrl())
                .createdAt(domain.createdAt())
                .active(domain.active())
                .build();
    }

    public static User toDomain(UserJpaEntity entity) {
        return new User(
                entity.getId(),
                entity.getFullName(),
                entity.getEmail(),
                entity.getPasswordHash(),
                entity.getRole(),
                entity.getFirebaseUid(),
                entity.getAvatarUrl(),
                entity.getCreatedAt(),
                entity.getActive()
        );
    }
}
