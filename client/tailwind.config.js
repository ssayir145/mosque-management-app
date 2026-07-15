/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f3f7f4',
          100: '#e2ece4',
          200: '#c6d9cb',
          300: '#9fbfa8',
          400: '#729d7f',
          500: '#4f7f5e',
          600: '#3c6549',
          700: '#31513c',
          800: '#294232',
          900: '#22372a',
          950: '#111e16',
        },
        gold: {
          50: '#fdf9ee',
          100: '#faf0cd',
          200: '#f4de9b',
          300: '#edc65f',
          400: '#e5ac37',
          500: '#d3901f',
          600: '#b47019',
          700: '#8f5218',
          800: '#75421a',
          900: '#63381a',
          950: '#391d0c',
        },
        ink: {
          50: '#f2f5f7',
          100: '#e1e8ec',
          200: '#c4d1da',
          300: '#9bb0bf',
          400: '#6c899e',
          500: '#516d81',
          600: '#43596c',
          700: '#394958',
          800: '#25313c',
          900: '#182027',
          950: '#0c1216',
        },
        ivory: '#fbf8f1',
      },
      fontFamily: {
        display: ['"Amiri"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'geo-pattern': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%234f7f5e' stroke-opacity='0.08'%3E%3Cpath d='M30 0l30 30-30 30L0 30z'/%3E%3Cpath d='M30 10l20 20-20 20-20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
