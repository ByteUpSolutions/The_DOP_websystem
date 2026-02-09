package com.community.app.infrastructure.persistence;

import com.community.app.domain.community.Community;
import com.community.app.domain.community.CommunityRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class CommunityRepositoryAdapter implements CommunityRepository {

    private final CommunityJpaRepository jpaRepository;

    public CommunityRepositoryAdapter(CommunityJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Community save(Community community) {
        CommunityJpaEntity entity = CommunityMapper.toJpaEntity(community);
        return CommunityMapper.toDomain(jpaRepository.save(entity));
    }

    @Override
    public Optional<Community> findById(UUID id) {
        return jpaRepository.findById(id).map(CommunityMapper::toDomain);
    }

    @Override
    public List<Community> findAllPublic() {
        // Por simplicidade, retorna tudo por enquanto ou filtre por isPrivate = false
        return jpaRepository.findAll().stream()
                .filter(c -> !c.getIsPrivate())
                .map(CommunityMapper::toDomain)
                .collect(Collectors.toList());
    }
}