package com.community.app.infrastructure.persistence;

import com.community.app.domain.community.Community;
import com.community.app.domain.community.Membership;
import com.community.app.domain.community.MembershipRepository;
import com.community.app.domain.user.User;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class MembershipRepositoryAdapter implements MembershipRepository {

    private final MembershipJpaRepository jpaRepository;

    public MembershipRepositoryAdapter(MembershipJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Membership save(Membership membership) {
        MembershipJpaEntity entity = MembershipMapper.toJpaEntity(membership);
        // Salva e converte de volta
        return MembershipMapper.toDomain(jpaRepository.save(entity));
    }

    @Override
    public Optional<Membership> findByUserAndCommunity(User user, Community community) {
        return jpaRepository.findByUser_IdAndCommunity_Id(user.id(), community.id())
                .map(MembershipMapper::toDomain);
    }

    @Override
    public List<Membership> findByUserId(UUID userId) {
        return jpaRepository.findByUser_Id(userId).stream()
                .map(MembershipMapper::toDomain)
                .collect(Collectors.toList());
    }
}