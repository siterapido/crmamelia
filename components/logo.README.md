# Amélia Saúde - Logo Componentes

Este diretório contém os arquivos de logo do projeto Amélia Saúde.

## 📁 Arquivos SVG

Localização: `public/`

| Arquivo | Cor | Tamanho | Uso Recomendado |
|---------|-----|---------|-----------------|
| `amelia-saude-logo-preta.svg` | Preto (#000000) | 3.9KB | Fundos claros |
| `amelia-saude-logo-branca.svg` | Branco (#FFFFFF) | 3.9KB | Fundos escuros, dark mode |
| `amelia-saude-logo-amarela.svg` | Amarelo (#FFCC00) | 3.9KB | Destaque, CTA |

## 🎨 Componentes Disponíveis

### 1. `<Logo />` - Componente com `<img>`

```tsx
import Logo from '@/components/logo';

// Uso básico
<Logo />

// Com cor específica
<Logo color="branca" />

// Com tamanho personalizado
<Logo width={150} height={150} />

// Com classe CSS
<Logo className="logo-header" />
```

**Props:**
- `color?: 'preta' | 'branca' | 'amarela'` (default: `'preta'`)
- `width?: number | string` (default: `200`)
- `height?: number | string` (default: `200`)
- `className?: string`
- `alt?: string` (default: `'Amélia Saúde'`)

---

### 2. `<LogoImage />` - Componente com Next.js `<Image>`

```tsx
import LogoImage from '@/components/logo-image';

// Uso básico
<LogoImage />

// Para hero section (prioridade alta)
<LogoImage priority />

// Com cor específica para dark mode
<LogoImage color="branca" />
```

**Props:**
- `color?: 'preta' | 'branca' | 'amarela'` (default: `'preta'`)
- `width?: number` (default: `200`)
- `height?: number` (default: `200`)
- `className?: string`
- `alt?: string` (default: `'Amélia Saúde'`)
- `priority?: boolean` (default: `false`)

---

## 💻 Exemplos de Uso

### Header (Fundo Claro)

```tsx
// Header com fundo branco
import Logo from '@/components/logo';

<header className="bg-white">
  <Logo width={120} height={120} className="logo-header" />
</header>
```

### Header (Fundo Escuro / Dark Mode)

```tsx
// Header com fundo escuro
import Logo from '@/components/logo';

<header className="bg-gray-900 dark:bg-gray-950">
  <Logo color="branca" width={120} height={120} />
</header>
```

### Hero Section

```tsx
// Hero com logo em destaque (amarelo)
import Logo from '@/components/logo';

<section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
  <Logo color="amarela" width={300} height={300} />
</section>
```

### Footer

```tsx
// Footer simples
import Logo from '@/components/logo';

<footer className="bg-gray-100 dark:bg-gray-900">
  <Logo width={80} height={80} />
  <p className="mt-2 text-sm">© 2026 Amélia Saúde</p>
</footer>
```

### Com Dark Mode Automático

```tsx
// Logo que muda automaticamente com o tema
import { useTheme } from 'next-themes';
import Logo from '@/components/logo';

export function LogoThemed() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Logo color={isDark ? 'branca' : 'preta'} width={150} height={150} />
  );
}
```

### Mobile Responsive

```tsx
import Logo from '@/components/logo';

<Logo
  width={200}
  height={200}
  className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48"
/>
```

### Link Wrapper

```tsx
import Link from 'next/link';
import Logo from '@/components/logo';

<Link href="/">
  <Logo width={120} height={120} />
</Link>
```

## 🎯 Tailwind Classes Úteis

```tsx
// Hover effect
<Logo className="hover:scale-105 transition-transform" />

// Animação suave
<Logo className="animate-pulse" />

- // Gradiente no logo
<div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-lg">
  <Logo color="branca" />
</div>
```

## 🌐 Uso com CSS-in-JS (Styled Components)

```tsx
import styled from 'styled-components';
import Logo from '@/components/logo';

const StyledLogo = styled(Logo)`
  @media (max-width: 768px) {
    width: 100px !important;
    height: 100px !important;
  }
`;

<StyledLogo />
```

## 🔧 Uso com Tailwind Config

Adicionar ao `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  // ... outras configs
  theme: {
    extend: {
      backgroundImage: {
        'logo-preta': "url('/amelia-saude-logo-preta.svg')",
        'logo-branca': "url('/amelia-saude-logo-branca.svg')",
        'logo-amarela': "url('/amelia-saude-logo-amarela.svg')",
      },
      backgroundSize: {
        'logo': 'contain',
      },
    },
  },
};
export default config;
```

Uso:
```tsx
<div className="w-32 h-32 bg-logo-preta bg-logo bg-no-repeat" />
```

## 📱 Performance Tips

1. **Use `<LogoImage />`** com `priority={true}` para logos acima do fold
2. **Use `<Logo />`** para logos simples sem necessidade de otimização extra
3. **Lazy load** logos abaixo do fold (automático com Next.js)
4. **Evite inline SVGs grandes** - use os arquivos do diretório `public/`

## 🎨 Cores e Hex

| Nome | Hex | CSS Class |
|------|-----|-----------|
| Preto | `#000000` | `text-black` |
| Branco | `#FFFFFF` | `text-white` |
| Amarelo | `#FFCC00` | `bg-yellow-400` |

## 📄 Acessibilidade

Todos os componentes incluem:
- ✅ Alt text customizável
- ✅ `role="img"` no SVG original
- ✅ `aria-label` no SVG original
- ✅ SEO tags no SVG original (`<title>`, `<desc>`)

## 🔗 Referências

- [Next.js Image Component](https://nextjs.org/docs/api-reference/next/image)
- [Tailwind CSS](https://tailwindcss.com)
- [SVG na Web](https://developer.mozilla.org/pt-BR/docs/Web/SVG)

---

**Última atualização:** 30/01/2026
