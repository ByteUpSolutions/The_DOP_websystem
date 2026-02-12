package com.community.app.infrastructure.persistence.post;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PostJpaRepository extends JpaRepository<PostJpaEntity, UUID> {
    List<PostJpaEntity> findByCommunity_Id(UUID communityId, Pageable pageable);
}
