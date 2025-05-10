/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#1a1a1a',
          '100': 'rgba(0, 0, 0, 0.8)',
          '200': 'rgba(0, 0, 0, 0.85)',
          '300': 'rgba(0, 0, 0, 0.9)',
          '400': 'rgba(20, 20, 20, 0.9)',
          '500': 'rgba(25, 25, 25, 0.85)',
          '600': 'rgba(25, 25, 25, 0.95)',
          '700': 'rgba(30, 30, 30, 0.95)',
          '800': 'rgba(30, 30, 30, 0.98)',
          '900': 'rgba(15, 15, 15, 0.97)',
        },
        gold: {
          DEFAULT: '#ffd700',
          light: 'rgba(255, 215, 0, 0.3)',
          lighter: 'rgba(255, 215, 0, 0.25)',
          dark: 'rgba(255, 215, 0, 0.4)',
        },
      },
      boxShadow: {
        'menu': '0 10px 40px rgba(0, 0, 0, 0.4)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.1)',
        'button': '0 4px 15px rgba(0, 0, 0, 0.25)',
        'button-hover': '0 6px 20px rgba(0, 0, 0, 0.35)',
        'value': '0 2px 5px rgba(0, 0, 0, 0.1)',
        'popup': '0 4px 20px rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '5px',
        md: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '15px',
      },
    },
  },
  plugins: [],
} 