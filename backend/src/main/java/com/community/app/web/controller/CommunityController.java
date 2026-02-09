package com.community.app.web.controller;

import com.community.app.domain.community.Community;
import com.community.app.domain.community.CommunityRepository;
import com.community.app.domain.community.Membership;
import com.community.app.domain.community.MembershipRepository;
import com.community.app.domain.user.User;
import com.community.app.domain.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/communities")
public class CommunityController {

    private final CommunityRepository communityRepository;
    private final MembershipRepository membershipRepository;
    private final UserRepository userRepository;

    public CommunityController(CommunityRepository communityRepository, MembershipRepository membershipRepository,
            UserRepository userRepository) {
        this.communityRepository = communityRepository;
        this.membershipRepository = membershipRepository;
        this.userRepository = userRepository;
    }

    // Listar todas as comunidades públicas
    @GetMapping
    public ResponseEntity<List<Community>> getAllCommunities() {
        return ResponseEntity.ok(communityRepository.findAllPublic());
    }

    // Obter detalhes de uma comunidade
    @GetMapping("/{id}")
    public ResponseEntity<Community> getCommunityById(@PathVariable UUID id) {
        return communityRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Criar nova comunidade
    @PostMapping
    public ResponseEntity<Community> createCommunity(@RequestBody CreateCommunityRequest request) {
        Community newCommunity = Community.createNew(request.name, request.description, request.isPrivate);
        Community savedCommunity = communityRepository.save(newCommunity);

        // O criador vira membro automaticamente (lógica simplificada)
        User currentUser = getCurrentUser();

        // CORREÇÃO: Cria o membership já como ADMIN usando o construtor padrão do
        // Record
        Membership membership = new Membership(
                UUID.randomUUID(),
                currentUser,
                savedCommunity,
                "ADMIN",
                java.time.LocalDateTime.now());

        membershipRepository.save(membership);

        return ResponseEntity.ok(savedCommunity);
    }

    // Listar comunidades do usuário logado
    @GetMapping("/my")
    public ResponseEntity<List<Membership>> getMyCommunities() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(membershipRepository.findByUserId(currentUser.id()));
    }

    // Entrar em uma comunidade
    @PostMapping("/{id}/join")
    public ResponseEntity<Membership> joinCommunity(@PathVariable UUID id) {
        User currentUser = getCurrentUser();
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comunidade não encontrada"));

        // Verifica se já é membro
        if (membershipRepository.findByUserAndCommunity(currentUser, community).isPresent()) {
            throw new RuntimeException("Usuário já é membro desta comunidade");
        }

        Membership membership = Membership.createNew(currentUser, community);
        return ResponseEntity.ok(membershipRepository.save(membership));
    }

    // Helper para pegar o usuário do token
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = (String) auth.getPrincipal();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    // DTO interno para criar
    public record CreateCommunityRequest(String name, String description, Boolean isPrivate) {
    }
}