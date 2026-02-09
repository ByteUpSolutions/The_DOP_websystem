package com.community.app.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "communities")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CommunityJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    private String description;
    private String iconUrl;

    @Builder.Default
    private Boolean isPrivate = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
