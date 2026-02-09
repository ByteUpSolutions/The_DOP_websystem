package com.community.app.infrastructure.persistence;

import com.community.app.domain.community.Community;

public class CommunityMapper {
    public static CommunityJpaEntity toJpaEntity(Community domain) {
        return CommunityJpaEntity.builder()
                .id(domain.id())
                .name(domain.name())
                .description(domain.description())
                .iconUrl(domain.iconUrl())
                .isPrivate(domain.isPrivate())
                .createdAt(domain.createdAt())
                .build();
    }

    public static Community toDomain(CommunityJpaEntity entity) {
        return new Community(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getIconUrl(),
                entity.getIsPrivate(),
                entity.getCreatedAt()
        );
    }
}