# Prompts Prontos - Site Amélia Saúde Premium AAA
## Comandos Otimizados para Claude Code

---

## 📋 COMO USAR ESTE DOCUMENTO

Cada prompt abaixo está pronto para ser copiado e colado no Claude Code. Os prompts incluem:
- ✅ Contexto completo do projeto
- ✅ Especificações técnicas detalhadas
- ✅ Referência aos documentos de planejamento
- ✅ Requisitos de qualidade AAA

**Ordem Recomendada:**
1. Setup inicial do projeto
2. Configuração de design system
3. Componentes reutilizáveis
4. Páginas individuais
5. Otimização e testes

---

## 1️⃣ PROMPT: SETUP INICIAL DO PROJETO

```
Crie um projeto Next.js 14+ premium para o site da Amélia Saúde Administradora de Benefícios.

CONTEXTO:
Estou construindo um site institucional AAA com visual premium em preto e amarelo ouro. Consulte os seguintes documentos para entender o projeto completo:
- briefing.md: Visão geral, público-alvo e objetivos
- prd.md: Funcionalidades e requisitos técnicos
- design-guidelines-premium.md: Identidade visual premium AAA
- mvp-scope.md: Escopo do MVP e métricas
- landing-page-spec.md: Especificação da home page

REQUISITOS TÉCNICOS:
1. Next.js 14+ com App Router
2. TypeScript
3. Tailwind CSS customizado com tema preto/amarelo ouro
4. Framer Motion para animações premium
5. next/font para tipografia otimizada (Inter + Clash Display ou Montserrat)
6. Estrutura de pastas organizada:
   - /app (rotas)
   - /components (componentes reutilizáveis)
   - /lib (utilitários)
   - /public (assets)
   - /styles (global CSS)

DELIVERABLES:
- Projeto inicializado com todas as dependências
- tailwind.config.js customizado com paleta premium
- Configuração de fontes (Inter + display font)
- Layout root com metadata SEO
- README com instruções

PADRÃO DE QUALIDADE:
Performance > 95 no PageSpeed desde o início. Código limpo, componentizado e TypeScript strict.
```

---

## 2️⃣ PROMPT: DESIGN SYSTEM & COMPONENTES BASE

```
Crie o design system premium AAA para o site Amélia Saúde com base no design-guidelines-premium.md.

COMPONENTES A CRIAR:

1. BOTÕES (/components/ui/Button.tsx):
   - Primary (gradiente ouro, hover elevado, animação suave)
   - Secondary (outline ouro, hover com background sutil)
   - Ghost (glassmorphism, backdrop blur)
   - Todos com loading state, ícones opcionais, e variações de tamanho

2. CARDS (/components/ui/Card.tsx):
   - CardElevated (hover com elevação e borda dourada)
   - CardGlass (glassmorphism effect)
   - Animação de hover premium (translateY + shadow)

3. NAVBAR (/components/layout/Navbar.tsx):
   - Sticky header com backdrop blur
   - Logo à esquerda
   - Menu desktop: Cliente, Quero Contratar (destacado), Canal de Atendimento, Sobre Nós
   - Menu mobile: Hambúrguer com animação suave
   - CTA "Quero Contratar" sempre dourado e destacado
   - Scroll behavior: adiciona sombra ao rolar

4. FOOTER (/components/layout/Footer.tsx):
   - Background preto profundo (#0A0A0A)
   - 4-5 colunas: Logo/tagline, Links, Legal, Contato, Social
   - Badge ANS e certificações
   - Copyright centralizado

5. WHATSAPP BUTTON (/components/ui/WhatsAppButton.tsx):
   - Botão flutuante canto inferior direito
   - Cor verde WhatsApp com pulso sutil
   - Link direto para WhatsApp com mensagem pré-configurada
   - Sempre visível (fixed position)

6. SECTION WRAPPER (/components/layout/Section.tsx):
   - Wrapper reutilizável com padding consistente
   - Variações: background preto/cinza carvão
   - Fade-in ao entrar na viewport (Intersection Observer)

REQUISITOS:
- TypeScript com tipos explícitos
- Tailwind para estilização
- Framer Motion para animações
- Acessibilidade (ARIA labels, keyboard navigation)
- Responsivo (mobile-first)
- Documentação inline (comentários)

PALETA (do design-guidelines-premium.md):
- Preto: #0A0A0A
- Ouro: #F5A623 (ou #FFB800)
- Cinza carvão: #1A1A1A
- Branco: #FFFFFF
- Cinza platinum: #B8B8B8

ENTREGUE:
Componentes funcionais, reutilizáveis e com exemplo de uso em comentários.
```

