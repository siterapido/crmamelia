import type { Config } from 'tailwindcss'

const colors = {
  // Premium Black - Refined with warm undertones for depth
  'black-premium': '#0A0A0A',
  'black-deep': '#111111',
  'black-charcoal': '#1A1A1A',
  'black-elevated': '#1E1E1E',
  'black-warm': '#1A1816',        // Black with warm undertone
  'black-gradient-end': '#141414', // For subtle gradients

  // Accent - Lavanda roxo (#7B6BB1) with complementary tones
  'gold-primary': '#7B6BB1',       // Main accent
  'gold-signature': '#9B8DD1',     // Slightly lighter
  'gold-light': '#BBB1E1',         // Light highlight
  'gold-soft': '#5B4B91',          // Warm deeper tone
  'gold-dark': '#4B3B81',          // Rich deep tone
  'gold-vibrant': '#7B6BB1',       // Original vibrant

  // Warm neutrals
  'platinum': '#A8A8A8',
  'platinum-light': '#B8B8B8',
  'platinum-warm': '#C4B8A8',      // Warmer platinum
  'gray-border': '#2A2A2A',
  'gray-dark': '#333333',

  // Status colors
  'success-premium': '#10D86F',
  'error-premium': '#E63946',
  'warning-premium': '#7B6BB1',
}

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      ...colors,
      inherit: 'inherit',
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',
    },
    extend: {
      colors: {
        ...colors,
      },
      fontFamily: {
        'display': ['var(--font-syne)', 'sans-serif'],
        'body': ['var(--font-inter)', 'sans-serif'],
      },
      fontSize: {
        // Desktop Scale
        'h1': ['72px', { lineHeight: '1.1', letterSpacing: '-2px' }],
        'h2': ['56px', { lineHeight: '1.2', letterSpacing: '-1px' }],
        'h3': ['32px', { lineHeight: '1.3', letterSpacing: '-0.5px' }],
        'h4': ['24px', { lineHeight: '1.4', letterSpacing: '0px' }],
        'body-lg': ['20px', { lineHeight: '1.7', letterSpacing: '0px' }],
        'body': ['16px', { lineHeight: '1.6', letterSpacing: '0px' }],
        'body-sm': ['14px', { lineHeight: '1.5', letterSpacing: '0px' }],
        'btn': ['16px', { lineHeight: '1', letterSpacing: '0.5px' }],
      },
      spacing: {
        // Premium spacing scale (8px base)
        'micro': '8px',
        'xs': '16px',
        'sm': '24px',
        'base': '32px',
        'md': '48px',
        'lg': '64px',
        'xl': '96px',
        'xxl': '128px',
      },
      borderRadius: {
        'premium': '16px',
        'card': '20px',
        'card-sm': '14px',
        'section': '24px',
      },
      boxShadow: {
        // Premium shadows
        'premium': '0 8px 32px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15)',
        'premium-hover': '0 20px 60px rgba(0, 0, 0, 0.35), 0 8px 24px rgba(0, 0, 0, 0.2)',
        // Accent shadows - lavanda #7B6BB1
        'gold-sm': '0 8px 32px rgba(123, 107, 177, 0.25), 0 4px 12px rgba(123, 107, 177, 0.12)',
        'gold-md': '0 16px 48px rgba(123, 107, 177, 0.3), 0 8px 16px rgba(123, 107, 177, 0.15)',
        'gold-lg': '0 24px 64px rgba(123, 107, 177, 0.35), 0 12px 24px rgba(123, 107, 177, 0.18)',
        'gold-glow': '0 0 40px rgba(123, 107, 177, 0.3), 0 0 20px rgba(123, 107, 177, 0.18)',
        'gold-glow-lg': '0 0 60px rgba(123, 107, 177, 0.4), 0 0 30px rgba(123, 107, 177, 0.22)',
        // Glass effects
        'glass': '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(123, 107, 177, 0.12), inset 0 1px 0 rgba(123, 107, 177, 0.1)',
        'glass-hover': '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(123, 107, 177, 0.15), inset 0 1px 0 rgba(123, 107, 177, 0.15)',
        // Card shadows
        'card-soft': '0 10px 50px rgba(0, 0, 0, 0.12), 0 6px 20px rgba(0, 0, 0, 0.08)',
        'card-soft-hover': '0 25px 80px rgba(0, 0, 0, 0.18), 0 10px 30px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        // Accent gradients - lavanda #7B6BB1 based
        'gradient-gold': 'linear-gradient(135deg, #5B4B91 0%, #7B6BB1 50%, #5B4B91 100%)',
        'gradient-gold-soft': 'linear-gradient(165deg, #7B6BB1 0%, #9B8DD1 50%, #7B6BB1 100%)',
        'gradient-gold-vibrant': 'linear-gradient(135deg, #7B6BB1 0%, #BBB1E1 50%, #7B6BB1 100%)',
        // Dark section gradients - subtle depth
        'gradient-black-deep': 'linear-gradient(180deg, #0A0A0A 0%, #141414 100%)',
        'gradient-black-warm': 'radial-gradient(ellipse at top center, #1A1816 0%, #0A0A0A 70%)',
        'gradient-black-radial': 'radial-gradient(ellipse 120% 80% at 50% 0%, #1A1816 0%, #0A0A0A 60%)',
        // Section transitions
        'gradient-section-dark': 'linear-gradient(180deg, transparent 0%, #0A0A0A 10%, #0A0A0A 90%, transparent 100%)',
        // Separators and accents - vibrant accent
        'gradient-separator': 'linear-gradient(90deg, transparent, rgba(123, 107, 177, 0.4), transparent)',
        'gradient-gold-radial': 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(123, 107, 177, 0.12) 0%, transparent 70%)',
        'gradient-cta': 'linear-gradient(135deg, rgba(123, 107, 177, 0.06) 0%, transparent 50%)',
        // Accent section backgrounds
        'gradient-gold-section': 'linear-gradient(165deg, #5B4B91 0%, #7B6BB1 50%, #5B4B91 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out-expo',
        'slide-up': 'slideUp 0.8s ease-out-expo',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'pulse-gold': 'pulseGold 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'neon-pulse': 'neonPulse 3s ease-in-out infinite',
        // New animations migrated from globals.css
        'card-float': 'cardFloat 6s ease-in-out infinite',
        'card-breathe': 'cardBreathe 8s ease-in-out infinite',
        'premium-float': 'premiumFloat 7s ease-in-out infinite',
        'ambient-pulse': 'ambientPulse 10s ease-in-out infinite',
        'ambient-breath': 'ambientBreath 12s ease-in-out infinite',
        'mesh-float': 'meshFloat 25s ease-in-out infinite',
        'flow-gradient': 'flowGradient 18s linear infinite',
        'spotlight-move': 'spotlightMove 30s ease-in-out infinite',
        'shine-diagonal': 'shineDiagonal 15s linear infinite',
        'particle-float-1': 'particleFloat1 22s ease-in-out infinite',
        'particle-float-2': 'particleFloat2 28s ease-in-out infinite',
        'aurora-wave': 'auroraWave 10s ease-in-out infinite',
        'vibrate-blur-1': 'vibrateBlur1 8s ease-in-out infinite',
        'vibrate-blur-2': 'vibrateBlur2 10s ease-in-out infinite',
        'vibrate-blur-3': 'vibrateBlur3 12s ease-in-out infinite',
        'vibrate-blur-4': 'vibrateBlur4 9s ease-in-out infinite',
        'shimmer-border': 'shimmerBorder 3s linear infinite',
        'float-element': 'floatElement 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        floatElement: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-8px) rotate(2deg)' },
          '66%': { transform: 'translateY(-4px) rotate(-1deg)' },
        },
        shimmerBorder: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 25px rgba(123, 107, 177, 0.22), 0 0 50px rgba(123, 107, 177, 0.1)' },
          '50%': { boxShadow: '0 0 35px rgba(123, 107, 177, 0.35), 0 0 70px rgba(123, 107, 177, 0.15)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        neonPulse: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(123,107,177,0.25), 0 0 40px rgba(123,107,177,0.15), 0 0 60px rgba(123,107,177,0.08)',
            borderColor: 'rgba(123,107,177,0.6)',
          },
          '50%': {
            boxShadow: '0 0 25px rgba(123,107,177,0.35), 0 0 50px rgba(123,107,177,0.22), 0 0 80px rgba(123,107,177,0.12)',
            borderColor: 'rgba(123,107,177,0.8)',
          },
        },
        // Migrated Keyframes
        cardFloat: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-6px) rotate(0.3deg)' },
          '50%': { transform: 'translateY(-10px) rotate(0deg)' },
          '75%': { transform: 'translateY(-4px) rotate(-0.3deg)' },
        },
        cardBreathe: {
          '0%, 100%': {
            transform: 'scale(1)',
            boxShadow: '0 12px 50px rgba(0, 0, 0, 0.12), 0 6px 16px rgba(0, 0, 0, 0.08)',
          },
          '50%': {
            transform: 'scale(1.008)',
            boxShadow: '0 18px 60px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1)',
          },
        },
        premiumFloat: {
          '0%, 100%': {
            transform: 'translateY(0) scale(1)',
            boxShadow: '0 12px 50px rgba(0, 0, 0, 0.12), 0 6px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
          },
          '50%': {
            transform: 'translateY(-8px) scale(1.005)',
            boxShadow: '0 20px 70px rgba(0, 0, 0, 0.16), 0 10px 25px rgba(0, 0, 0, 0.1), 0 0 30px rgba(123, 107, 177, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
          },
        },
        ambientPulse: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
        ambientBreath: {
          '0%, 100%': { opacity: '0.5', transform: 'translate(-50%, -50%) scale(1)' },
          '50%': { opacity: '1', transform: 'translate(-50%, -50%) scale(1.15)' },
        },
        meshFloat: {
          '0%, 100%': {
            background: 'radial-gradient(ellipse 80% 50% at 20% 20%, rgba(107, 91, 161, 0.035) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139, 125, 193, 0.025) 0%, transparent 50%), radial-gradient(ellipse 50% 60% at 60% 30%, rgba(99, 83, 153, 0.02) 0%, transparent 50%)',
          },
          '33%': {
            background: 'radial-gradient(ellipse 70% 60% at 30% 40%, rgba(107, 91, 161, 0.04) 0%, transparent 50%), radial-gradient(ellipse 50% 50% at 70% 60%, rgba(139, 125, 193, 0.028) 0%, transparent 50%), radial-gradient(ellipse 60% 50% at 40% 80%, rgba(99, 83, 153, 0.018) 0%, transparent 50%)',
          },
          '66%': {
            background: 'radial-gradient(ellipse 60% 70% at 70% 30%, rgba(107, 91, 161, 0.038) 0%, transparent 50%), radial-gradient(ellipse 70% 45% at 30% 70%, rgba(139, 125, 193, 0.025) 0%, transparent 50%), radial-gradient(ellipse 55% 55% at 80% 50%, rgba(99, 83, 153, 0.02) 0%, transparent 50%)',
          },
        },
        flowGradient: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(33.33%)' },
        },
        spotlightMove: {
          '0%': { top: '-20%', left: '-10%' },
          '25%': { top: '10%', left: '70%' },
          '50%': { top: '60%', left: '80%' },
          '75%': { top: '70%', left: '20%' },
          '100%': { top: '-20%', left: '-10%' },
        },
        shineDiagonal: {
          '0%': { transform: 'translateX(-30%) translateY(-30%)' },
          '100%': { transform: 'translateX(30%) translateY(30%)' },
        },
        particleFloat1: {
          '0%, 100%': { top: '20%', left: '10%', opacity: '0', transform: 'scale(0.5)' },
          '10%': { opacity: '0.15', transform: 'scale(1)' },
          '50%': { top: '50%', left: '60%', opacity: '0.12' },
          '90%': { opacity: '0.15', transform: 'scale(1)' },
          '100%': { top: '80%', left: '90%', opacity: '0', transform: 'scale(0.5)' },
        },
        particleFloat2: {
          '0%, 100%': { top: '70%', left: '80%', opacity: '0', transform: 'scale(0.5)' },
          '10%': { opacity: '0.14', transform: 'scale(1.2)' },
          '50%': { top: '40%', left: '30%', opacity: '0.1' },
          '90%': { opacity: '0.14', transform: 'scale(1.2)' },
          '100%': { top: '10%', left: '5%', opacity: '0', transform: 'scale(0.5)' },
        },
        auroraWave: {
          '0%, 100%': { transform: 'scaleY(1)', opacity: '0.7' },
          '50%': { transform: 'scaleY(1.2)', opacity: '1' },
        },
        vibrateBlur1: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.8' },
          '25%': { transform: 'translate(-3%, 5%) scale(1.05)', opacity: '0.9' },
          '50%': { transform: 'translate(-5%, 2%) scale(1.1)', opacity: '1' },
          '75%': { transform: 'translate(-2%, -3%) scale(1.03)', opacity: '0.85' },
        },
        vibrateBlur2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.7' },
          '33%': { transform: 'translate(5%, -5%) scale(1.08)', opacity: '0.9' },
          '66%': { transform: 'translate(3%, 3%) scale(1.05)', opacity: '0.8' },
        },
        vibrateBlur3: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: '0.6' },
          '50%': { transform: 'translate(-8%, 5%) scale(1.15) rotate(5deg)', opacity: '0.85' },
        },
        vibrateBlur4: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.65' },
          '40%': { transform: 'translate(4%, -6%) scale(1.1)', opacity: '0.8' },
          '70%': { transform: 'translate(-3%, -2%) scale(1.05)', opacity: '0.75' },
        },
      },
      transitionTimingFunction: {
        'premium-ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-in-expo': 'cubic-bezier(0.7, 0, 0.84, 0)',
      },
      maxWidth: {
        'container': '1440px',
        'container-tight': '1280px',
      },
      screens: {
        'mobile': { 'max': '639px' },
        'mobile-lg': { 'min': '640px', 'max': '767px' },
        'tablet': { 'min': '768px', 'max': '1023px' },
        'desktop': { 'min': '1024px', 'max': '1439px' },
        'desktop-lg': { 'min': '1440px' },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config
