# PRD - Product Requirements Document
## Site Amélia Saúde Administradora de Benefícios

---

## 1. VISÃO DO PRODUTO

### Proposta de Valor
Um site institucional de alta performance que funciona como **vendedor 24/7**, combinando autoatendimento eficiente para clientes atuais com arquitetura de conversão para novos leads, sem perder o toque humano característico da marca.

---

## 2. FUNCIONALIDADES PRINCIPAIS

### 2.1 Área de Navegação (Navbar)

#### Menu Principal
| Item | Função | Comportamento |
|------|---------|---------------|
| **Cliente** | Acesso à área do cliente | Direciona para página "Sou Cliente" |
| **Quero Contratar** | CTA principal | Link destacado → WhatsApp de vendas |
| **Canal de Atendimento** | Suporte | WhatsApp corporativo com mensagem "Fale com um especialista" |
| **Sobre Nós** | Institucional | Página sobre a Amélia Saúde |

**Requisitos:**
- Menu fixo no scroll (sticky header)
- Versão mobile: Menu hambúrguer
- Botão "Quero Contratar" sempre destacado visualmente
- Ícone de WhatsApp flutuante em todas as páginas

---

### 2.2 Home Page - Estrutura Completa

#### Seção 1: Hero (Acima da Dobra)
**Objetivo:** Capturar atenção em 3 segundos e apresentar valor imediato

**Elementos:**
- Headline institucional (exemplos):
  - *"Sua saúde em boas mãos, com atendimento que cuida de você"*
  - *"Planos de saúde com confiança, transparência e cuidado humano"*
- Subheadline: Breve descrição do diferencial
- **Dois CTAs principais:**
  - 🔵 Botão Primário: "Sou Cliente" (acesso direto aos serviços)
  - 🟢 Botão Secundário: "Quero Contratar" (WhatsApp vendas)
- Imagem/ilustração que transmita cuidado e confiança
- Badge opcional: "Administradora registrada na ANS"

**Requisitos Técnicos:**
- Carregar em < 1 segundo
- Imagem otimizada (WebP, lazy loading)
- CTAs com contraste mínimo de 4.5:1 (acessibilidade WCAG)

---

#### Seção 2: Sou Cliente (Autoatendimento)
**Objetivo:** Reduzir fricção no atendimento e facilitar serviços básicos

**Elementos:**
- Título: "Você já é nosso cliente? Acesse seus serviços"
- **Cards de Ação Rápida:**
  1. 📄 **2ª Via de Boleto**
     - Botão com link direto
     - Ícone visual claro
  2. 📊 **Demonstrativo de IR**
     - Acesso direto ao documento
     - Informação sobre disponibilidade (ex: "Disponível a partir de fevereiro")
  3. 📱 **Baixar Aplicativo**
     - Links para App Store e Google Play
  4. ❓ **Dúvidas Frequentes**
     - Link para FAQ
- **CTA de Escape:** "Não encontrou o que procurava? Fale com um especialista" (WhatsApp)

**Requisitos:**
- Cards clicáveis com hover effect
- Ícones intuitivos e padronizados
- Mobile: Cards em coluna única

---

#### Seção 3: Planos Trabalhados
**Objetivo:** Apresentar opções e gerar interesse em contratação

**Elementos:**
- Título: "Nossos Planos de Saúde"
- Descrição breve: Tipos de planos oferecidos (individual, empresarial, etc.)
- **Grid de Planos** (cards):
  - Nome do plano
  - Breve descrição (2-3 benefícios principais)
  - Ícone visual
  - Badge opcional: "Mais contratado", "Melhor custo-benefício"
- **CTA Único e Claro:** "Quero Contratar" (direciona para WhatsApp com mensagem pré-preenchida: "Olá, tenho interesse em saber mais sobre os planos da Amélia Saúde")

**Requisitos:**
- Máximo 3-4 planos em destaque
- Design simétrico e equilibrado
- Hover effect nos cards

---

#### Seção 4: Aplicativo Amélia Saúde
**Objetivo:** Demonstrar a conveniência do app

**Elementos:**
- Título: "Tudo na palma da sua mão"
- Mockup do aplicativo (screenshots em dispositivo móvel)
- **Funcionalidades do App:**
  - ✅ Consulta de rede credenciada
  - ✅ Agendamento de consultas
  - ✅ Histórico de atendimentos
  - ✅ 2ª via de boleto
  - ✅ Carteirinha digital
- **CTAs de Download:**
  - Botão App Store
  - Botão Google Play

**Requisitos:**
- Imagens do app em alta qualidade
- Links funcionais para lojas de aplicativos

---

#### Seção 5: Ativações de CTA Recorrentes
**Objetivo:** Garantir que o visitante sempre tenha uma saída clara

