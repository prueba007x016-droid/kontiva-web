/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        kontiva: {
          dark: '#030f36',
          navy: '#001637',
          blue: '#0160c7',
          'blue-light': '#09a5ec',
          green: '#0cb351',
          'green-light': '#68c90b',
          light: '#f4f8fc',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(1,22,55,0.06), 0 4px 12px rgba(1,22,55,0.05)',
        glow: '0 8px 30px rgba(12,179,81,0.18)',
      },
      backgroundImage: {
        'kontiva-gradient': 'linear-gradient(135deg, #030f36 0%, #0160c7 55%, #0cb351 100%)',
        'kontiva-soft': 'linear-gradient(135deg, #f4f8fc 0%, #e6f1fb 100%)',
      },
    },
  },
  plugins: [],
}