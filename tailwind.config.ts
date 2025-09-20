import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pump: {
          green: '#10b981',
          'green-light': '#34d399',
          'green-dark': '#059669',
          black: '#0a0a0a',
          'black-light': '#1a1a1a'
        }
      },
          keyframes: {
            flip: {
              '0%': { transform: 'rotateY(0deg) scale(1)' },
              '20%': { transform: 'rotateY(180deg) scale(1.2)' },
              '40%': { transform: 'rotateY(360deg) scale(1.3)' },
              '60%': { transform: 'rotateY(540deg) scale(1.3)' },
              '80%': { transform: 'rotateY(720deg) scale(1.2)' },
              '100%': { transform: 'rotateY(900deg) scale(1)' },
            },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(5deg)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
            flip: 'flip 3s ease-in-out',
        float: 'float 3s ease-in-out infinite',
        shimmer: 'shimmer 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
} satisfies Config;


