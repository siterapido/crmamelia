'use client';

import React from 'react';
import Image from 'next/image';

type LogoColor = 'preta' | 'branca' | 'amarela';

interface LogoImageProps {
  color?: LogoColor;
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
}

export default function LogoImage({
  color = 'preta',
  width = 200,
  height = 200,
  className = '',
  alt = 'Amélia Saúde',
  priority = false,
}: LogoImageProps) {
  const colorMap: Record<LogoColor, string> = {
    preta: '/amelia-saude-logo-preta.svg',
    branca: '/amelia-saude-logo-branca.svg',
    amarela: '/amelia-saude-logo-amarela.svg',
  };

  const altText = alt || `Amélia Saúde Logo - ${color}`;

  return (
    <Image
      src={colorMap[color]}
      alt={altText}
      width={width}
      height={height}
      className={className}
      priority={priority}
      unoptimized // SVGs don't need optimization
    />
  );
}
