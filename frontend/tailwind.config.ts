import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1E3D',
          light: '#132a52',
          dark: '#061428',
        },
        orange: {
          DEFAULT: '#FF7A00',
          light: '#ff9a40',
          dark: '#e56d00',
        },
        sky: { DEFAULT: '#38BDF8', light: '#7DD3FC' },
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(11, 30, 61, 0.12)',
        premium: '0 20px 60px rgba(11, 30, 61, 0.15)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0B1E3D 0%, #132a52 50%, #1a3a6b 100%)',
        'orange-gradient': 'linear-gradient(135deg, #FF7A00 0%, #ff9a40 100%)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
