# Clawdbot Migration Guide - Amélia Saúde

**Projeto:** Amélia Saúde CMS
**Data:** 30/01/2026
**Versão:** 1.0

## 📋 Visão Geral

Este guia descreve como migrar o projeto Amélia Saúde para um novo ambiente, mantendo toda a configuração do Clawdbot e os dados do banco de dados.

---

## 🗂️ Estrutura do Projeto

```
ameliasaude/
├── .gitignore
├── .env.example
├── CLAUDE.md
├── README.md
├── package.json
├── pnpm-lock.yaml
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── drizzle.config.ts
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel
│   ├── blog/              # Blog pages
│   ├── lgpd/              # LGPD page
│   ├── privacidade/       # Privacy page
│   └── sobre/             # About page
├── components/            # React components
│   ├── layout/            # Layout components
│   ├── ui/                # UI components
│   ├── effects/           # Animation effects
│   ├── hooks/             # Custom hooks
│   ├── logo.tsx           # Logo component (square)
│   ├── logo-image.tsx     # Logo component (Next.js Image)
│   ├── logo-horizontal.tsx           # Horizontal logo component
│   └── logo-horizontal-image.tsx     # Horizontal logo (Next.js)
├── lib/                   # Utilities and libraries
│   ├── api/               # API utilities
│   ├── auth/              # Authentication utilities
│   ├── db/                # Database utilities (Drizzle)
│   ├── fonts.ts           # Font configuration
│   ├── types/             # TypeScript types
│   └── utils/             # Helper functions
├── public/                # Static assets
│   ├── favicon.png        # Favicon (32px)
│   ├── icon.svg           # SVG icon
│   ├── apple-touch-icon.png
│   ├── amelia-saude-logo-*.svg      # Logo SVGs (3 colors × 2 formats)
│   └── amelia-saude-logo-*.png      # Logo PNGs (3 colors × 2 formats × 5 sizes)
├── styles/                # Global styles
├── drizzle/               # Database migrations
│   └── 001_initial_schema.sql
└── CLAWDBOT-MIGRATION.md  # This file
```

---

## 🔧 Tecnologias

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **ORM:** Drizzle
- **Database:** PostgreSQL (Neon)
- **Authentication:** NextAuth.js
- **Animations:** Framer Motion
- **Package Manager:** pnpm

---

## 🚀 Passos de Migração

### 1. Preparação do Ambiente

#### Requisitos do Sistema
- Node.js >= 18.17.0
- pnpm >= 8.0.0
- PostgreSQL database (ou Neon account)
- Git

#### Clone do Repositório

```bash
git clone <repository-url> ameliasaude
cd ameliasaude
```

#### Instalação de Dependências

```bash
pnpm install
```

### 2. Configuração de Ambiente

#### Criar Arquivo `.env.local`

```bash
cp .env.example .env.local
```

#### Variáveis de Ambiente

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# OAuth Providers (opcional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# API Keys (opcional)
OPENAI_API_KEY=your-openai-key
```

### 3. Configuração do Banco de Dados

#### Opção A: Usar Neon (Recomendado)

```bash
# Instalar Neon CLI
npm install -g neonctl

# Criar projeto
neonctl projects create --name ameliasaude

# Copiar connection string
neonctl connection-string --project-id your-project-id
```

#### Opção B: PostgreSQL Local

```bash
# Instalar PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Criar database
createdb ameliasaude
```

### 4. Executar Migrações do Banco de Dados

#### Via Drizzle Kit (Recomendado)

```bash
# Instalar Drizzle Kit
pnpm add -D drizzle-kit

# Gerar migrations
pnpm drizzle-kit generate

# Executar migrations
pnpm drizzle-kit migrate
```

#### Manual via SQL

```bash
# Conectar ao PostgreSQL
psql $DATABASE_URL

# Executar migration script
\i drizzle/001_initial_schema.sql
```

### 5. Seed dos Dados Iniciais

```bash
# Executar seed script
pnpm tsx lib/db/seed.ts
```

Ou manual via SQL:

```sql
-- Criar usuário admin
INSERT INTO users (email, password_hash, name, role)
VALUES ('admin@ameliasaude.com.br', '$2a$10$...', 'Admin', 'admin');
```

### 6. Iniciar o Servidor de Desenvolvimento

```bash
# Modo desenvolvimento
pnpm dev

