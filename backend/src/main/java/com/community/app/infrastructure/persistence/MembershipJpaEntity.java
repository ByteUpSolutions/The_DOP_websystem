package com.community.app.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "memberships", uniqueConstraints = {@UniqueConstraint(columnNames = {"user_id", "community_id"})})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MembershipJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserJpaEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = false)
    private CommunityJpaEntity community;

    @Builder.Default
    private String role = "MEMBER";

    @Builder.Default
    private LocalDateTime joinedAt = LocalDateTime.now();
}