**Elementos:**
- Banners intercalados entre seções:
  - *"Ainda tem dúvidas? Fale com um especialista"* (WhatsApp)
  - *"Quer conhecer nossos planos? Solicite uma cotação"* (WhatsApp vendas)
- Design sutil mas visível
- Cor de destaque diferente do fundo

**Requisitos:**
- Pelo menos 2 ativações ao longo da página
- Não intrusivo (evitar pop-ups agressivos)

---

#### Seção 6: Dúvidas Frequentes (FAQ)
**Objetivo:** Reduzir objeções e fornecer respostas rápidas

**Elementos:**
- Título: "Perguntas Frequentes"
- Formato accordion (expandir/recolher)
- **Perguntas Sugeridas:**
  1. Como faço para contratar um plano?
  2. Quais são as operadoras disponíveis?
  3. Como acessar a 2ª via do boleto?
  4. Como funciona o reembolso?
  5. Qual a diferença entre administradora e operadora?
  6. Posso incluir dependentes no meu plano?
  7. Como entrar em contato com o suporte?
- **CTA Final:** "Não encontrou sua resposta? Fale conosco" (WhatsApp)

**Requisitos:**
- Accordion acessível (ARIA labels)
- Ícone de + / - para expandir/recolher
- Máximo 8-10 perguntas iniciais

---

#### Seção 7: Rodapé (Footer)
**Elementos:**
- Logo da Amélia Saúde
- **Links Rápidos:**
  - Sou Cliente
  - Quero Contratar
  - Sobre Nós
  - FAQ
  - Política de Privacidade
  - Termos de Uso
- **Contato:**
  - WhatsApp (com ícone)
  - E-mail
  - Telefone
  - Endereço (opcional)
- **Redes Sociais:** Ícones (se aplicável)
- Certificações: Badge ANS, SSL
- Copyright: "© 2026 Amélia Saúde. Todos os direitos reservados."

---

### 2.3 Página "Sobre Nós"

**Objetivo:** Transmitir credibilidade, história e valores da marca

**Estrutura:**
1. **Hero:**
   - Título: "Quem Somos"
   - Imagem institucional (equipe ou infraestrutura)
2. **História:**
   - Trajetória da Amélia Saúde no mercado
   - Missão, visão e valores
3. **Diferenciais:**
   - Atendimento humano
   - Transparência
   - Agilidade nas resoluções
4. **Números:**
   - Clientes atendidos
   - Anos de mercado
   - Planos disponíveis
5. **CTA:** "Conheça nossos planos" (WhatsApp)

**Requisitos:**
- Tom institucional mas acessível
- Fotos reais (evitar banco de imagens genérico)
- SEO: Meta description otimizada

---

### 2.4 Página "Sou Cliente" (Dedicada)

**Estrutura:**
- Hero: "Bem-vindo de volta!"
- Cards de acesso rápido (mesmos da home)
- Seção adicional: "Precisa de ajuda?" com link para FAQ e WhatsApp

---

## 3. DIFERENCIAIS COMPETITIVOS

### 3.1 Performance Excepcional
- **Meta:** 100/100 no Google PageSpeed
- **Tempo de carregamento:** < 0.8 segundos
- **Benefício:** Sites lentos perdem 53% dos leads; Amélia Saúde não perderá visitantes

### 3.2 Segurança de Dados
- Certificação SSL (HTTPS)
- Conformidade com LGPD
- Dados de boleto e IR protegidos

### 3.3 SEO On-Page
- URLs amigáveis (ex: `/sobre-nos`, `/planos`)
- Meta tags otimizadas
- Schema markup (Structured Data)
- Heading hierarchy (H1, H2, H3)
- Alt text em todas as imagens
- **Objetivo:** Aparecer nas primeiras posições para buscas como:
  - "administradora de benefícios"
  - "plano de saúde [cidade]"
  - "contratar plano de saúde"

### 3.4 Mobile-First
- 80% do tráfego é mobile
- Design responsivo em todos os breakpoints
- Touch targets de 44x44px mínimo
- Menu otimizado para telas pequenas

### 3.5 Conversão Inteligente
- CTAs estratégicos em todas as seções
- WhatsApp pré-configurado com mensagens contextuais
- Redução de fricção (menos cliques para converter)

---

## 4. STACK TECNOLÓGICA (SUGESTÃO)

### Frontend
- **Framework:** Next.js 14+ (React)
  - Benefícios: SSR, SSG, performance, SEO
- **Estilização:** Tailwind CSS
  - Benefícios: Velocidade de desenvolvimento, classes utility-first
- **Animações:** Framer Motion (opcional, apenas onde agregar valor)
- **Ícones:** Lucide React ou React Icons

### Hosting & Deploy
- **Vercel** (recomendado para Next.js)
  - Deploy automático, CDN global, analytics
- **Alternativa:** Netlify ou AWS Amplify

