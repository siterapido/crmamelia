# Design Guidelines - Amélia Saúde
## Identidade Visual & Diretrizes de Design

---

## 1. PERSONALIDADE DA MARCA

### Arquétipo da Marca: O Cuidador
A Amélia Saúde se posiciona como **O Cuidador** - uma marca que protege, acolhe e cuida de seus clientes com empatia, confiança e responsabilidade.

### Atributos de Personalidade

#### Primários
- **Confiável:** Transmite segurança e estabilidade
- **Humano:** Próximo, acessível, sem frieza corporativa
- **Profissional:** Competente e organizado, sem ser burocrático

#### Secundários
- **Acolhedor:** Faz o cliente se sentir bem-vindo
- **Transparente:** Comunicação clara e honesta
- **Ágil:** Resolve problemas rapidamente

### Tom de Voz

| Situação | Tom | Exemplo |
|----------|-----|---------|
| Bem-vindo ao site | Acolhedor e confiante | "Sua saúde em boas mãos, com atendimento que cuida de você" |
| Autoatendimento | Objetivo e claro | "Acesse sua 2ª via de boleto em segundos" |
| Vendas | Consultivo e seguro | "Vamos encontrar o plano ideal para você e sua família" |
| Suporte | Empático e solucionador | "Estamos aqui para ajudar. Fale com um especialista agora" |

### O que Amélia Saúde É vs. Não É

| ✅ É | ❌ Não É |
|------|----------|
| Profissional e humano | Corporativo e frio |
| Claro e direto | Técnico e complexo |
| Confiável e sólido | Arrogante e distante |
| Moderno e acessível | Antiquado ou infantil |

---

## 2. PALETA DE CORES

### Cores Primárias

#### Azul Confiança (Primary)
- **Hexadecimal:** `#0066CC` ou `#0056B3` (ajustar conforme identidade existente)
- **Uso:** CTAs principais, headers, elementos de destaque
- **Significado:** Confiança, profissionalismo, segurança (cores típicas de saúde)

#### Branco Puro (Background)
- **Hexadecimal:** `#FFFFFF`
- **Uso:** Background principal, espaçamento, limpeza visual

#### Cinza Escuro (Text)
- **Hexadecimal:** `#1A1A1A` ou `#2D3748`
- **Uso:** Texto principal, títulos
- **Razão:** Melhor contraste que preto puro, menos cansativo

### Cores Secundárias

#### Verde Sucesso (Success)
- **Hexadecimal:** `#10B981` ou `#22C55E`
- **Uso:** Mensagens de sucesso, badges "Disponível", estados ativos
- **Significado:** Saúde, bem-estar, ação concluída

#### Azul Claro (Accent)
- **Hexadecimal:** `#E0F2FE` ou `#DBEAFE`
- **Uso:** Backgrounds de seções alternadas, cards, hover states
- **Significado:** Leveza, respiração visual

#### Laranja/Coral (CTA Secundário)
- **Hexadecimal:** `#FF6B35` ou `#F97316`
- **Uso:** Botão "Quero Contratar" (destaque máximo), ícones importantes
- **Significado:** Urgência positiva, ação, energia

### Cores de Sistema

#### Amarelo Alerta (Warning)
- **Hexadecimal:** `#F59E0B`
- **Uso:** Avisos, alertas informativos

#### Vermelho Erro (Error)
- **Hexadecimal:** `#EF4444`
- **Uso:** Mensagens de erro, validações

#### Cinza Neutro (Borders/Backgrounds)
- **Hexadecimal:** `#E5E7EB`, `#9CA3AF`, `#6B7280`
- **Uso:** Bordas, divisores, texto secundário

