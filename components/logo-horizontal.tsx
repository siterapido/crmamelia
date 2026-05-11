import React from 'react';

type LogoColor = 'preta' | 'branca' | 'amarela';

interface LogoHorizontalProps {
  color?: LogoColor;
  width?: number | string;
  height?: number | string;
  className?: string;
  alt?: string;
}

export default function LogoHorizontal({
  color = 'preta',
  width = 400,
  height = 200,
  className = '',
  alt = 'Amélia Saúde',
}: LogoHorizontalProps) {
  const colorMap: Record<LogoColor, string> = {
    preta: '/amelia-saude-logo-preta-horizontal.svg',
    branca: '/amelia-saude-logo-branca-horizontal.svg',
    amarela: '/amelia-saude-logo-amarela-horizontal.svg',
  };

  const altText = alt || `Amélia Saúde Logo Horizontal - ${color}`;

  return (
    <img
      src={colorMap[color]}
      alt={altText}
      width={width}
      height={height}
      className={className}
    />
  );
}