---

## 3️⃣ PROMPT: HOME PAGE - HERO SECTION

```
Crie a Hero Section premium AAA para a home page do site Amélia Saúde.

REFERÊNCIA:
- landing-page-spec.md seção 2 (Hero)
- design-guidelines-premium.md seção "Hero Section AAA"

ESPECIFICAÇÕES:

LAYOUT:
- Altura: 100vh (tela cheia)
- Background: Preto profundo (#0A0A0A) com gradiente sutil
- Conteúdo centralizado vertical e horizontalmente
- Padding lateral: 80px (desktop) / 24px (mobile)

ELEMENTOS:
1. Badge opcional acima do headline:
   - Texto: "Premium Healthcare" ou "Administradora AAA"
   - Estilo: Pill com borda dourada, background transparente
   - Animação: Fade in com delay

2. Headline (H1):
   - Texto: "Sua saúde em boas mãos, com atendimento que cuida de você"
   - Tamanho: 72px (desktop) / 48px (mobile)
   - Peso: Bold
   - Cor: Branco puro
   - Animação: Fade in + slide up

3. Subheadline:
   - Texto: "Planos de saúde com transparência, agilidade e um time sempre pronto para ajudar"
   - Tamanho: 20px
   - Cor: Cinza platinum (#B8B8B8)
   - Max-width: 600px
   - Animação: Fade in com delay 0.2s

4. CTAs (lado a lado):
   - Botão Primário: "Sou Cliente" (ouro com gradiente)
     - Ação: Scroll suave para seção "Sou Cliente" ou link para /cliente
   - Botão Secundário: "Quero Contratar" (outline ouro)
     - Ação: Abre WhatsApp com mensagem: "Olá! Tenho interesse em conhecer os planos da Amélia Saúde."
   - Gap: 16px entre botões
   - Animação: Fade in com delay 0.4s

5. Scroll Indicator (opcional):
   - Ícone: Seta para baixo
   - Cor: Dourado (#FFB800)
   - Animação: Bounce suave
   - Posição: Bottom center

6. Elemento visual (escolher um):
   - Mockup de app em alta qualidade (lado direito)
   - Ou: Gradiente ouro abstrato no background
   - Ou: Partículas douradas flutuando (sutil)

ANIMAÇÕES (Framer Motion):
- Stagger children: elementos aparecem sequencialmente
- Timing: cubic-bezier(0.4, 0, 0.2, 1)
- Performance: use GPU acceleration (transform, opacity)

RESPONSIVIDADE:
- Desktop: Layout horizontal (texto esquerda, visual direita) ou centralizado
- Mobile: Layout vertical, tudo centralizado, padding reduzido

CÓDIGO:
- Componente: /app/page.tsx (ou /components/home/HeroSection.tsx)
- TypeScript
- Framer Motion para animações
- Tailwind + classes custom para gradientes

ENTREGUE:
Hero section totalmente funcional, animado e responsivo.
```

---

## 4️⃣ PROMPT: SEÇÃO "SOU CLIENTE" (AUTOATENDIMENTO)

