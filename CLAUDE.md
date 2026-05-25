# CLAUDE.md - Amélia Saúde

## Project Overview

Landing page institucional premium e portal de conteúdo para **Amélia Saúde Operadora de Planos de Saúde**. Site focado em conversão com design minimalista preto/amarelo ouro, integrando blog CMS e chatbot com IA.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 + Typography Plugin
- **Animations**: Framer Motion
- **Database**: Neon (PostgreSQL)
- **ORM**: Drizzle ORM
- **AI**: Vercel AI SDK (OpenAI)
- **Auth**: Jose / Bcrypt (Custom Admin Auth)
- **Icons**: Lucide React
- **Package Manager**: pnpm

## Commands

```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm db:generate  # Generate Drizzle migrations
pnpm db:push      # Push schema changes to Neon
pnpm db:seed      # Seed database
```

## Project Structure

```
app/
  admin/              # CMS Dashboard (Protected)
  api/                # API Routes (Chat, Admin, etc)
  blog/               # Blog Portal (Public)
  layout.tsx          # Root layout + SEO metadata
  page.tsx            # Home page
  sitemap.ts          # Dynamic sitemap
  sobre/              # About page
  privacidade/        # Privacy policy
  termos/             # Terms of service
  lgpd/               # LGPD compliance

components/
  admin/              # Admin/CMS components
  blog/               # Blog specific components
  chat/               # AI Chat Widget components
  ui/                 # Reusable components
    Button.tsx        # primary | secondary | ghost
    Card.tsx          # default | glass | elevated
    Badge.tsx         # default | premium | success
    Container.tsx     # Responsive wrapper
  sections/           # Page sections
    HeroSection.tsx
    ClientSection.tsx
    PlanSection.tsx
    AppSection.tsx
    SocialProofSection.tsx
    FAQSection.tsx
    CTABanner.tsx
  layout/
    Navbar.tsx
    Footer.tsx
    Section.tsx
    LegalPageLayout.tsx

lib/
  db/                 # Database schema & connection
  fonts.ts            # next/font (Inter + Montserrat)
  utils/cn.ts         # clsx utility
```

## Design System

### Colors
- **Primary**: `#0A0A0A` (black), `#F5A623` / `#FFB800` (gold)
- **Secondary**: `#B8B8B8` (platinum), `#1E1E1E` (charcoal)
- **Contrast**: `#FFFFFF` (white)

### Typography
- **Display**: Montserrat (headlines)
- **Body**: Inter (copy)

### Accessibility
- WCAG AAA contrast (7:1)
- Keyboard navigation
- ARIA labels
- Semantic HTML

## Code Patterns

### Component Props
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'base' | 'lg'
}
```

### Styling
Use `cn()` utility from `lib/utils/cn.ts` for conditional classes:
```tsx
import { cn } from '@/lib/utils/cn'
className={cn('base-class', condition && 'conditional-class')}
```

### Database Access
Use Drizzle queries in Server Actions or API routes:
```tsx
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
const allPosts = await db.select().from(posts)
```

## Key Considerations

- **AI-First**: Integrates AI Chat Widget for support and AI-generated content for Blog.
- **Mobile-first**: Responsive design (320px to 4K).
- **Localization**: All content in Portuguese (pt-BR).
- **Performance**: Target 95+ PageSpeed (optimized images, font loading).
- **Deploy**: Vercel (Edge/Serverless functions).
