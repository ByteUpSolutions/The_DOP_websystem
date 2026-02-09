package com.community.app.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MembershipJpaRepository extends JpaRepository<MembershipJpaEntity, UUID> {
    Optional<MembershipJpaEntity> findByUser_IdAndCommunity_Id(UUID userId, UUID communityId);
    List<MembershipJpaEntity> findByUser_Id(UUID userId);
}