```
Crie a seção "Sou Cliente" para autoatendimento do site Amélia Saúde.

REFERÊNCIA:
- landing-page-spec.md seção 3
- prd.md seção 2.2

ESPECIFICAÇÕES:

LAYOUT:
- Background: Cinza carvão (#1A1A1A)
- Padding vertical: 96px (desktop) / 64px (mobile)
- Container: Max-width 1440px, centralizado

CONTEÚDO:

1. Headline:
   - Texto: "Você já é nosso cliente? Resolva tudo por aqui"
   - Tamanho: 56px (desktop) / 36px (mobile)
   - Cor: Branco
   - Centralizado

2. Subheadline:
   - Texto: "Acesse seus serviços de forma rápida e prática, quando e onde você estiver"
   - Tamanho: 20px
   - Cor: Cinza platinum
   - Centralizado

3. Grid de Cards (4 cards):
   - Layout: Grid 4 colunas (desktop) / 1 coluna (mobile)
   - Gap: 24px

CARDS:

Card 1 - 2ª Via de Boleto:
- Ícone: FileText (Lucide)
- Cor do ícone: Ouro
- Título: "2ª Via de Boleto"
- Descrição: "Emita em segundos, pague com facilidade"
- CTA: "Acessar" (botão pequeno ouro)
- Link: [URL da 2ª via - ajustar conforme sistema real]

Card 2 - Demonstrativo de IR:
- Ícone: BarChart (Lucide)
- Cor do ícone: Ouro
- Título: "Demonstrativo de IR"
- Descrição: "Disponível para download a qualquer momento"
- CTA: "Baixar" (botão pequeno ouro)
- Link: [URL do demonstrativo]

Card 3 - Aplicativo:
- Ícone: Smartphone (Lucide)
- Cor do ícone: Ouro
- Título: "Nosso App"
- Descrição: "Tudo na palma da sua mão"
- CTAs: Dois mini-botões (App Store + Google Play)
- Links: [URLs das lojas]

Card 4 - FAQ:
- Ícone: HelpCircle (Lucide)
- Cor do ícone: Ouro
- Título: "Perguntas Frequentes"
- Descrição: "Respostas rápidas para suas dúvidas"
- CTA: "Ver FAQ" (botão pequeno outline)
- Link: Âncora para seção FAQ (#faq)

ESTILO DOS CARDS:
- Background: rgba(255, 255, 255, 0.05)
- Border: 1px solid rgba(255, 255, 255, 0.1)
- Border-radius: 16px
- Padding: 32px
- Hover: Eleva (-8px) + borda dourada + sombra aumentada
- Transição: 0.4s cubic-bezier(0.4, 0, 0.2, 1)

4. CTA de Escape:
   - Texto: "Não encontrou o que procurava? Fale com um especialista"
   - Link: WhatsApp com mensagem: "Olá! Sou cliente da Amélia Saúde e preciso de ajuda."
   - Estilo: Link destacado, cor ouro, underline no hover
   - Posição: Abaixo dos cards, centralizado

ANIMAÇÕES:
- Cards aparecem com stagger (um após o outro)
- Fade in + slide up ao entrar na viewport

ENTREGUE:
Componente completo (/components/home/ClientSection.tsx) com todos os cards funcionais.
```

---

## 5️⃣ PROMPT: SEÇÃO DE PLANOS

