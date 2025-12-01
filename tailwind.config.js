/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',
        surface: {
          1: 'hsl(var(--surface-1))',
          2: 'hsl(var(--surface-2))',
          3: 'hsl(var(--surface-3))',
        },
        accent: {
          blue: 'hsl(var(--accent-blue))',
          emerald: 'hsl(var(--accent-emerald))',
          amber: 'hsl(var(--accent-amber))',
          rose: 'hsl(var(--accent-rose))',
        },
        conformant: 'hsl(var(--conformant))',
        deviation: 'hsl(var(--deviation))',
        warning: 'hsl(var(--warning))',
        highlight: 'hsl(var(--highlight))',
      },
      fontFamily: {
        sans: ['DM Sans', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      spacing: {
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        6: '1.5rem',
        8: '2rem',
        12: '3rem',
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        elevated: '0 4px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
      },
      keyframes: {
        'count-up': {
          'from': {
            opacity: '0',
            transform: 'translateY(12px) scale(0.95)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0) scale(1)'
          },
        },
        'pulse-subtle': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(244, 63, 94, 0.3)'
          },
          '50%': {
            boxShadow: '0 0 0 6px rgba(244, 63, 94, 0)'
          },
        },
        'slide-in': {
          'from': {
            opacity: '0',
            transform: 'translateX(-12px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        'draw-line': {
          'to': { strokeDashoffset: '0' },
        },
      },
      animation: {
        'count-up': 'count-up 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'slide-in': 'slide-in 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'draw-line': 'draw-line 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}
