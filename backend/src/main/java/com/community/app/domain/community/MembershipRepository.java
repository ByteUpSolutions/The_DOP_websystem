package com.community.app.domain.community;

import com.community.app.domain.user.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MembershipRepository {
    Membership save(Membership membership);
    Optional<Membership> findByUserAndCommunity(User user, Community community);
    List<Membership> findByUserId(UUID userId);
}