### Acessibilidade de Contraste
- **Texto sobre Branco:** Cinza Escuro (#2D3748) → Ratio 11:1 ✅
- **Botão Azul + Texto Branco:** Ratio 4.52:1 ✅
- **Botão Laranja + Texto Branco:** Ratio 3.8:1 ⚠️ (considerar ajuste para #EA580C)

---

## 3. TIPOGRAFIA

### Fonte Principal (Heading)
**Opção 1:** Inter
- **Estilo:** Sans-serif moderna, clean
- **Uso:** Títulos (H1, H2, H3), botões, navbar
- **Pesos:**
  - H1: 700 (Bold)
  - H2: 600 (Semibold)
  - H3: 500 (Medium)
- **Tamanhos:**
  - H1: 48px (desktop) / 32px (mobile)
  - H2: 36px (desktop) / 28px (mobile)
  - H3: 24px (desktop) / 20px (mobile)

**Opção 2 (alternativa):** Poppins
- Mais arredondada, amigável
- Mesma hierarquia de pesos

### Fonte Secundária (Body)
**Inter** (mesma família para coesão)
- **Uso:** Parágrafos, textos corridos, labels
- **Peso:** 400 (Regular)
- **Tamanhos:**
  - Corpo: 16px (desktop) / 14px (mobile)
  - Small: 14px (desktop) / 12px (mobile)
- **Line-height:** 1.6 (facilita leitura)

### Hierarquia de Texto

```css
/* Desktop */
H1: 48px / Bold / Line-height 1.2
H2: 36px / Semibold / Line-height 1.3
H3: 24px / Medium / Line-height 1.4
Body: 16px / Regular / Line-height 1.6
Small: 14px / Regular / Line-height 1.5
Button: 16px / Semibold / Line-height 1.2

/* Mobile */
H1: 32px / Bold / Line-height 1.2
H2: 28px / Semibold / Line-height 1.3
H3: 20px / Medium / Line-height 1.4
Body: 14px / Regular / Line-height 1.6
Small: 12px / Regular / Line-height 1.5
Button: 14px / Semibold / Line-height 1.2
```

---

## 4. COMPONENTES UI

### Botões

#### Botão Primário (Azul)
- **Uso:** "Sou Cliente", ações principais
- **Estilo:**
  - Background: `#0066CC`
  - Texto: Branco
  - Border-radius: 8px
  - Padding: 12px 24px
  - Hover: Background `#0056B3` + leve elevação (box-shadow)
  - Active: Scale 0.98

#### Botão Secundário (Laranja)
- **Uso:** "Quero Contratar", CTAs de conversão
- **Estilo:**
  - Background: `#FF6B35`
  - Texto: Branco
  - Border-radius: 8px
  - Padding: 12px 24px
  - Hover: Background `#E55A28` + leve elevação

#### Botão Outline (Contorno)
- **Uso:** Ações menos prioritárias
- **Estilo:**
  - Background: Transparente
  - Border: 2px solid `#0066CC`
  - Texto: `#0066CC`
  - Hover: Background `#E0F2FE`

### Cards
- **Border-radius:** 12px
- **Box-shadow:** `0 4px 6px rgba(0, 0, 0, 0.1)`
- **Hover:** Leve elevação (`0 8px 12px rgba(0, 0, 0, 0.15)`)
- **Padding:** 24px
- **Background:** Branco

### Inputs (se houver formulários)
- **Border:** 1px solid `#E5E7EB`
- **Border-radius:** 8px
- **Padding:** 12px 16px
- **Focus:** Border `#0066CC` + box-shadow azul suave

### Ícones
- **Estilo:** Outline (não preenchido) para leveza
- **Tamanho:** 24px (padrão), 20px (small)
- **Cor:** Mesma do texto ou cor primária
- **Biblioteca recomendada:** Lucide React, Heroicons

---

## 5. LAYOUT & ESPAÇAMENTO

### Grid System
- **Container max-width:** 1280px
- **Padding lateral:** 24px (mobile) / 48px (desktop)
- **Grid de colunas:** 12 colunas (padrão)

### Espaçamento (Scale 8px)
```
4px   → Micro espaçamento (ícone + texto)
8px   → Small
16px  → Base
24px  → Medium
32px  → Large
48px  → XL (entre seções)
64px  → XXL (hero sections)
```

### Breakpoints
```css
mobile: < 640px
tablet: 640px - 1024px
desktop: > 1024px
wide: > 1440px
```

---

## 6. REFERÊNCIAS VISUAIS

### Sites de Inspiração (Conforme Briefing)

#### 1. CIMED (www.cimed.com.br)
**O que buscar:**
- ✅ Design clean e profissional
- ✅ Hierarquia visual clara
- ✅ CTAs bem destacados
- ✅ Boa organização de conteúdo
- ✅ Performance rápida

#### 2. SUPERMED (www.supermed.com.br)
**O que buscar:**
- ✅ Navegação simples e intuitiva
- ✅ Seção de autoatendimento bem visível
- ✅ Uso equilibrado de cores
- ✅ Cards organizados

### Elementos de Design a Adotar

#### Hero Section
- Imagens de alta qualidade (pessoas reais, não banco de imagens genérico)
- Headline forte e direta
- CTAs contrastantes lado a lado
- Fundo com gradiente sutil ou imagem com overlay

#### Seções Alternadas
- Fundo branco alternando com fundo azul claro (`#E0F2FE`)
- Cria ritmo visual sem cansar o usuário

#### Ícones e Ilustrações
- Estilo: Outline ou flat (evitar 3D excessivo)
- Cor: Monocromático (azul primário) ou com acentos de verde/laranja
- Tamanho: Proporcionais ao conteúdo, não gigantes

#### Imagens de Produto (App)
- Mockups de dispositivos móveis com screenshots reais do app
- Fundo limpo ou com gradiente sutil
- Posicionamento: Lado direito ou centralizado

---

## 7. ANIMAÇÕES & INTERAÇÕES

### Princípios
- **Sutileza:** Animações devem agregar, não distrair
- **Performance:** Usar `transform` e `opacity` (GPU-accelerated)
- **Duração:** 200-300ms para micro-interações, 400-600ms para transições maiores

### Exemplos de Uso

#### Hover em Botões
```css
transition: all 0.3s ease;
/* Hover: background-color change + box-shadow lift */
```

#### Scroll Animations (Opcional)
- Fade-in sutil ao entrar na viewport
- Biblioteca: Framer Motion ou Intersection Observer API
- **Cuidado:** Não abusar, apenas em seções principais

#### Accordion (FAQ)
- Transição suave de expand/collapse (300ms)
- Ícone rotaciona 180° ao abrir

---

## 8. IMAGENS & MÍDIA

### Diretrizes de Fotografia
- **Estilo:** Fotos reais, humanas, com emoção positiva
- **Evitar:** Banco de imagens genérico (pessoas artificiais sorrindo)
- **Preferir:** Fotos da equipe real, clientes reais (com autorização), ambientes reais

### Tratamento de Imagens
- **Formato:** WebP (com fallback JPG)
- **Compressão:** TinyPNG ou equivalente
- **Aspect Ratio:** Consistente (16:9 para banners, 1:1 para avatares)
- **Alt Text:** Sempre presente para acessibilidade e SEO

### Ilustrações (se usar)
- Estilo: Flat design ou outline
- Cor: Alinhado com paleta (azul/laranja/verde)
- Uso: Headers de seção, estados vazios

---

## 9. ICONOGRAFIA

### Biblioteca Recomendada
- **Lucide React** (moderna, clean, open-source)
- **Alternativa:** Heroicons

### Ícones Principais a Usar

| Contexto | Ícone | Nome (Lucide) |
|----------|-------|---------------|
| 2ª Via de Boleto | 📄 | `FileText` |
| Demonstrativo IR | 📊 | `BarChart` ou `FileSpreadsheet` |
| WhatsApp | 💬 | `MessageCircle` ou logo WhatsApp |
| Download App | 📱 | `Smartphone` |
| FAQ | ❓ | `HelpCircle` |
| Telefone | ☎️ | `Phone` |
| Email | ✉️ | `Mail` |
| Localização | 📍 | `MapPin` |
| Checklist | ✅ | `Check` |
| Menu Mobile | ☰ | `Menu` |

---

## 10. ACESSIBILIDADE & USABILIDADE

### Contraste
- Todos os textos devem ter contraste mínimo 4.5:1 (WCAG AA)
- Botões e elementos interativos: contraste mínimo 3:1

### Touch Targets
- Mínimo 44x44px para cliques em mobile
- Espaçamento adequado entre elementos clicáveis

### Navegação por Teclado
- Todos os elementos interativos acessíveis via Tab
- Focus state visível (outline azul)

### Leitores de Tela
- Alt text em imagens
- ARIA labels em ícones e botões sem texto

---

## 11. CHECKLIST DE DESIGN

### Antes de Aprovar o Design:
- [ ] Paleta de cores aplicada consistentemente?
- [ ] Tipografia seguindo hierarquia definida?
- [ ] CTAs claramente destacados?
- [ ] Espaçamento proporcional (scale 8px)?
- [ ] Design responsivo testado em 3+ dispositivos?
- [ ] Contraste de cores validado (WCAG AA)?
- [ ] Ícones consistentes em estilo e tamanho?
- [ ] Imagens otimizadas (WebP, comprimidas)?
- [ ] Animações sutis e performáticas?
- [ ] Botão WhatsApp fixo e sempre visível?

---

## 12. MOODBOARD (REFERÊNCIAS)

### Estética Visual
- **Clean & Moderno:** Espaços em branco generosos
- **Institucional sem ser Corporativo:** Profissional mas acessível
- **Azul Saúde:** Predominância de azul confiável
- **Toques de Calor:** Laranja para CTAs, verde para confirmações

### Exemplos de Sites com Estética Similar
1. **CIMED** - Design limpo, hierarquia clara
2. **SUPERMED** - Navegação intuitiva
3. **Doctolib** (internacional) - Modernidade no setor saúde
4. **Amil** - Institucional mas acessível

### Elementos NÃO Desejados
- ❌ Gradientes agressivos (anos 2000)
- ❌ Animações excessivas (distração)
- ❌ Textos longos sem hierarquia
- ❌ Pop-ups intrusivos
- ❌ Design genérico de template pronto

---

## 13. ENTREGA DE DESIGN

### Ferramentas Recomendadas
- **Figma** (preferencial para colaboração)
- **Adobe XD** (alternativa)

### Entregáveis
1. **Wireframes:** Estrutura e layout de cada página
2. **Mockups em Alta Fidelidade:** Design final com cores, tipografia, imagens
3. **Protótipo Interativo:** Navegação clicável (Figma Prototype)
4. **Design System:** Componentes reutilizáveis (botões, cards, inputs)
5. **Export de Assets:** Ícones, logos, imagens em formatos web

### Aprovação
- Cliente revisa mockups no Figma
- Ajustes com base em feedback
- Aprovação final antes de partir para código

---

**Documento criado em:** Janeiro 2026
**Versão:** 1.0
**Status:** ✅ Pronto para design e desenvolvimento