```
Crie a seção de Planos do site Amélia Saúde com design premium.

REFERÊNCIA:
- landing-page-spec.md seção 4
- design-guidelines-premium.md

ESPECIFICAÇÕES:

LAYOUT:
- Background: Preto profundo (#0A0A0A)
- Padding vertical: 96px (desktop) / 64px (mobile)

CONTEÚDO:

1. Headline:
   - Texto: "Planos de saúde feitos para você e sua família"
   - Tamanho: 56px (desktop) / 36px (mobile)
   - Cor: Branco
   - Centralizado

2. Subheadline:
   - Texto: "Operadoras de confiança, coberturas completas e um time pronto para te ajudar a escolher"
   - Cor: Cinza platinum

3. Grid de Planos:
   - Layout: Grid 2-3 colunas (desktop) / 1 coluna (mobile)
   - Gap: 32px

CARDS DE PLANOS:

Plano 1 - Individual/Familiar:
- Ícone: User (Lucide)
- Título: "Plano Individual & Familiar"
- Descrição curta: "Cobertura completa para você e quem você ama"
- Benefícios (lista com checkmarks):
  ✅ Rede credenciada ampla
  ✅ Cobertura nacional
  ✅ Sem carência para urgências
- Badge opcional: "Mais Contratado" (canto superior direito)
- CTA: "Quero Contratar" (botão ouro full-width)
- Ação: WhatsApp vendas

Plano 2 - Empresarial:
- Ícone: Building (Lucide)
- Título: "Plano Empresarial"
- Descrição: "Benefícios de qualidade para sua equipe"
- Benefícios:
  ✅ Gestão simplificada
  ✅ Planos personalizados
  ✅ Suporte dedicado para RH
- CTA: "Solicitar Cotação" (botão ouro)

ESTILO DOS CARDS:
- Background: Gradiente sutil (#1A1A1A → #0A0A0A)
- Border: 1px solid rgba(255, 184, 0, 0.2)
- Border-radius: 20px
- Padding: 40px
- Hover: Borda dourada brilha, leve elevação
- Badge: Background ouro, texto preto, position absolute

4. CTA da Seção:
   - Texto: "Ainda com dúvidas sobre qual plano escolher?"
   - Botão: "Fale com um consultor" (outline ouro)
   - Ação: WhatsApp vendas

ANIMAÇÕES:
- Cards aparecem com fade in + scale (0.95 → 1)
- Hover: transform scale(1.02) + elevação

ENTREGUE:
/components/home/PlansSection.tsx com cards dinâmicos (array de planos como prop).
```

---

## 6️⃣ PROMPT: SEÇÃO DO APLICATIVO

```
Crie a seção de apresentação do Aplicativo Amélia Saúde.

REFERÊNCIA:
- landing-page-spec.md seção 5
- design-guidelines-premium.md

ESPECIFICAÇÕES:

LAYOUT:
- Background: Gradiente (#0A0A0A → #1A1A1A)
- Padding vertical: 96px
- Layout: Duas colunas (desktop) / coluna única (mobile)

COLUNA ESQUERDA (Conteúdo):
1. Headline:
   - Texto: "Tudo na palma da sua mão"
   - Tamanho: 56px (desktop) / 36px (mobile)
   - Cor: Branco

2. Subheadline:
   - Texto: "Gerencie seu plano, consulte a rede credenciada e muito mais pelo aplicativo Amélia Saúde"
   - Cor: Cinza platinum

3. Lista de Funcionalidades:
   - Ícones: Checkmark (ouro)
   - Itens:
     ✅ Carteirinha Digital (sempre disponível, mesmo offline)
     ✅ Rede Credenciada (encontre médicos perto de você)
     ✅ 2ª Via de Boleto (emita e pague pelo app)
     ✅ Histórico de Atendimentos (acompanhe suas consultas)
     ✅ Agendamento (marque consultas de forma prática)
   - Espaçamento: 16px entre itens

4. CTAs de Download:
   - Botão 1: "Baixar na App Store" (logo Apple + texto)
   - Botão 2: "Baixar no Google Play" (logo Google + texto)
   - Estilo: Botões escuros com borda sutil, hover dourado
   - Layout: Lado a lado (desktop) / empilhados (mobile)

COLUNA DIREITA (Visual):
- Mockup de smartphone com screenshots do app
- Imagem em alta qualidade (2x, 3x)
- Formato: WebP com fallback
- Animação: Parallax sutil ao scroll (opcional)

ANIMAÇÕES:
- Conteúdo: Slide in from left
- Mockup: Slide in from right
- Lista: Stagger (itens aparecem um por um)

ENTREGUE:
/components/home/AppSection.tsx com mockup placeholder (substituir por imagem real depois).
```

