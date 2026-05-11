-- ============================================
-- MIGRATION: 001_initial_schema.sql
-- Project: Amélia Saúde CMS
-- Database: PostgreSQL (Neon)
-- ORM: Drizzle
-- Date: 2026-01-30
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'editor' NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================
-- TABLE: categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================
-- TABLE: authors
-- ============================================
CREATE TABLE IF NOT EXISTS authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================
-- TABLE: posts
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    excerpt TEXT,
    content TEXT,
    cover_image TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
    published_at TIMESTAMP,
    reading_time INTEGER DEFAULT 5,
    featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'draft' NOT NULL,
    ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================
-- TABLE: post_tags
-- ============================================
CREATE TABLE IF NOT EXISTS post_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Authors indexes
CREATE INDEX IF NOT EXISTS idx_authors_email ON authors(email);

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(featured);
CREATE INDEX IF NOT EXISTS idx_posts_status_featured ON posts(status, featured);

-- Post tags indexes
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON post_tags(tag);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp for users
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

-- Initial admin user (password: admin123 - CHANGE IN PRODUCTION!)
INSERT INTO users (id, email, password_hash, name, role) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@ameliasaude.com.br', '$2a$10$rK8Z9X7Q2wF3Y5Z8X1Z0Yq3Z8X1Z0Yq3Z8X1Z0Yq3Z8X1Z0Yq3Z8X', 'Admin Amélia Saúde', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Initial categories
INSERT INTO categories (name, slug, color) VALUES
    ('Saúde', 'saude', '#10B981'),
    ('Bem-Estar', 'bem-estar', '#3B82F6'),
    ('Nutrição', 'nutricao', '#F59E0B'),
    ('Exercícios', 'exercicios', '#EF4444'),
    ('Prevenção', 'prevencao', '#8B5CF6')
ON CONFLICT (slug) DO NOTHING;

-- Initial author
INSERT INTO authors (name, email, role) VALUES
    ('Dr. Amélia Saúde', 'contato@ameliasaude.com.br', 'Editor Chefe')
ON CONFLICT (email) DO NOTHING;
