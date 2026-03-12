import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(__dirname, '../public/Logos/SIX SAÚDE LOGO FINAL - Amarela.png');
const logoBase64 = fs.readFileSync(logoPath).toString('base64');
const logoDataUrl = `data:image/png;base64,${logoBase64}`;

const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documento de Entrega - SIX Saúde</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --black: #0A0A0A;
      --gold: #F1C10F;
      --gold-light: #F4CA2F;
      --white: #FFFFFF;
      --platinum: #A8A8A8;
      --charcoal: #1E1E1E;
      --border: #2A2A2A;
    }

    @page {
      size: A4;
      margin: 0;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', sans-serif;
      background: var(--black);
      color: var(--white);
      line-height: 1.5;
      font-size: 10pt;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* Page container - A4 fixed size */
    .page {
      width: 210mm;
      height: 297mm;
      padding: 15mm 18mm 20mm 18mm;
      background: var(--black);
      position: relative;
      overflow: hidden;
      page-break-after: always;
      page-break-inside: avoid;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* Prevent breaking inside elements */
    .no-break {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* Cover Page */
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, var(--black) 0%, var(--charcoal) 50%, var(--black) 100%);
      padding: 0;
    }

    .cover-logo {
      width: 220px;
      margin-bottom: 40px;
    }

    .cover h1 {
      font-family: 'Syne', sans-serif;
      font-size: 36pt;
      font-weight: 800;
      color: var(--white);
      margin-bottom: 16px;
      letter-spacing: -1px;
    }

    .cover h1 span {
      color: var(--gold);
    }

    .cover-subtitle {
      font-size: 13pt;
      color: var(--platinum);
      margin-bottom: 40px;
      max-width: 420px;
      line-height: 1.6;
    }

    .cover-meta {
      display: flex;
      gap: 50px;
      margin-top: 30px;
    }

    .cover-meta-item {
      text-align: center;
    }

    .cover-meta-label {
      font-size: 8pt;
      color: var(--platinum);
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 6px;
    }

    .cover-meta-value {
      font-family: 'Syne', sans-serif;
      font-size: 13pt;
      font-weight: 600;
      color: var(--gold);
    }

    .gold-line {
      width: 80px;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--gold), transparent);
      margin: 30px auto;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 16px;
    }

    .header-logo {
      height: 28px;
    }

    .header-title {
      font-family: 'Syne', sans-serif;
      font-size: 10pt;
      color: var(--gold);
      font-weight: 600;
    }

    /* Typography */
    h2 {
      font-family: 'Syne', sans-serif;
      font-size: 16pt;
      font-weight: 700;
      color: var(--gold);
      margin: 0 0 12px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--gold);
      break-after: avoid;
    }

    h3 {
      font-family: 'Syne', sans-serif;
      font-size: 11pt;
      font-weight: 600;
      color: var(--white);
      margin: 14px 0 8px 0;
      break-after: avoid;
    }

    h4 {
      font-family: 'Syne', sans-serif;
      font-size: 10pt;
      font-weight: 600;
      color: var(--gold-light);
      margin: 10px 0 6px 0;
      break-after: avoid;
    }

    p {
      margin-bottom: 8px;
      color: var(--platinum);
      line-height: 1.5;
    }

    strong {
      color: var(--white);
      font-weight: 600;
    }

    /* Lists */
    ul, ol {
      margin: 6px 0 10px 16px;
      color: var(--platinum);
    }

    li {
      margin-bottom: 3px;
      line-height: 1.4;
    }

    li strong {
      color: var(--gold-light);
    }

    /* Cards */
    .card {
      background: var(--charcoal);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 14px;
      margin: 10px 0;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .card-gold {
      border-color: var(--gold);
      background: linear-gradient(135deg, rgba(241, 193, 15, 0.1) 0%, var(--charcoal) 100%);
    }

    .card h4 {
      margin-top: 0;
    }

    .card ul {
      margin-bottom: 0;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 9pt;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    th {
      background: var(--gold);
      color: var(--black);
      font-family: 'Syne', sans-serif;
      font-weight: 600;
      padding: 8px 10px;
      text-align: left;
    }

    td {
      padding: 8px 10px;
      border-bottom: 1px solid var(--border);
      color: var(--platinum);
    }

    tr:nth-child(even) td {
      background: rgba(30, 30, 30, 0.5);
    }

    /* Code blocks */
    code, pre {
      font-family: 'Courier New', monospace;
      font-size: 8pt;
    }

    pre {
      background: var(--charcoal);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 10px;
      overflow-x: auto;
      margin: 8px 0;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    code {
      background: var(--charcoal);
      padding: 1px 4px;
      border-radius: 3px;
      color: var(--gold-light);
    }

    pre code {
      background: transparent;
      padding: 0;
    }

    /* Grid */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
    }

    /* Stats */
    .stat-box {
      background: var(--charcoal);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 14px;
      text-align: center;
      break-inside: avoid;
    }

    .stat-number {
      font-family: 'Syne', sans-serif;
      font-size: 24pt;
      font-weight: 800;
      color: var(--gold);
      line-height: 1;
    }

    .stat-label {
      font-size: 8pt;
      color: var(--platinum);
      margin-top: 6px;
    }

    /* Checklist */
    .checklist {
      list-style: none;
      margin-left: 0;
      columns: 2;
      column-gap: 20px;
    }

    .checklist li {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 0;
      border-bottom: 1px solid var(--border);
      break-inside: avoid;
      font-size: 9pt;
    }

    .check {
      width: 16px;
      height: 16px;
      background: var(--gold);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--black);
      font-weight: bold;
      font-size: 10px;
      flex-shrink: 0;
    }

    /* Colors */
    .color-row {
      display: flex;
      gap: 20px;
      margin: 10px 0;
      break-inside: avoid;
    }

    .color-swatch {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
    }

    .color-box {
      width: 36px;
      height: 36px;
      border-radius: 6px;
      border: 1px solid var(--border);
      flex-shrink: 0;
    }

    .color-info {
      flex: 1;
    }

    .color-name {
      font-weight: 600;
      color: var(--white);
      font-size: 9pt;
    }

    .color-hex {
      font-family: monospace;
      font-size: 8pt;
      color: var(--platinum);
    }

    /* Footer */
    .footer {
      position: absolute;
      bottom: 12mm;
      left: 18mm;
      right: 18mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;
      border-top: 1px solid var(--border);
      font-size: 8pt;
      color: var(--platinum);
    }

    .page-number {
      font-family: 'Syne', sans-serif;
      font-size: 9pt;
      color: var(--gold);
    }

    /* Highlight box */
    .highlight-box {
      background: linear-gradient(135deg, rgba(241, 193, 15, 0.15) 0%, rgba(241, 193, 15, 0.05) 100%);
      border-left: 3px solid var(--gold);
      padding: 14px;
      margin: 12px 0;
      border-radius: 0 10px 10px 0;
      break-inside: avoid;
    }

    .highlight-box p {
      color: var(--white);
      margin: 0;
    }

    /* Content area - leaves space for footer */
    .content {
      height: calc(297mm - 15mm - 20mm - 28px - 20mm);
      overflow: hidden;
    }

    /* Compact list for fitting content */
    .compact-list li {
      margin-bottom: 2px;
      font-size: 9pt;
    }
  </style>
</head>
<body>

  <!-- Page 1: Cover -->
  <div class="page cover">
    <img src="${logoDataUrl}" alt="SIX Saúde" class="cover-logo">
    <h1>Documento de <span>Entrega</span></h1>
    <p class="cover-subtitle">Plataforma Digital Institucional<br>Landing Page, CMS e Assistente Virtual com Inteligência Artificial</p>
    <div class="gold-line"></div>
    <div class="cover-meta">
      <div class="cover-meta-item">
        <div class="cover-meta-label">Cliente</div>
        <div class="cover-meta-value">SIX Saúde</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-label">Status</div>
        <div class="cover-meta-value">Concluído</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-label">Data</div>
        <div class="cover-meta-value">Fevereiro 2026</div>
      </div>
    </div>
  </div>

  <!-- Page 2: Summary -->
  <div class="page">
    <div class="header">
      <img src="${logoDataUrl}" alt="SIX Saúde" class="header-logo">
      <div class="header-title">Documento de Entrega</div>
    </div>

    <h2>Sumário Executivo</h2>

    <div class="highlight-box">
      <p>Desenvolvemos uma plataforma digital completa e moderna para a SIX Saúde, combinando uma <strong>landing page institucional de alta conversão</strong>, um <strong>portal de conteúdo com CMS próprio</strong> e um <strong>assistente virtual com inteligência artificial</strong>.</p>
    </div>

    <p>O projeto foi construído com as tecnologias mais avançadas do mercado, garantindo performance excepcional, segurança e escalabilidade. A plataforma está pronta para produção e preparada para crescer junto com a empresa.</p>

    <h3>Visão Geral dos Números</h3>

    <div class="grid-3 no-break">
      <div class="stat-box">
        <div class="stat-number">10+</div>
        <div class="stat-label">Páginas Desenvolvidas</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">40+</div>
        <div class="stat-label">Componentes UI</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">60+</div>
        <div class="stat-label">Animações Premium</div>
      </div>
    </div>

    <div class="grid-3 no-break" style="margin-top: 12px;">
      <div class="stat-box">
        <div class="stat-number">8</div>
        <div class="stat-label">APIs REST</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">5</div>
        <div class="stat-label">Tabelas no Banco</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">2</div>
        <div class="stat-label">IAs Integradas</div>
      </div>
    </div>

    <h3>Principais Entregas</h3>
    <div class="grid-2 no-break">
      <ul class="compact-list">
        <li>Landing Page Premium</li>
        <li>Página Sobre Nós</li>
        <li>Portal de Blog/Notícias</li>
        <li>Painel Administrativo (CMS)</li>
      </ul>
      <ul class="compact-list">
        <li>Gerador de Conteúdo com IA</li>
        <li>Chat de Suporte com IA</li>
        <li>Páginas Legais (LGPD)</li>
        <li>Sistema de Autenticação</li>
      </ul>
    </div>

    <div class="footer">
      <span>SIX Saúde - Documento de Entrega</span>
      <span class="page-number">2</span>
    </div>
  </div>

  <!-- Page 3: Landing Page -->
  <div class="page">
    <div class="header">
      <img src="${logoDataUrl}" alt="SIX Saúde" class="header-logo">
      <div class="header-title">Documento de Entrega</div>
    </div>

    <h2>O Que Foi Entregue</h2>

    <h3>1. Landing Page Institucional Premium</h3>
    <p>Landing page sofisticada projetada para maximizar conversões, com design premium em preto e dourado que transmite credibilidade e confiança.</p>

    <h4>Seções Desenvolvidas:</h4>
    <ul class="compact-list">
      <li><strong>Hero Section</strong> — Apresentação impactante com imagem cinematográfica, texto animado e CTAs estratégicos</li>
      <li><strong>Área do Cliente</strong> — Acesso rápido aos serviços (2ª via de boleto, Comprovante IR, App, FAQ)</li>
      <li><strong>Por Que Escolher a SIX</strong> — Apresentação da missão, visão e valores com design elegante</li>
      <li><strong>Nossos Planos</strong> — Cards interativos para planos por Adesão e Empresarial</li>
      <li><strong>Aplicativo SIX Saúde</strong> — Showcase do app móvel com mockup de iPhone</li>
      <li><strong>Prova Social</strong> — +2.500 famílias atendidas e depoimentos de clientes</li>
      <li><strong>FAQ Interativo</strong> — Perguntas frequentes em formato accordion</li>
      <li><strong>Últimas Notícias</strong> — Preview dos artigos mais recentes do blog</li>
    </ul>

    <h3>2. Página Institucional "Sobre Nós"</h3>
    <p>Página completa apresentando a história e identidade da SIX Saúde:</p>
    <ul class="compact-list">
      <li>História da empresa desde 2014</li>
      <li>Timeline de marcos importantes</li>
      <li>Missão, visão e valores</li>
      <li>Apresentação da equipe</li>
      <li>Números e conquistas</li>
    </ul>

    <h3>3. Portal de Notícias e Blog</h3>
    <p>Sistema de blog profissional completo com todas as funcionalidades:</p>
    <div class="grid-2 no-break">
      <ul class="compact-list">
        <li>Listagem com artigos em destaque</li>
        <li>Sistema de categorias e filtros</li>
        <li>Busca por título e conteúdo</li>
        <li>Paginação automática</li>
      </ul>
      <ul class="compact-list">
        <li>Sidebar com artigos populares</li>
        <li>Tempo de leitura estimado</li>
        <li>Tags para cada artigo</li>
        <li>SEO otimizado por página</li>
      </ul>
    </div>

    <div class="footer">
      <span>SIX Saúde - Documento de Entrega</span>
      <span class="page-number">3</span>
    </div>
  </div>

  <!-- Page 4: CMS -->
  <div class="page">
    <div class="header">
      <img src="${logoDataUrl}" alt="SIX Saúde" class="header-logo">
      <div class="header-title">Documento de Entrega</div>
    </div>

    <h2>Sistema de Gestão (CMS)</h2>

    <h3>4. Painel Administrativo Completo</h3>
    <p>Sistema de gerenciamento de conteúdo exclusivo para a equipe SIX Saúde:</p>

    <div class="grid-2 no-break">
      <div class="card">
        <h4>Dashboard Principal</h4>
        <ul class="compact-list">
          <li>Estatísticas em tempo real</li>
          <li>Total de postagens e categorias</li>
          <li>5 postagens mais recentes</li>
          <li>Atalhos rápidos para ações</li>
        </ul>
      </div>
      <div class="card">
        <h4>Gestão de Postagens</h4>
        <ul class="compact-list">
          <li>Busca e filtros avançados</li>
          <li>Editor completo de artigos</li>
          <li>Agendamento de publicação</li>
          <li>Indicador de conteúdo IA</li>
        </ul>
      </div>
    </div>

    <div class="grid-2 no-break" style="margin-top: 12px;">
      <div class="card">
        <h4>Gestão de Categorias</h4>
        <ul class="compact-list">
          <li>Criação com cores personalizadas</li>
          <li>Slugs automáticos para URLs</li>
          <li>Edição e exclusão</li>
        </ul>
      </div>
      <div class="card">
        <h4>Autenticação Segura</h4>
        <ul class="compact-list">
          <li>Login com email e senha</li>
          <li>Criptografia bcrypt</li>
          <li>Tokens JWT (7 dias)</li>
          <li>Cookies httpOnly</li>
        </ul>
      </div>
    </div>

    <h3>Funcionalidades do Editor de Artigos</h3>
    <div class="card no-break">
      <div class="grid-2">
        <ul class="compact-list">
          <li>Título e slug personalizável</li>
          <li>Resumo (excerpt) para listagens</li>
          <li>Editor de conteúdo HTML</li>
          <li>Upload de imagem de capa</li>
        </ul>
        <ul class="compact-list">
          <li>Seleção de categoria</li>
          <li>Atribuição de autor</li>
          <li>Sistema de tags</li>
          <li>Status: rascunho/publicado/arquivado</li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <span>SIX Saúde - Documento de Entrega</span>
      <span class="page-number">4</span>
    </div>
  </div>

  <!-- Page 5: AI Features -->
  <div class="page">
    <div class="header">
      <img src="${logoDataUrl}" alt="SIX Saúde" class="header-logo">
      <div class="header-title">Documento de Entrega</div>
    </div>

    <h2>Inteligência Artificial</h2>

    <h3>5. Gerador de Conteúdo com IA</h3>
    <div class="card card-gold no-break">
      <p><strong>Ferramenta revolucionária integrada ao painel administrativo:</strong></p>
      <ul class="compact-list">
        <li><strong>Motor:</strong> Claude (Anthropic) via OpenRouter</li>
        <li><strong>Configuração de tom:</strong> formal, casual, técnico ou inspiracional</li>
        <li><strong>Público-alvo:</strong> pacientes, empresas, RH ou público geral</li>
        <li><strong>Controle de tamanho:</strong> curto (~500), médio (~1000) ou longo (~2000 palavras)</li>
        <li><strong>SEO:</strong> inclusão de palavras-chave personalizadas</li>
        <li><strong>Preview:</strong> visualização em tempo real durante a geração</li>
        <li><strong>Integração:</strong> salvar diretamente no banco de dados</li>
      </ul>
      <p style="margin-top: 10px; color: var(--gold);"><strong>Benefício:</strong> Crie conteúdo de qualidade em minutos, mantendo o blog sempre atualizado.</p>
    </div>

    <h3>6. Chat de Suporte com IA</h3>
    <div class="card card-gold no-break">
      <p><strong>Assistente virtual 24/7 integrado ao site:</strong></p>
      <ul class="compact-list">
        <li><strong>Motor:</strong> Gemini (Google) via OpenRouter</li>
        <li><strong>Interface:</strong> Widget flutuante com animação de pulso</li>
        <li><strong>Respostas:</strong> Streaming em tempo real</li>
        <li><strong>Conhecimento:</strong> Treinado com informações da SIX Saúde</li>
        <li><strong>Contexto:</strong> Conhece planos, serviços, contatos e horários</li>
        <li><strong>Fallback:</strong> Opção de transferir para WhatsApp</li>
        <li><strong>Histórico:</strong> Conversa mantida durante a sessão</li>
      </ul>
      <p style="margin-top: 10px; color: var(--gold);"><strong>Benefício:</strong> Atendimento instantâneo, captura de leads e redução de carga no suporte humano.</p>
    </div>

    <h3>7. Páginas Legais e Compliance</h3>
    <div class="grid-2 no-break">
      <ul class="compact-list">
        <li><strong>Política de Privacidade</strong> — /privacidade</li>
        <li><strong>Termos de Uso</strong> — /termos</li>
      </ul>
      <ul class="compact-list">
        <li><strong>LGPD</strong> — /lgpd</li>
        <li><strong>Política de Cookies</strong> — /cookies</li>
      </ul>
    </div>

    <div class="footer">
      <span>SIX Saúde - Documento de Entrega</span>
      <span class="page-number">5</span>
    </div>
  </div>

  <!-- Page 6: Design System -->
  <div class="page">
    <div class="header">
      <img src="${logoDataUrl}" alt="SIX Saúde" class="header-logo">
      <div class="header-title">Documento de Entrega</div>
    </div>

    <h2>Design System</h2>

    <h3>Paleta de Cores</h3>
    <div class="color-row no-break">
      <div class="color-swatch">
        <div class="color-box" style="background: #0A0A0A;"></div>
        <div class="color-info">
          <div class="color-name">Preto Premium</div>
          <div class="color-hex">#0A0A0A</div>
        </div>
      </div>
      <div class="color-swatch">
        <div class="color-box" style="background: #F1C10F;"></div>
        <div class="color-info">
          <div class="color-name">Dourado Primário</div>
          <div class="color-hex">#F1C10F</div>
        </div>
      </div>
      <div class="color-swatch">
        <div class="color-box" style="background: #F4CA2F;"></div>
        <div class="color-info">
          <div class="color-name">Dourado Assinatura</div>
          <div class="color-hex">#F4CA2F</div>
        </div>
      </div>
    </div>
    <div class="color-row no-break">
      <div class="color-swatch">
        <div class="color-box" style="background: #FFFFFF; border: 2px solid #2A2A2A;"></div>
        <div class="color-info">
          <div class="color-name">Branco</div>
          <div class="color-hex">#FFFFFF</div>
        </div>
      </div>
      <div class="color-swatch">
        <div class="color-box" style="background: #A8A8A8;"></div>
        <div class="color-info">
          <div class="color-name">Platina</div>
          <div class="color-hex">#A8A8A8</div>
        </div>
      </div>
      <div class="color-swatch">
        <div class="color-box" style="background: #1E1E1E;"></div>
        <div class="color-info">
          <div class="color-name">Charcoal</div>
          <div class="color-hex">#1E1E1E</div>
        </div>
      </div>
    </div>

    <h3>Tipografia</h3>
    <div class="grid-2 no-break">
      <div class="card">
        <h4 style="font-family: 'Syne', sans-serif; font-size: 14pt; margin-top: 0;">Syne</h4>
        <p style="margin-bottom: 4px;">Fonte display para títulos</p>
        <p style="font-family: 'Syne', sans-serif; font-size: 12pt; color: var(--white); margin: 0;">ABCDEFGHIJKLMNOPQ</p>
      </div>
      <div class="card">
        <h4 style="font-family: 'Inter', sans-serif; font-size: 14pt; margin-top: 0;">Inter</h4>
        <p style="margin-bottom: 4px;">Fonte corpo para textos</p>
        <p style="font-family: 'Inter', sans-serif; font-size: 12pt; color: var(--white); margin: 0;">ABCDEFGHIJKLMNOPQ</p>
      </div>
    </div>

    <h3>Biblioteca de Componentes (40+)</h3>
    <div class="grid-2 no-break">
      <div class="card">
        <h4 style="margin-top: 0;">Componentes Base</h4>
        <ul class="compact-list">
          <li><strong>Buttons</strong> — 4 variantes</li>
          <li><strong>Cards</strong> — 7 variantes</li>
          <li><strong>Badges</strong> — Categorias e status</li>
          <li><strong>Inputs</strong> — Busca e formulários</li>
        </ul>
      </div>
      <div class="card">
        <h4 style="margin-top: 0;">Componentes Avançados</h4>
        <ul class="compact-list">
          <li><strong>Accordions</strong> — FAQ expansível</li>
          <li><strong>Modals</strong> — Diálogos</li>
          <li><strong>Pagination</strong> — Navegação</li>
          <li><strong>+30 outros</strong> — Especializados</li>
        </ul>
      </div>
    </div>

    <h3>Biblioteca de Animações (60+)</h3>
    <div class="card no-break">
      <div class="grid-2">
        <ul class="compact-list">
          <li><strong>MagneticButton</strong> — Efeito magnético</li>
          <li><strong>TiltCard</strong> — Efeito 3D ao hover</li>
          <li><strong>AnimatedCounter</strong> — Números animados</li>
        </ul>
        <ul class="compact-list">
          <li><strong>GradientText</strong> — Gradiente animado</li>
          <li><strong>ParallaxLayer</strong> — Efeito parallax</li>
          <li><strong>CursorGlow</strong> — Brilho no cursor</li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <span>SIX Saúde - Documento de Entrega</span>
      <span class="page-number">6</span>
    </div>
  </div>

  <!-- Page 7: Tech Stack -->
  <div class="page">
    <div class="header">
      <img src="${logoDataUrl}" alt="SIX Saúde" class="header-logo">
      <div class="header-title">Documento de Entrega</div>
    </div>

    <h2>Tecnologias Utilizadas</h2>

    <h3>Stack Principal</h3>
    <table>
      <tr>
        <th>Tecnologia</th>
        <th>Versão</th>
        <th>Propósito</th>
      </tr>
      <tr>
        <td><strong>Next.js</strong></td>
        <td>16.1.5</td>
        <td>Framework React com App Router</td>
      </tr>
      <tr>
        <td><strong>React</strong></td>
        <td>19.2.3</td>
        <td>Biblioteca de interface</td>
      </tr>
      <tr>
        <td><strong>TypeScript</strong></td>
        <td>5.x</td>
        <td>Tipagem estática</td>
      </tr>
      <tr>
        <td><strong>Tailwind CSS</strong></td>
        <td>4.x</td>
        <td>Sistema de design</td>
      </tr>
      <tr>
        <td><strong>Framer Motion</strong></td>
        <td>12.x</td>
        <td>Animações premium</td>
      </tr>
    </table>

    <h3>Backend e Banco de Dados</h3>
    <table>
      <tr>
        <th>Tecnologia</th>
        <th>Propósito</th>
      </tr>
      <tr>
        <td><strong>Neon</strong></td>
        <td>PostgreSQL serverless na nuvem</td>
      </tr>
      <tr>
        <td><strong>Drizzle ORM</strong></td>
        <td>Mapeamento objeto-relacional type-safe</td>
      </tr>
      <tr>
        <td><strong>Jose + bcryptjs</strong></td>
        <td>Autenticação JWT e criptografia</td>
      </tr>
    </table>

    <h3>Inteligência Artificial</h3>
    <table>
      <tr>
        <th>Tecnologia</th>
        <th>Propósito</th>
      </tr>
      <tr>
        <td><strong>Vercel AI SDK</strong></td>
        <td>Streaming de respostas em tempo real</td>
      </tr>
      <tr>
        <td><strong>Claude (Anthropic)</strong></td>
        <td>Geração de conteúdo para blog</td>
      </tr>
      <tr>
        <td><strong>Gemini (Google)</strong></td>
        <td>Chat de suporte ao cliente</td>
      </tr>
      <tr>
        <td><strong>OpenRouter</strong></td>
        <td>Gateway unificado de APIs de IA</td>
      </tr>
    </table>

    <div class="footer">
      <span>SIX Saúde - Documento de Entrega</span>
      <span class="page-number">7</span>
    </div>
  </div>

  <!-- Page 8: Database & APIs -->
  <div class="page">
    <div class="header">
      <img src="${logoDataUrl}" alt="SIX Saúde" class="header-logo">
      <div class="header-title">Documento de Entrega</div>
    </div>

    <h2>Banco de Dados e APIs</h2>

    <h3>Estrutura do Banco de Dados</h3>
    <div class="grid-2 no-break">
      <div class="card">
        <h4 style="margin-top: 0;">USERS</h4>
        <pre style="margin: 0;"><code>id, email, password_hash
name, role, avatar_url
created_at, updated_at</code></pre>
      </div>
      <div class="card">
        <h4 style="margin-top: 0;">CATEGORIES</h4>
        <pre style="margin: 0;"><code>id, name, slug, color
created_at</code></pre>
      </div>
    </div>

    <div class="card no-break" style="margin-top: 12px;">
      <h4 style="margin-top: 0;">POSTS</h4>
      <pre style="margin: 0;"><code>id, slug, title, excerpt, content, cover_image
category_id, author_id, published_at, reading_time
featured, status, ai_generated, created_at, updated_at</code></pre>
    </div>

    <div class="grid-2 no-break" style="margin-top: 12px;">
      <div class="card">
        <h4 style="margin-top: 0;">AUTHORS</h4>
        <pre style="margin: 0;"><code>id, name, email
role, avatar_url</code></pre>
      </div>
      <div class="card">
        <h4 style="margin-top: 0;">POST_TAGS</h4>
        <pre style="margin: 0;"><code>id, post_id, tag</code></pre>
      </div>
    </div>

    <h3>APIs REST Desenvolvidas</h3>
    <table>
      <tr>
        <th>Método</th>
        <th>Rota</th>
        <th>Função</th>
      </tr>
      <tr>
        <td>GET/POST</td>
        <td>/api/posts</td>
        <td>Listar e criar artigos</td>
      </tr>
      <tr>
        <td>GET/PUT/DELETE</td>
        <td>/api/posts/[id]</td>
        <td>Buscar, atualizar e excluir</td>
      </tr>
      <tr>
        <td>GET/POST</td>
        <td>/api/categories</td>
        <td>Listar e criar categorias</td>
      </tr>
      <tr>
        <td>POST</td>
        <td>/api/ai/generate-post</td>
        <td>Gerar conteúdo com IA</td>
      </tr>
      <tr>
        <td>POST</td>
        <td>/api/chat/support</td>
        <td>Chat com assistente IA</td>
      </tr>
      <tr>
        <td>POST</td>
        <td>/api/auth/login</td>
        <td>Autenticação de usuário</td>
      </tr>
      <tr>
        <td>GET/POST</td>
        <td>/api/auth/me, /logout</td>
        <td>Sessão do usuário</td>
      </tr>
    </table>

    <div class="footer">
      <span>SIX Saúde - Documento de Entrega</span>
      <span class="page-number">8</span>
    </div>
  </div>

  <!-- Page 9: Performance & Security -->
  <div class="page">
    <div class="header">
      <img src="${logoDataUrl}" alt="SIX Saúde" class="header-logo">
      <div class="header-title">Documento de Entrega</div>
    </div>

    <h2>Performance, SEO e Segurança</h2>

    <div class="grid-2 no-break">
      <div class="card">
        <h4 style="margin-top: 0;">SEO Otimizado</h4>
        <ul class="compact-list">
          <li>Meta tags completas</li>
          <li>Open Graph para redes sociais</li>
          <li>Twitter Cards</li>
          <li>Schema.org (LocalBusiness)</li>
          <li>Sitemap dinâmico</li>
          <li>URLs amigáveis (slugs)</li>
        </ul>
      </div>
      <div class="card">
        <h4 style="margin-top: 0;">Performance Web</h4>
        <ul class="compact-list">
          <li>Next.js 16 com Turbopack</li>
          <li>Imagens WebP/AVIF</li>
          <li>Lazy loading</li>
          <li>Font swap otimizado</li>
          <li>Code splitting por rota</li>
          <li>Cache inteligente</li>
        </ul>
      </div>
    </div>

    <div class="grid-2 no-break" style="margin-top: 12px;">
      <div class="card">
        <h4 style="margin-top: 0;">Segurança</h4>
        <ul class="compact-list">
          <li>X-Content-Type-Options</li>
          <li>X-Frame-Options</li>
          <li>X-XSS-Protection</li>
          <li>Referrer-Policy</li>
          <li>Cookies httpOnly/secure</li>
          <li>Senhas com bcrypt</li>
        </ul>
      </div>
      <div class="card">
        <h4 style="margin-top: 0;">Acessibilidade (WCAG AAA)</h4>
        <ul class="compact-list">
          <li>Contraste 7:1</li>
          <li>Navegação por teclado</li>
          <li>ARIA labels</li>
          <li>HTML semântico</li>
          <li>Skip links</li>
          <li>prefers-reduced-motion</li>
        </ul>
      </div>
    </div>

    <h3>Responsividade Mobile-First</h3>
    <div class="grid-3 no-break">
      <div class="stat-box">
        <div class="stat-number" style="font-size: 16pt;">320px</div>
        <div class="stat-label">Mobile</div>
      </div>
      <div class="stat-box">
        <div class="stat-number" style="font-size: 16pt;">768px</div>
        <div class="stat-label">Tablet</div>
      </div>
      <div class="stat-box">
        <div class="stat-number" style="font-size: 16pt;">1440px+</div>
        <div class="stat-label">Desktop / 4K</div>
      </div>
    </div>

    <h3>Integrações Externas</h3>
    <div class="grid-2 no-break">
      <ul class="compact-list">
        <li><strong>WhatsApp Business</strong> — Contato direto</li>
        <li><strong>Portal Digital Saúde</strong> — Área do cliente</li>
      </ul>
      <ul class="compact-list">
        <li><strong>App Stores</strong> — Google Play e Apple</li>
        <li><strong>Redes Sociais</strong> — Instagram, LinkedIn, Facebook</li>
      </ul>
    </div>

    <div class="footer">
      <span>SIX Saúde - Documento de Entrega</span>
      <span class="page-number">9</span>
    </div>
  </div>

  <!-- Page 10: Checklist -->
  <div class="page">
    <div class="header">
      <img src="${logoDataUrl}" alt="SIX Saúde" class="header-logo">
      <div class="header-title">Documento de Entrega</div>
    </div>

    <h2>Checklist de Entregáveis</h2>

    <ul class="checklist no-break">
      <li><span class="check">✓</span> Landing Page Institucional Premium</li>
      <li><span class="check">✓</span> Página Sobre Nós com Timeline</li>
      <li><span class="check">✓</span> Portal de Blog/Notícias Completo</li>
      <li><span class="check">✓</span> Painel Administrativo (CMS)</li>
      <li><span class="check">✓</span> Gerador de Conteúdo com IA</li>
      <li><span class="check">✓</span> Chat de Suporte com IA</li>
      <li><span class="check">✓</span> Páginas Legais (LGPD/Privacidade)</li>
      <li><span class="check">✓</span> Sistema de Autenticação JWT</li>
      <li><span class="check">✓</span> Banco de Dados PostgreSQL</li>
      <li><span class="check">✓</span> APIs REST Documentadas</li>
      <li><span class="check">✓</span> Design System Completo</li>
      <li><span class="check">✓</span> 60+ Animações Premium</li>
      <li><span class="check">✓</span> Responsividade Mobile-First</li>
      <li><span class="check">✓</span> Otimização SEO Completa</li>
      <li><span class="check">✓</span> Integração WhatsApp</li>
      <li><span class="check">✓</span> Configuração de Deploy</li>
    </ul>

    <h3>Comandos de Manutenção</h3>
    <div class="card no-break">
      <pre style="margin: 0;"><code># Desenvolvimento
pnpm dev              # Servidor local (localhost:3000)

# Produção
pnpm build            # Build de produção
pnpm start            # Servidor de produção

# Banco de Dados
pnpm db:generate      # Gerar migrações
pnpm db:push          # Aplicar mudanças
pnpm db:seed          # Popular dados iniciais</code></pre>
    </div>

    <h3>Variáveis de Ambiente</h3>
    <div class="card no-break">
      <pre style="margin: 0;"><code>DATABASE_URL=         # Conexão Neon PostgreSQL
OPENROUTER_API_KEY=   # API para IA (chat e gerador)
JWT_SECRET=           # Chave secreta para tokens</code></pre>
    </div>

    <div class="footer">
      <span>SIX Saúde - Documento de Entrega</span>
      <span class="page-number">10</span>
    </div>
  </div>

  <!-- Page 11: Closing -->
  <div class="page cover" style="background: var(--black);">
    <img src="${logoDataUrl}" alt="SIX Saúde" style="width: 180px; margin-bottom: 40px;">

    <h2 style="border: none; margin: 0 0 24px 0; font-size: 18pt;">Considerações Finais</h2>

    <div class="highlight-box" style="max-width: 500px; text-align: left;">
      <p style="font-size: 10pt;">A plataforma digital desenvolvida para a SIX Saúde representa um investimento significativo em presença digital moderna e eficiente.</p>
    </div>

    <div style="max-width: 450px; margin-top: 24px; text-align: left;">
      <p style="color: var(--gold); font-size: 10pt;"><strong>Com tecnologias de ponta e recursos de IA, o site está preparado para:</strong></p>
      <ul style="margin-top: 12px; font-size: 9pt;">
        <li><strong>Converter visitantes em clientes</strong> — experiência premium</li>
        <li><strong>Reduzir custos de atendimento</strong> — chat inteligente 24/7</li>
        <li><strong>Manter conteúdo atualizado</strong> — geração de artigos por IA</li>
        <li><strong>Escalar com segurança</strong> — infraestrutura serverless</li>
        <li><strong>Ranquear bem no Google</strong> — SEO otimizado</li>
      </ul>
    </div>

    <div class="gold-line" style="margin: 36px auto;"></div>

    <p style="color: var(--gold); font-family: 'Syne', sans-serif; font-size: 12pt; font-weight: 600;">
      Desenvolvido com excelência para a SIX Saúde
    </p>

    <p style="color: var(--platinum); margin-top: 8px; font-size: 9pt;">
      Estamos à disposição para quaisquer dúvidas, ajustes ou futuras evoluções do projeto.
    </p>

    <p style="color: var(--platinum); margin-top: 30px; font-size: 8pt;">
      Fevereiro de 2026
    </p>
  </div>

</body>
</html>
`;

async function generatePDF() {
  console.log('Iniciando geração do PDF...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.setContent(htmlContent, {
    waitUntil: 'networkidle0'
  });

  // Wait for fonts to load
  await page.evaluateHandle('document.fonts.ready');

  const outputPath = path.join(__dirname, '../SIX_Saude_Documento_Entrega.pdf');

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: '0',
      right: '0',
      bottom: '0',
      left: '0'
    }
  });

  await browser.close();

  console.log(`PDF gerado com sucesso: ${outputPath}`);
  console.log('Total de páginas: 11');
}

generatePDF().catch(console.error);