---

## 7️⃣ PROMPT: FAQ COM ACCORDION

```
Crie a seção de FAQ com accordion interativo premium.

REFERÊNCIA:
- landing-page-spec.md seção 7
- design-guidelines-premium.md

ESPECIFICAÇÕES:

LAYOUT:
- Background: Cinza carvão (#1A1A1A)
- Padding vertical: 96px
- Max-width: 900px (centralizado)

CONTEÚDO:

1. Headline:
   - Texto: "Perguntas Frequentes"
   - Centralizado
   - Cor: Branco

2. Subheadline:
   - Texto: "Encontre respostas rápidas para as dúvidas mais comuns"
   - Cor: Cinza platinum

3. Accordion (8 perguntas):
   - Layout: Coluna única
   - Gap: 16px entre itens

PERGUNTAS (do landing-page-spec.md seção 7.3):
1. Como faço para contratar um plano?
2. Quais operadoras de saúde vocês trabalham?
3. Como acessar a 2ª via do boleto?
4. Como funciona o reembolso?
5. Qual a diferença entre administradora e operadora?
6. Posso incluir dependentes no meu plano?
7. Como entrar em contato com o suporte?
8. Qual o prazo de carência?

ESTILO DO ACCORDION:
- Item fechado:
  - Background: rgba(255, 255, 255, 0.03)
  - Border: 1px solid rgba(255, 255, 255, 0.1)
  - Border-radius: 12px
  - Padding: 24px
  - Cursor: pointer

- Item aberto:
  - Border: 1px solid rgba(245, 166, 35, 0.3) (borda dourada)
  - Background: rgba(245, 166, 35, 0.05)

- Pergunta:
  - Tamanho: 18px
  - Peso: Semibold
  - Cor: Branco
  - Ícone + / - (direita): Rotaciona ao abrir

- Resposta:
  - Tamanho: 16px
  - Cor: Cinza platinum
  - Padding-top: 16px
  - Animação: Slide down suave

COMPORTAMENTO:
- Click abre/fecha
- Múltiplos podem estar abertos simultaneamente
- Ícone rotaciona 180° ao abrir
- Transição: 0.3s ease

4. CTA de Escape:
   - Texto: "Não encontrou sua resposta?"
   - Link: "Fale com um especialista" (WhatsApp)
   - Posição: Abaixo do último item

ACESSIBILIDADE:
- ARIA labels (aria-expanded, aria-controls)
- Navegação por teclado (Enter/Space para toggle)
- Focus state visível

ENTREGUE:
/components/home/FAQSection.tsx com array de perguntas/respostas como data.
```

---

## 8️⃣ PROMPT: PÁGINA "SOBRE NÓS"

```
Crie a página "Sobre Nós" premium para o site Amélia Saúde.

REFERÊNCIA:
- briefing.md seção 6
- prd.md seção 2.3

ESPECIFICAÇÕES:

ESTRUTURA DA PÁGINA:

1. HERO:
   - Background: Preto profundo
   - Altura: 60vh
   - Headline: "Quem Somos"
   - Subheadline: "Cuidando da sua saúde com dedicação e transparência há mais de [X] anos"
   - Imagem de fundo: Equipe ou infraestrutura (overlay escuro)

2. HISTÓRIA:
   - Background: Cinza carvão
   - Título: "Nossa História"
   - Conteúdo: Parágrafos sobre trajetória da Amélia Saúde
   - Layout: Texto com imagem lateral (alternado)

3. MISSÃO, VISÃO, VALORES:
   - Background: Preto
   - Layout: Grid 3 colunas (desktop) / 1 coluna (mobile)
   - Cada card:
     - Ícone (ouro)
     - Título: "Missão" / "Visão" / "Valores"
     - Descrição

4. DIFERENCIAIS:
   - Background: Cinza carvão
   - Título: "Por que escolher a Amélia Saúde?"
   - Grid de diferenciais:
     - Atendimento Humano (ícone: Heart)
     - Transparência (ícone: Eye)
     - Agilidade (ícone: Zap)
     - Confiança (ícone: Shield)

5. NÚMEROS DE IMPACTO:
   - Background: Preto
   - Layout: 4 caixas lado a lado
   - Números grandes com animação counter
   - Exemplos:
     - "10+ anos" - De experiência
     - "5.000+" - Clientes atendidos
     - "24/7" - Suporte disponível
     - "98%" - Satisfação dos clientes

6. CTA FINAL:
   - Título: "Faça parte dessa família"
   - Botão: "Conhecer Planos" (ouro)
   - Ação: WhatsApp ou página de planos

ANIMAÇÕES:
- Scroll reveal para cada seção
- Counter animado nos números
- Parallax sutil nas imagens

ENTREGUE:
/app/sobre/page.tsx completo com placeholder de conteúdo (textos a serem fornecidos pelo cliente).
```

