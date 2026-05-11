# Atualização do Navbar para usar os novos Logos

## Situação Atual

O arquivo `components/layout/Navbar.tsx` está tentando carregar `/logo.png` que **não existe** no diretório `public/`.

## Solução

Opção 1: Usar o componente `<LogoImage />` (Recomendado)

```tsx
// components/layout/Navbar.tsx
import { LogoImage } from '@/components/logo-image';  // Adicionar import

// Substituir o bloco do Logo atual:
{/* Logo */}
<Link
  href="/"
  className="flex items-center gap-2 group"
  aria-label="Amélia Saúde - Pagina inicial"
>
  <motion.div
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
    className="relative w-32 h-12"
  >
    <LogoImage
      color="branca"
      width={128}
      height={48}
      priority
    />
  </motion.div>
</Link>
```

Opção 2: Usar diretamente o arquivo SVG

```tsx
// components/layout/Navbar.tsx

{/* Logo */}
<Link
  href="/"
  className="flex items-center gap-2 group"
  aria-label="Amélia Saúde - Pagina inicial"
>
  <motion.div
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
    className="relative w-32 h-12"
  >
    <Image
      src="/amelia-saude-logo-branca.svg"  // Alterar de /logo.png
      alt="Amélia Saúde"
      fill
      className="object-contain"
      priority
      unoptimized  // Importante para SVGs
    />
  </motion.div>
</Link>
```

## Detalhes da Atualização

### Importações

Adicionar:
```tsx
import { LogoImage } from '@/components/logo-image';
```

### Mudanças

1. **Componente:** Substituir `<Image src="/logo.png" />` por `<LogoImage />`
2. **Cor:** Usar `color="branca"` porque o Navbar tem fundo escuro/premium
3. **Dimensões:** `width={128} height={48}` (32 x 12 em Tailwind)
4. **Performance:** Manter `priority={true}` (logo está acima do fold)

### Tamanhos Disponíveis

```tsx
// Logo pequeno (mobile/tablet)
<LogoImage color="branca" width={100} height={40} />

// Logo médio (desktop)
<LogoImage color="branca" width={128} height={48} />

// Logo grande (hero section)
<LogoImage color="amarela" width={300} height={300} />
```

## Benefícios da Atualização

✅ **Arquivo existe:** `/amelia-saude-logo-branca.svg` está disponível
✅ **SVG vetorial:** Sem perda de qualidade ao redimensionar
✅ **Dark mode:** Cor branca visível no fundo escuro do Navbar
✅ **SEO e Acessibilidade:** Tags `<title>`, `<desc>`, `role="img"`, `aria-label`
✅ **Performance:** ~3.9KB otimizado para web
✅ **Componentizado:** Fácil manutenção e customização

## Como Aplicar

1. Abrir `components/layout/Navbar.tsx`
2. Adicionar o import: `import { LogoImage } from '@/components/logo-image';`
3. Substituir o bloco `<Image src="/logo.png" ... />` por `<LogoImage color="branca" ... />`
4. Testar em diferentes tamanhos de tela

## Exemplo Completo

```tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { LogoImage } from '@/components/logo-image'  // NOVO
import { cn } from '@/lib/utils/cn'

// ... resto do código ...

export const Navbar = () => {
  // ... hooks ...

  return (
    <>
      <motion.header className={cn(...)}>
        <Container>
          <nav className="flex items-center justify-between" aria-label="Navegacao principal">
            {/* Logo ATUALIZADO */}
            <Link
              href="/"
              className="flex items-center gap-2 group"
              aria-label="Amélia Saúde - Pagina inicial"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="relative w-32 h-12"
              >
                <LogoImage
                  color="branca"
                  width={128}
                  height={48}
                  priority
                  alt="Amélia Saúde - Logo"
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {/* ... rest of nav items ... */}
            </div>

            {/* Mobile Menu Button */}
            {/* ... mobile menu ... */}
          </nav>
        </Container>
      </motion.header>
    </>
  )
}
```

---

**Criado em:** 30/01/2026
**Status:** Pronto para implementar
