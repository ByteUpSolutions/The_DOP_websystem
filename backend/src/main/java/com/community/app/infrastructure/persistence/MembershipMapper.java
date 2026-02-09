package com.community.app.infrastructure.persistence;

import com.community.app.domain.community.Membership;

public class MembershipMapper {
    public static MembershipJpaEntity toJpaEntity(Membership domain) {
        return MembershipJpaEntity.builder()
                .id(domain.id())
                .user(UserMapper.toJpaEntity(domain.user()))
                .community(CommunityMapper.toJpaEntity(domain.community()))
                .role(domain.role())
                .joinedAt(domain.joinedAt())
                .build();
    }

    public static Membership toDomain(MembershipJpaEntity entity) {
        return new Membership(
                entity.getId(),
                UserMapper.toDomain(entity.getUser()),
                CommunityMapper.toDomain(entity.getCommunity()),
                entity.getRole(),
                entity.getJoinedAt()
        );
    }
}