package com.community.app.domain.community;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CommunityRepository {
    Community save(Community community);
    Optional<Community> findById(UUID id);
    List<Community> findAllPublic();
}
