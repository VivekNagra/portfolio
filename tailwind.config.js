/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        muted: {
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
      },
      fontFamily: {
        script: ['"Dancing Script"', 'cursive'],
        body: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Arial'],
      },
      keyframes: {
        'bounce-in': {
          '0%': { transform: 'scale(.88)', opacity: '0' },
          '70%': { transform: 'scale(1.04)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 18px 60px hsl(var(--primary) / .30)' },
          '50%': { boxShadow: '0 26px 95px hsl(var(--primary) / .45)' },
        },
      },
      animation: {
        'bounce-in': 'bounce-in 600ms ease-out both',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}