---

## 9️⃣ PROMPT: OTIMIZAÇÃO DE PERFORMANCE

```
Otimize o site Amélia Saúde para atingir PageSpeed 95+ e Core Web Vitals verdes.

TAREFAS DE OTIMIZAÇÃO:

1. IMAGENS:
   - Converter todas para WebP/AVIF
   - Implementar lazy loading (next/image)
   - Gerar múltiplas resoluções (srcset)
   - Adicionar blur placeholder
   - Comprimir com Sharp
   - Dimensionamento correto (não carregar 4K em thumbnail)

2. FONTES:
   - Usar next/font para otimização automática
   - Preload de fontes críticas
   - Font-display: swap
   - Subset de caracteres (latin apenas)

3. CSS:
   - Purge unused Tailwind classes
   - Critical CSS inline
   - Defer non-critical CSS

4. JAVASCRIPT:
   - Code splitting por rota
   - Dynamic imports para componentes pesados
   - Tree shaking
   - Minificação

5. CORE WEB VITALS:
   - LCP < 2.5s: Hero image otimizada, preload
   - FID < 100ms: Minimize JS execution time
   - CLS < 0.1: Reserve espaço para imagens, evitar layout shifts

6. CACHING:
   - Headers de cache corretos
   - Service worker (opcional)
   - Static generation onde possível

7. ANALYTICS:
   - Google Analytics 4 com script async
   - Não bloquear renderização

8. LIGHTHOUSE CI:
   - Configurar no CI/CD
   - Fail build se score < 90

ENTREGUE:
- next.config.js otimizado
- Relatório Lighthouse antes/depois
- Checklist de otimizações aplicadas
```

---

## 🔟 PROMPT: SEO & METADATA

```
Configure SEO completo para o site Amélia Saúde.

TAREFAS:

1. METADATA (/app/layout.tsx):
   - Title: "Amélia Saúde | Administradora de Benefícios Premium"
   - Description: "Planos de saúde com atendimento humanizado, transparência e agilidade. Administradora de benefícios com soluções personalizadas para você e sua empresa."
   - Keywords: administradora de benefícios, plano de saúde, [cidade], Amélia Saúde
   - Open Graph (OG):
     - og:title, og:description, og:image, og:url
     - og:type: website
   - Twitter Card
   - Canonical URL

2. STRUCTURED DATA (Schema.org):
   - Organization schema:
     - Nome: Amélia Saúde
     - Logo
     - Contato (telefone, email, endereço)
     - Redes sociais
   - WebSite schema:
     - URL
     - Search action (se houver busca)
   - BreadcrumbList para páginas internas

3. SITEMAP.XML:
   - Gerar automaticamente com Next.js
   - Incluir todas as rotas:
     - / (home)
     - /sobre
     - /cliente
     - (outras páginas se houver)
   - Frequência de atualização
   - Prioridade

4. ROBOTS.TXT:
   - Allow all
   - Sitemap URL

5. FAVICON & ICONS:
   - favicon.ico (32x32)
   - apple-touch-icon.png (180x180)
   - android-chrome (192x192, 512x512)
   - Manifest.json (PWA ready)

6. META TAGS POR PÁGINA:
   - Cada página tem title e description únicos
   - URLs canônicas corretas

7. ACESSIBILIDADE:
   - Lang="pt-BR" no HTML
   - Alt text em todas as imagens
   - ARIA labels onde necessário
   - Heading hierarchy correta (H1 → H2 → H3)

ENTREGUE:
- Metadata configurado
- Schema.org em JSON-LD
- Sitemap e robots.txt
- Checklist SEO validada
```

