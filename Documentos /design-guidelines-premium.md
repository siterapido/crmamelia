# Design Guidelines PREMIUM AAA - Amélia Saúde
## Identidade Visual de Alto Padrão: Preto & Amarelo Ouro

---

## 🎯 VISÃO DO DESIGN AAA

### Posicionamento Premium
Amélia Saúde não é apenas uma administradora de benefícios. É **a escolha sofisticada** para quem valoriza excelência, exclusividade e atendimento de classe mundial.

### Filosofia de Design
**"Menos é Luxo"** - Inspirado em Apple, Tesla e marcas AAA, o design comunica sofisticação através de:
- Minimalismo intencional
- Espaçamento generoso (breathing room)
- Tipografia elegante e hierarquia perfeita
- Animações suaves e precisas
- Cada pixel tem propósito

### Referências de Luxo
- **Apple:** Minimalismo, espaços em branco, tipografia impecável
- **Tesla:** Futurismo, tecnologia invisível, UX perfeita
- **Porsche:** Performance, precisão, atenção aos detalhes
- **Bang & Olufsen:** Elegância escandinava, qualidade premium
- **Rolex:** Tradição, confiabilidade, luxo discreto

---

## 🎨 PALETA DE CORES PREMIUM

### Cores Primárias

#### Preto Profundo (Primary Dark)
```
Hex: #0A0A0A
RGB: 10, 10, 10
```
- **Uso:** Backgrounds principais, navbar, footer, elementos de destaque
- **Significado:** Sofisticação, seriedade, luxo discreto
- **Nota:** Não é preto puro (#000), é mais refinado e menos agressivo aos olhos

---

#### Amarelo Ouro (Signature Gold)
```
Hex: #FFB800 ou #F5A623 (mais elegante)
RGB: 245, 166, 35
```
- **Uso:** CTAs principais, destaques, hover states, elementos interativos
- **Significado:** Exclusividade, premium, energia positiva
- **Nota:** Tom dourado, não amarelo limão - evoca luxo e qualidade

**Variação Suave:**
```
Hex: #FFC933 (mais claro para backgrounds sutis)
RGB: 255, 201, 51
```

---

#### Branco Puro (Clean White)
```
Hex: #FFFFFF
RGB: 255, 255, 255
```
- **Uso:** Textos sobre preto, cards em destaque, espaçamento
- **Significado:** Clareza, limpeza, minimalismo

---

### Cores Secundárias Refinadas

#### Cinza Platinum (Text Secondary)
```
Hex: #A8A8A8 ou #B8B8B8
RGB: 184, 184, 184
```
- **Uso:** Textos secundários, descrições, legendas
- **Nota:** Alto contraste sobre preto, legível mas não agressivo

#### Cinza Carvão (Cards/Sections)
```
Hex: #1A1A1A ou #1E1E1E
RGB: 30, 30, 30
```
- **Uso:** Cards, seções alternadas, módulos
- **Nota:** Cria profundidade sobre fundo preto principal

#### Cinza Escuro (Borders)
```
Hex: #2D2D2D ou #333333
RGB: 51, 51, 51
```
- **Uso:** Bordas sutis, divisores, linhas
- **Nota:** Quase invisível, cria separação sutil

---

### Cores de Acento (Estados)

#### Verde Premium (Success)
```
Hex: #00E676 ou #10D86F (vibrante mas elegante)
RGB: 16, 216, 111
```
- **Uso:** Confirmações, badges "Disponível", estados de sucesso
- **Nota:** Verde neon moderno, futurista

#### Vermelho Elegante (Error)
```
Hex: #FF3B30 ou #E63946
RGB: 230, 57, 70
```
- **Uso:** Erros, alertas críticos
- **Nota:** Vermelho sofisticado, não agressivo

#### Amarelo Claro (Warning)
```
Hex: #FFCC00
RGB: 255, 204, 0
```
- **Uso:** Avisos, informações importantes

---

### Gradientes Premium (Uso Sutil)

#### Gradiente Ouro
```
linear-gradient(135deg, #F5A623 0%, #FFB800 50%, #FFC933 100%)
```
- **Uso:** Backgrounds de hero, botões premium em hover
- **Efeito:** Metalizado, luxuoso

#### Gradiente Preto Profundo
```
linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)
```
- **Uso:** Seções de background, criar profundidade

---

## ✍️ TIPOGRAFIA PREMIUM

### Fonte Display (Headlines)
**Opção 1 (Recomendada): Clash Display** (ou Archivo Black)
- **Estilo:** Sans-serif moderna, geométrica, impactante
- **Uso:** H1, H2, títulos de destaque
- **Peso:** 600 (Semibold), 700 (Bold)
- **Características:** Letras com presença, modernas, premium

**Alternativa:** Montserrat Bold, Inter Black, Space Grotesk

---

### Fonte Body (Texto Corrido)
**Opção 1 (Recomendada): Inter**
- **Estilo:** Sans-serif limpa, legível, profissional
- **Uso:** Parágrafos, descrições, textos longos
- **Peso:** 400 (Regular), 500 (Medium)
- **Características:** Extremamente legível em qualquer tamanho

**Alternativa:** SF Pro (Apple), Helvetica Neue, DM Sans

---

### Hierarquia Tipográfica Premium

#### Desktop
```css
H1 (Hero): 72px / Bold / Line-height 1.1 / Letter-spacing -2px
H2 (Section): 56px / Semibold / Line-height 1.2 / Letter-spacing -1px
H3 (Subsection): 32px / Medium / Line-height 1.3 / Letter-spacing -0.5px
Body Large: 20px / Regular / Line-height 1.7 / Letter-spacing 0px
Body: 16px / Regular / Line-height 1.6 / Letter-spacing 0px
Small: 14px / Regular / Line-height 1.5 / Letter-spacing 0px
Button: 16px / Semibold / Line-height 1 / Letter-spacing 0.5px (uppercase)
```

#### Mobile
```css
H1: 48px / Bold / Line-height 1.1 / Letter-spacing -1.5px
H2: 36px / Semibold / Line-height 1.2 / Letter-spacing -0.5px
H3: 24px / Medium / Line-height 1.3 / Letter-spacing 0px
Body: 16px / Regular / Line-height 1.6
Small: 14px / Regular / Line-height 1.5
Button: 14px / Semibold / Letter-spacing 0.5px (uppercase)
```

---

## 🎛️ COMPONENTES UI PREMIUM

### Botões AAA

#### Botão Primário (Ouro)
```css
Background: Linear-gradient(135deg, #F5A623, #FFB800)
Text: #0A0A0A (preto para contraste máximo)
Border-radius: 12px (arredondado premium)
Padding: 16px 32px (generoso)
Font: 14px / Semibold / Uppercase / Letter-spacing 1.5px
Box-shadow: 0 8px 24px rgba(245, 166, 35, 0.25)

Hover:
- Background shift (gradiente move)
- Transform: translateY(-2px) (eleva sutilmente)
- Box-shadow: 0 12px 32px rgba(245, 166, 35, 0.35)
- Transição: 0.3s cubic-bezier(0.4, 0, 0.2, 1)

Active:
- Transform: translateY(0px)
- Transição rápida (0.1s)
```

---

#### Botão Secundário (Outline Ouro)
```css
Background: Transparent
Border: 2px solid #FFB800
Text: #FFB800
Border-radius: 12px
Padding: 14px 30px

Hover:
- Background: rgba(255, 184, 0, 0.1)
- Border: 2px solid #FFC933
- Text: #FFC933
```

---

#### Botão Fantasma (Ghost)
```css
Background: rgba(255, 255, 255, 0.05)
Border: 1px solid rgba(255, 255, 255, 0.1)
Text: #FFFFFF
Backdrop-filter: blur(10px) (efeito vidro)

Hover:
- Background: rgba(255, 255, 255, 0.1)
```

---

### Cards Premium

#### Card Elevado (Hover Effect)
```css
Background: #1A1A1A
Border: 1px solid rgba(255, 255, 255, 0.05)
Border-radius: 16px (mais arredondado que básico)
Padding: 32px
Box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3)

Hover:
- Transform: translateY(-8px)
- Box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5)
- Border: 1px solid rgba(245, 166, 35, 0.3) (borda dourada sutil)
- Transição: 0.4s cubic-bezier(0.4, 0, 0.2, 1)
```

---

#### Card Glassmorphism (Efeito Vidro)
```css
Background: rgba(26, 26, 26, 0.7)
Backdrop-filter: blur(20px)
Border: 1px solid rgba(255, 255, 255, 0.1)
Border-radius: 20px
Box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4)
```

---

### Inputs Premium (se houver formulários)
```css
Background: rgba(255, 255, 255, 0.05)
Border: 1px solid rgba(255, 255, 255, 0.1)
Border-radius: 12px
Padding: 16px 20px
Color: #FFFFFF
Placeholder: rgba(255, 255, 255, 0.4)

Focus:
- Border: 2px solid #FFB800
- Box-shadow: 0 0 0 4px rgba(245, 166, 35, 0.15)
- Outline: none
```

---

## 🎭 LAYOUT & ESPAÇAMENTO AAA

### Grid Generoso
- **Container max-width:** 1440px (mais amplo que padrão)
- **Padding lateral:**
  - Mobile: 24px
  - Tablet: 48px
  - Desktop: 80px (espaço generoso)

### Espaçamento Premium (Scale 8px × Multiplicador)
```
8px   → Micro
16px  → Small
24px  → Base
32px  → Medium
48px  → Large
64px  → XL
96px  → XXL (entre seções principais)
128px → Hero spacing (espaço dramático)
```

### Seções com Respiração
- Altura mínima das seções: 600px (desktop)
- Hero: 100vh (tela cheia)
- Espaçamento vertical entre elementos: mínimo 32px

---

## 🌟 ANIMAÇÕES & MICROINTERAÇÕES AAA

### Princípios de Animação Luxo
- **Sutileza Premium:** Animações quase imperceptíveis, mas presentes
- **Timing Refinado:** Curvas cubic-bezier personalizadas
- **Performance First:** 60fps obrigatório

### Easing Curves Premium
```css
/* Entrada suave */
ease-in-expo: cubic-bezier(0.7, 0, 0.84, 0)

/* Saída suave */
ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)

/* Universal premium */
premium-ease: cubic-bezier(0.4, 0, 0.2, 1)
```

### Animações Específicas

#### Fade In ao Scroll (Seções)
```css
Opacidade: 0 → 1
Transform: translateY(40px) → translateY(0)
Duração: 0.8s
Easing: ease-out-expo
```

#### Hover em Cards
```css
Transform: translateY(-8px)
Box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5)
Duração: 0.4s
Easing: premium-ease
```

#### Loading State (Skeleton)
```css
Background: Linear-gradient shimmer
Cores: rgba(255, 255, 255, 0.05) → rgba(255, 255, 255, 0.1)
Animação: 1.5s infinite
```

#### Page Transitions
```css
Fade + Slide sutil
Duração: 0.6s
Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

---

## 🖼️ IMAGENS & MÍDIA PREMIUM

### Estilo Fotográfico
- **Mood:** Profissional, humano, autêntico
- **Tratamento:** Leve dessaturação, contraste aumentado
- **Filtro:** Overlay sutil preto (10-20% opacity) para unificar
- **Resolução:** Retina ready (2x, 3x)

### Formatos de Imagem
- **WebP** (primeira escolha, melhor compressão)
- **AVIF** (próxima geração, se suportado)
- **JPEG/PNG** (fallback)

### Tratamento de Imagens Hero
```css
Filter: brightness(0.8) contrast(1.1) saturate(0.9)
Overlay: linear-gradient(180deg, rgba(10,10,10,0.4), rgba(10,10,10,0.8))
```

---

## 🎨 ELEMENTOS PREMIUM EXCLUSIVOS

### Efeito Brilho Dourado (Gold Shine)
Animação sutil que passa sobre elementos importantes (CTAs, badges)
```css
Background: Linear-gradient shimmer dourado
Animação: 3s ease-in-out infinite
Opacidade: 0.3
Posição: Overlay sutil
```

### Bordas Gradiente
```css
Border-image: linear-gradient(135deg, #FFB800, #FFC933, #FFB800)
Border-width: 2px
```

### Partículas Douradas (Opcional, Hero)
Pequenas partículas douradas flutuando no background do hero
- Quantidade: 15-20 partículas
- Opacidade: 0.1-0.3
- Movimento: Float lento e aleatório

### Glassmorphism Sections
Seções com efeito vidro fosco sobre backgrounds
```css
Backdrop-filter: blur(20px) saturate(180%)
Background: rgba(26, 26, 26, 0.7)
Border: 1px solid rgba(255, 255, 255, 0.1)
```

---

## 🎯 ICONOGRAFIA PREMIUM

### Estilo de Ícones
- **Tipo:** Outline (linha fina) para leveza
- **Peso da linha:** 1.5px-2px
- **Cantos:** Arredondados
- **Tamanho padrão:** 24px × 24px
- **Cor:** Ouro (#FFB800) ou Branco (#FFFFFF)

### Biblioteca Recomendada
- **Lucide React** (moderna, clean)
- **Phosphor Icons** (elegante, variada)
- **Feather Icons** (minimalista)

### Ícones Personalizados
Para logo e elementos únicos, considerar ícones customizados em dourado

---

## 🏆 HERO SECTION AAA

### Estrutura Premium
```
- Background: Preto profundo (#0A0A0A)
- Overlay: Gradiente sutil
- Conteúdo: Centralizado verticalmente
- Altura: 100vh (tela cheia)
- Espaçamento: Generoso (128px entre elementos)
```

### Elementos do Hero
1. **Badge Premium (opcional):**
   - "Administradora AAA" ou "Premium Healthcare"
   - Estilo: Pill com borda dourada
   - Posição: Acima do H1

2. **Headline:**
   - Tamanho: 72px (desktop)
   - Cor: Branco puro
   - Peso: Bold
   - Animação: Fade in + slide up

3. **Subheadline:**
   - Tamanho: 20px
   - Cor: Cinza Platinum (#B8B8B8)
   - Peso: Regular
   - Max-width: 600px (legibilidade)

4. **CTAs:**
   - Dois botões lado a lado
   - Espaçamento: 16px entre eles
   - Primário: Ouro com gradiente
   - Secundário: Outline ouro

5. **Elemento Visual:**
   - Mockup de app em alta qualidade
   - Ou: Imagem hero com overlay preto
   - Ou: Gradiente ouro sutil no background

### Scroll Indicator
```css
Animação: Bounce sutil
Cor: Dourado (#FFB800)
Posição: Bottom center
Opacidade: 0.6
Hover: Opacidade 1
```

---

## 🎨 SEÇÕES ALTERNADAS PREMIUM

### Padrão de Backgrounds
1. **Seção 1 (Hero):** Preto profundo
2. **Seção 2 (Sou Cliente):** Cinza carvão (#1A1A1A)
3. **Seção 3 (Planos):** Preto profundo com cards em destaque
4. **Seção 4 (App):** Gradiente preto → cinza
5. **Seção 5 (FAQ):** Cinza carvão
6. **Footer:** Preto profundo (#0A0A0A)

### Separadores Sutis
```css
Border-top: 1px solid rgba(255, 255, 255, 0.05)
```
Ou
```css
Gradiente de separação:
linear-gradient(90deg, transparent, rgba(255,184,0,0.3), transparent)
Height: 1px
```

---

## 📱 RESPONSIVIDADE PREMIUM

### Breakpoints Refinados
```css
mobile: < 640px
mobile-lg: 640px - 768px
tablet: 768px - 1024px
desktop: 1024px - 1440px
desktop-lg: > 1440px (4K ready)
```

### Princípios Mobile-First Premium
- Touch targets: Mínimo 48px × 48px
- Espaçamento: Mais generoso que padrão (16px mínimo)
- Tipografia: Escala fluida (clamp CSS)
- Imagens: Sempre otimizadas para device

---

## ✅ CHECKLIST DE QUALIDADE AAA

### Design System
- [ ] Todas as cores seguem a paleta premium
- [ ] Tipografia com hierarquia perfeita
- [ ] Espaçamento consistente (scale 8px)
- [ ] Animações suaves e performáticas
- [ ] Ícones uniformes em estilo e tamanho

### Performance
- [ ] PageSpeed 95+ (mobile e desktop)
- [ ] Imagens WebP/AVIF otimizadas
- [ ] Lazy loading em tudo que está off-screen
- [ ] CSS crítico inline
- [ ] JavaScript otimizado (code splitting)

### Acessibilidade AAA
- [ ] Contraste WCAG AAA (7:1 para texto principal)
- [ ] Navegação por teclado perfeita
- [ ] ARIA labels completos
- [ ] Focus states altamente visíveis
- [ ] Textos alternativos descritivos

### Refinamento Visual
- [ ] Nenhum pixel desalinhado
- [ ] Bordas e sombras consistentes
- [ ] Hover states em todos os elementos clicáveis
- [ ] Transições suaves universais
- [ ] Responsive perfeito em todos os breakpoints

### Detalhes Finais
- [ ] Favicon em alta qualidade (múltiplas resoluções)
- [ ] Open Graph images premium
- [ ] Loading states elegantes
- [ ] Error states bem desenhados
- [ ] Empty states com personalidade

---

## 🎨 REFERÊNCIAS VISUAIS AAA

### Sites Premium para Inspiração

#### Design Minimalista Luxo
- **Apple.com** - Espaçamento, tipografia, produto em foco
- **Tesla.com** - Futurismo, animações suaves, UX perfeita
- **Stripe.com** - Gradientes, ilustrações, simplicidade

#### Dark Theme Premium
- **Awwwards.com** (sites premiados) - Inovação, tendências
- **Vercel.com** - Preto premium, detalhes sutis
- **Linear.app** - Minimalismo, performance, elegância

#### Luxo & Saúde
- **Peloton.com** - Premium fitness, preto com acentos
- **Eight Sleep.com** - Tecnologia + saúde, visual sofisticado
- **Calm.com** - Wellness premium, UI refinada

---

## 🚀 IMPLEMENTAÇÃO TÉCNICA

### Stack Premium Recomendada
```
Framework: Next.js 14+ (App Router)
Estilização: Tailwind CSS + CSS Modules para animações
Animações: Framer Motion (biblioteca premium)
Ícones: Lucide React + custom SVGs
Imagens: Next/Image com Cloudinary/Imgix
Tipografia: next/font para performance
```

### Plugins & Tools
- **Sharp:** Otimização de imagens
- **SVGO:** Otimização de SVGs
- **Lighthouse CI:** Performance constante
- **Prettier + ESLint:** Código limpo
- **Husky:** Git hooks para qualidade

---

## 📐 GRID SYSTEM PREMIUM

### Container
```css
max-width: 1440px
padding: 0 80px (desktop) / 24px (mobile)
margin: 0 auto
```

### Colunas
- Desktop: 12 colunas
- Gap: 32px (generoso)
- Mobile: Coluna única, foco vertical

---

## 🎯 MARCA D'ÁGUA DE QUALIDADE

Todo elemento deve responder a pergunta: **"Isso parece um produto de R$ 10 milhões?"**

Se a resposta for não, refine até parecer.

---

**Documento criado em:** Janeiro 2026
**Versão:** 2.0 Premium AAA
**Status:** 🏆 Pronto para implementação de alto padrão