### Performance
- **Imagens:** Next/Image com lazy loading automático
- **Formato:** WebP ou AVIF
- **Fonts:** Google Fonts com preload

### Analytics & Tracking
- **Google Analytics 4:** Métricas de tráfego
- **Google Tag Manager:** Gerenciamento de tags
- **Meta Pixel** (opcional para anúncios futuros)

### SEO
- **Next SEO:** Meta tags automatizadas
- **Sitemap.xml:** Gerado automaticamente
- **Robots.txt:** Configuração para indexação

### Formulários & Integrações
- **WhatsApp API:** Links diretos (wa.me)
- **React Hook Form:** Validação de formulários (se houver)

---

## 5. INTEGRAÇÕES FUTURAS (PÓS-MVP)

### Fase 2 (Opcional - Plano PRO)
- **Blog/Portal de Conteúdo:**
  - IA gerando artigos otimizados para SEO
  - Objetivo: Aumentar tráfego orgânico
  - ROI estimado: +320%
- **Chatbot Inteligente:**
  - Atendimento automatizado para perguntas simples
- **Área do Cliente com Login:**
  - Acesso com CPF/senha
  - Histórico completo de atendimentos
- **Sistema de Cotação Online:**
  - Formulário interativo para cotar planos
  - Integração com CRM

---

## 6. MONETIZAÇÃO & ROI

### Modelo de Receita (Amélia Saúde)
- Venda de planos de saúde (comissão por contrato)
- Retenção de clientes (redução de churn via autoatendimento)

### Impacto Esperado do Site
| Métrica | Situação Atual | Meta Pós-Site | Impacto |
|---------|----------------|---------------|---------|
| Leads qualificados/mês | Baseline | +140% | Mais contratos |
| Tempo de atendimento 2ª via | Alto | -70% | Redução de custo operacional |
| Taxa de conversão visitante → lead | Baixa | +85% | Mais vendas |
| Custo de aquisição (CAC) | Alto | -40% | Menos dependência de anúncios |

### Investimento vs. Retorno
- **Investimento:** Desenvolvimento do site (único)
- **Retorno:**
  - Redução de custos operacionais (menos chamados de suporte)
  - Aumento de vendas (mais leads qualificados)
  - Construção de autoridade (SEO de longo prazo)
- **Payback estimado:** 6-8 meses

---

## 7. REQUISITOS NÃO-FUNCIONAIS

### Performance
- Core Web Vitals: Todas as métricas em "verde"
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1

### Acessibilidade
- Conformidade WCAG 2.1 nível AA
- Navegação por teclado funcional
- Leitores de tela compatíveis

### Segurança
- HTTPS obrigatório
- Headers de segurança (CSP, X-Frame-Options)
- Proteção contra XSS e CSRF

### Escalabilidade
- Código modular e componentizado
- Estrutura preparada para expansão (blog, área de cliente)

### Manutenibilidade
- Código limpo e documentado
- Commits semânticos
- README com instruções de setup

---

## 8. PRIORIZAÇÃO DE FEATURES (MVP vs. Futuro)

### 🚀 MVP (Essencial - Fase 1)
- ✅ Home page completa (todas as seções)
- ✅ Página Sobre Nós
- ✅ Página Sou Cliente
- ✅ FAQ
- ✅ Links para 2ª via de boleto e demonstrativo de IR
- ✅ Integração WhatsApp
- ✅ Design responsivo
- ✅ SEO básico

### 📋 Nice-to-Have (Fase 2)
- ⏳ Blog/Portal de conteúdo
- ⏳ Área do cliente com login
- ⏳ Sistema de cotação online
- ⏳ Chatbot
- ⏳ Múltiplos idiomas (se aplicável)

---

## 9. CRITÉRIOS DE ACEITE

### O site estará pronto quando:
1. ✅ Todas as páginas do MVP estiverem funcionais
2. ✅ PageSpeed Score ≥ 90/100 (mobile e desktop)
3. ✅ Todos os links e CTAs funcionarem corretamente
4. ✅ Design responsivo em 3+ dispositivos testados
5. ✅ SEO on-page implementado (meta tags, sitemap, robots.txt)
6. ✅ Acessibilidade básica validada (WAVE, Lighthouse)
7. ✅ Cliente aprovar design e conteúdo

---

## 10. RISCOS E MITIGAÇÕES

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Site lento | Alto | Usar Next.js, otimizar imagens, CDN |
| Baixa conversão | Alto | Testes A/B nos CTAs, análise de heatmaps |
| Conteúdo desatualizado | Médio | CMS fácil de usar, treinamento do cliente |
| Problemas de SEO | Médio | Auditoria SEO pré-lançamento |
| Incompatibilidade mobile | Alto | Testes em dispositivos reais |

---

**Documento criado em:** Janeiro 2026
**Versão:** 1.0
**Aprovadores:** Equipe Amélia Saúde + Equipe de Desenvolvimento
