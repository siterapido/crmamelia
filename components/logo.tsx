import React from 'react';

type LogoColor = 'preta' | 'branca' | 'amarela';

interface LogoProps {
  color?: LogoColor;
  width?: number | string;
  height?: number | string;
  className?: string;
  alt?: string;
}

export default function Logo({
  color = 'preta',
  width = 200,
  height = 200,
  className = '',
  alt = 'Amélia Saúde',
}: LogoProps) {
  const colorMap: Record<LogoColor, string> = {
    preta: '/amelia-saude-logo-preta.svg',
    branca: '/amelia-saude-logo-branca.svg',
    amarela: '/amelia-saude-logo-amarela.svg',
  };

  const altText = alt || `Amélia Saúde Logo - ${color}`;

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
