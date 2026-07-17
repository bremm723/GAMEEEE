/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        blush: {
          50: '#fff1f4',
          100: '#ffe1e8',
          200: '#ffc2d1',
          300: '#ff94ac',
          400: '#fd5c88',
          500: '#f5326a',
          600: '#e11955',
          700: '#bd1148',
          800: '#9d1142',
          900: '#86123e',
        },
        midnight: {
          800: '#1b1530',
          900: '#120d21',
        },
      },
      fontFamily: {
        display: ['"Poppins"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 25px rgba(245, 50, 106, 0.45)',
      },
    },
  },
  plugins: [],
};