# Modo produção
pnpm build
pnpm start
```

Acesse: http://localhost:3000

### 7. Painel de Administração

Acesse: http://localhost:3000/admin

Credenciais padrão:
- Email: `admin@ameliasaude.com.br`
- Password: `admin123` (ALTERAR EM PRODUÇÃO!)

---

## 🎨 Recursos Customizados

### Logos

O projeto usa logos SVGs otimizados para web:

#### SVGs Disponíveis
- Formato Quadrado (1:1): `amelia-saude-logo-{cor}.svg`
- Formato Horizontal (2:1): `amelia-saude-logo-{cor}-horizontal.svg`

#### Cores Disponíveis
- `preta` (#000000) - Fundos claros
- `branca` (#FFFFFF) - Fundos escuros/dark mode
- `amarela` (#FFCC00) - Destaque/CTA

#### Exemplo de Uso

```tsx
import LogoImage from '@/components/logo-image';
import LogoHorizontalImage from '@/components/logo-horizontal-image';

// Logo quadrado no navbar
<LogoImage color="branca" width={128} height={128} />

// Logo horizontal em hero section
<LogoHorizontalImage color="amarela" width={480} height={240} />
```

### Componentes de UI

O projeto usa componentes customizados baseados em shadcn/ui:

#### Disponíveis em `components/ui/`
- Button, Card, Input, Textarea
- Dialog, Dropdown, Select
- Toast, Alert, Badge
- Table, Form, etc.

### Tailwind Config

Cores customizadas configuradas:
- `gold-primary`, `gold-secondary`, `gold-accent`
- `black-premium`, `gray-premium`
- `success-premium`, `error-premium`

---

## 📊 Estrutura do Banco de Dados

### Tabelas

#### `users`
- Gerenciamento de usuários administrativos
- Roles: admin, editor, viewer

#### `categories`
- Categorias de blog posts
- Cor customizável para cada categoria

#### `authors`
- Autores de blog posts
- Perfil com avatar e email

#### `posts`
- Conteúdo do blog
- Status: draft, published, archived
- Suporte a AI-generated posts

#### `post_tags`
- Sistema de tags para posts
- Relacionamento many-to-many

### Relacionamentos

```
users → (author) → posts → (tags) → post_tags
                   ↓
                 categories
```

---

## 🔒 Segurança

### Configurações de Segurança

1. **Alterar credenciais padrão**
2. **Usar variáveis de ambiente para secrets**
3. **Ativar HTTPS em produção**
4. **Configurar CORS apropriado**
5. **Implementar rate limiting**
6. **Validar todos os inputs**

### LGPD e Privacidade

- Páginas de LGPD e Privacidade implementadas
- Consentimento de cookies necessário
- Armazenamento seguro de dados pessoais

---

## 🧪 Testes

### Testar Migração

```bash
# Testar conexão com banco
pnpm tsx -e "import { db } from './lib/db'; console.log('Database connected')"

# Testar schema
pnpm drizzle-kit studio
```

### Testar Aplicação

```bash
# Rodar testes (se houver)
pnpm test

# Lint
pnpm lint

# Type check
pnpm tsc --noEmit
```

---

## 📦 Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Configurar variáveis de ambiente no painel do Vercel:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

### Outros Plataformas

- Netlify
- Railway
- Render
- DigitalOcean App Platform

---

## 🔧 Troubleshooting

### Erros Comuns

#### Erro: "Database connection failed"
- Verificar `DATABASE_URL` no `.env.local`
- Testar conexão com: `psql $DATABASE_URL`

#### Erro: "Module not found"
- Executar: `pnpm install`
- Limpar cache: `rm -rf .next node_modules && pnpm install`

#### Erro: "NextAuth session error"
- Verificar `NEXTAUTH_URL` e `NEXTAUTH_SECRET`
- Garantir que `NEXTAUTH_URL` não seja localhost em produção

---

## 📝 Notas Adicionais

### Clawdbot Integration

O projeto está configurado para trabalhar com Clawdbot:
- Arquivo `CLAUDE.md` com instruções para o agente
- Estrutura otimizada para navegação e modificação
- Scripts de seed para facilitar testes

### Performance

- Imagens otimizadas via Next.js Image
- SVGs usados sempre que possível
- Code splitting automático do Next.js
- Fontes otimizadas via next/font

### SEO

- Metatags configuradas em `app/layout.tsx`
- Open Graph tags implementadas
- Sitemap ready (adicionar em `app/sitemap.ts`)

---

## 📞 Suporte

Para questões relacionadas à migração:
1. Verificar logs de erro
2. Consultar documentação oficial (Next.js, Drizzle, Neon)
3. Verificar se todas as variáveis de ambiente estão configuradas

---

**Versão deste documento:** 1.0
**Última atualização:** 30/01/2026
**Autor:** Clawdbot Migration Assistant
