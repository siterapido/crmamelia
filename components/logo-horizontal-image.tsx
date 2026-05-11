'use client';

import React from 'react';
import Image from 'next/image';

type LogoColor = 'preta' | 'branca' | 'amarela';

interface LogoHorizontalImageProps {
  color?: LogoColor;
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
}

export default function LogoHorizontalImage({
  color = 'preta',
  width = 400,
  height = 200,
  className = '',
  alt = 'Amélia Saúde',
  priority = false,
}: LogoHorizontalImageProps) {
  const colorMap: Record<LogoColor, string> = {
    preta: '/amelia-saude-logo-preta-horizontal.svg',
    branca: '/amelia-saude-logo-branca-horizontal.svg',
    amarela: '/amelia-saude-logo-amarela-horizontal.svg',
  };

  const altText = alt || `Amélia Saúde Logo Horizontal - ${color}`;

  return (
    <Image
      src={colorMap[color]}
      alt={altText}
      width={width}
      height={height}
      className={className}
      priority={priority}
      unoptimized
    />
  );
}
