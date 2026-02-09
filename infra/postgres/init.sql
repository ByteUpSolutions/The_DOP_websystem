-- 1. Tabela de Usuários (Central de Identidade)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER', -- Roles: USER, ADMIN
    firebase_uid VARCHAR(128), -- ID espelho no Firebase Auth
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

-- 2. Tabela de Comunidades (Salas de Chat)
CREATE TABLE IF NOT EXISTS communities (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(255),
    is_private BOOLEAN DEFAULT FALSE, -- Se TRUE, exige convite/aprovação (Lógica futura)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Membros (Vínculo User <-> Community)
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'MEMBER', -- Roles: MEMBER, MODERATOR, ADMIN
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Garante que o usuário não entre 2x no mesmo grupo
    UNIQUE(user_id, community_id)
);

-- Inserção de dados iniciais (opcional)
-- INSERT INTO users (id, full_name, email, password_hash, role) VALUES 
-- ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Admin User', 'admin@example.com', '$2a$10$8.g/0.123456789012345678901234567890123456789012345678901234567890', 'ADMIN');


-- Fase 2: Tabelas para Posts e Votos (Estilo Reddit)

-- 4. Tabela de Posts (Tópicos)
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0
);

-- 5. Tabela de Comentários
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY,
    content TEXT NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- Para aninhamento
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela de Votos
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    type VARCHAR(4) NOT NULL, -- UP ou DOWN

    -- Garante que o usuário só vote uma vez por post ou comentário
    CONSTRAINT unique_user_post_vote UNIQUE (user_id, post_id),
    CONSTRAINT unique_user_comment_vote UNIQUE (user_id, comment_id)
);
