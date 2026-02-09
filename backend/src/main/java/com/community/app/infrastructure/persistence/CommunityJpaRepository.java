package com.community.app.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface CommunityJpaRepository extends JpaRepository<CommunityJpaEntity, UUID> {
    // Métodos extras podem vir aqui se necessário
}