---

## 1️⃣1️⃣ PROMPT: TESTES & QA

```
Execute testes completos de qualidade AAA no site Amélia Saúde.

CHECKLIST DE TESTES:

1. FUNCIONALIDADE:
   - [ ] Todos os links funcionam (0 erros 404)
   - [ ] WhatsApp abre com mensagens corretas
   - [ ] Menu mobile abre/fecha
   - [ ] Accordion FAQ expande/colapsa
   - [ ] Scroll suave funciona
   - [ ] Botões de download do app redirecionam

2. RESPONSIVIDADE:
   - Testar em:
     - [ ] iPhone 13/14 (390x844)
     - [ ] Samsung Galaxy S21 (360x800)
     - [ ] iPad (768x1024)
     - [ ] Desktop 1920x1080
     - [ ] Desktop 4K (3840x2160)
   - [ ] Nenhum overflow horizontal
   - [ ] Textos legíveis em todos os tamanhos
   - [ ] Touch targets ≥ 44px em mobile

3. PERFORMANCE:
   - [ ] Lighthouse Mobile: Score ≥ 95
   - [ ] Lighthouse Desktop: Score ≥ 95
   - [ ] Core Web Vitals: Todos verdes
   - [ ] Tempo de carregamento < 1s (FCP)
   - [ ] Sem console errors

4. CROSS-BROWSER:
   - [ ] Chrome (desktop + mobile)
   - [ ] Safari (desktop + mobile)
   - [ ] Firefox
   - [ ] Edge

5. ACESSIBILIDADE:
   - [ ] WAVE: 0 erros
   - [ ] Lighthouse Accessibility: ≥ 95
   - [ ] Navegação por teclado funciona
   - [ ] Screen reader friendly
   - [ ] Contraste de cores WCAG AAA

6. SEO:
   - [ ] Meta tags presentes em todas as páginas
   - [ ] Schema.org validado (Google Rich Results Test)
   - [ ] Sitemap acessível
   - [ ] Robots.txt correto
   - [ ] Sem duplicate content

7. VISUAL:
   - [ ] Todas as fontes carregam corretamente
   - [ ] Cores consistentes com design system
   - [ ] Espaçamentos proporcionais
   - [ ] Animações suaves (sem janks)
   - [ ] Imagens em alta qualidade

8. CONTEÚDO:
   - [ ] Ortografia e gramática verificadas
   - [ ] Textos alinhados com tom de voz
   - [ ] Todos os placeholders substituídos por conteúdo real
   - [ ] Links de WhatsApp com mensagens corretas

FERRAMENTAS:
- Lighthouse
- WebPageTest
- WAVE
- BrowserStack (cross-browser)
- Google Search Console
- Schema Markup Validator

ENTREGUE:
Relatório completo de testes com screenshots de:
- PageSpeed scores
- WAVE report
- Responsive em diferentes dispositivos
- Checklist preenchida
```

---

## 1️⃣2️⃣ PROMPT: DEPLOY & LANÇAMENTO

```
Faça o deploy do site Amélia Saúde na Vercel e configure tudo para produção.

TAREFAS:

1. VERCEL DEPLOY:
   - Conectar repositório GitHub/GitLab
   - Configurar variáveis de ambiente (se houver)
   - Build settings:
     - Framework: Next.js
     - Output directory: .next
     - Install command: npm install
     - Build command: npm run build
   - Deploy preview para cada PR
   - Deploy de produção no merge para main

2. DOMÍNIO CUSTOMIZADO:
   - Adicionar domínio da Amélia Saúde
   - Configurar DNS (A record ou CNAME)
   - Forçar HTTPS
   - Redirecionar www → naked domain (ou vice-versa)
   - Certificado SSL automático (Vercel)

3. ANALYTICS:
   - Google Analytics 4 configurado e funcionando
   - Google Tag Manager (opcional)
   - Vercel Analytics (opcional, para Web Vitals)
   - Google Search Console:
     - Adicionar propriedade
     - Verificar domínio
     - Submeter sitemap

4. MONITORAMENTO:
   - Configurar alertas para downtime
   - Monitorar Core Web Vitals (Search Console)
   - Erro tracking (Sentry opcional)

5. PRÉ-LANÇAMENTO:
   - [ ] Todos os testes passando
   - [ ] Cliente aprovou design e conteúdo
   - [ ] Links de WhatsApp corretos e testados
   - [ ] Analytics funcionando
   - [ ] Domínio configurado
   - [ ] SSL ativo

6. PÓS-LANÇAMENTO:
   - Monitorar primeiras 48h
   - Verificar Analytics (tráfego chegando?)
   - Checar Search Console (indexação)
   - Validar que WhatsApp está recebendo mensagens

ENTREGUE:
- URL de produção funcionando
- Checklist de deploy preenchida
- Acesso ao Analytics configurado
- Documentação de como fazer deploys futuros
```

---

## 📊 PROMPT BONUS: DASHBOARD DE MÉTRICAS

```
Crie um dashboard simples para acompanhar as métricas do MVP.

DADOS A RASTREAR (conforme mvp-scope.md):
1. Leads via WhatsApp (contador manual ou integração)
2. Visitantes únicos (GA4)
3. Pageviews (GA4)
4. Taxa de rejeição (GA4)
5. Cliques em CTAs principais
6. Cliques em 2ª via de boleto
7. Downloads do app
8. Performance (Core Web Vitals do Search Console)

FORMATO:
- Dashboard em Notion, Google Sheets ou ferramenta similar
- Atualização: Semanal
- Comparação: Mês atual vs. mês anterior
- Metas visíveis (conforme mvp-scope.md seção 4)

ENTREGUE:
Template de dashboard preenchível pelo cliente ou equipe.
```

---

## 🎯 ORDEM RECOMENDADA DE EXECUÇÃO

1. ✅ Setup inicial do projeto
2. ✅ Design system & componentes base
3. ✅ Navbar e Footer
4. ✅ Hero Section
5. ✅ Seção "Sou Cliente"
6. ✅ Seção de Planos
7. ✅ Seção do Aplicativo
8. ✅ FAQ
9. ✅ Página "Sobre Nós"
10. ✅ SEO & Metadata
11. ✅ Otimização de performance
12. ✅ Testes & QA
13. ✅ Deploy & Lançamento

---

## 💡 DICAS PARA USAR OS PROMPTS

### No Claude Code:
1. Copie o prompt completo
2. Cole na conversa
3. Aguarde a execução
4. Revise o código gerado
5. Teste localmente
6. Commit se estiver satisfeito

### Customizações:
- Substitua [placeholders] por dados reais da Amélia Saúde
- Ajuste URLs de WhatsApp com números reais
- Forneça logo e imagens reais quando disponíveis
- Personalize textos conforme necessário

### Qualidade:
- Sempre peça para revisar o código antes de commit
- Teste em múltiplos dispositivos
- Valide performance após cada mudança grande
- Mantenha o padrão AAA em todas as implementações

---

**Documento criado em:** Janeiro 2026
**Versão:** 1.0
**Status:** ✅ Pronto para uso no Claude Code

**Próximo passo:** Copiar os prompts na ordem recomendada e começar o desenvolvimento! 🚀
