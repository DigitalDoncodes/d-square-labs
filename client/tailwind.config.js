/** @type {import('tailwindcss').Config} */

// ── DATAD design tokens ──────────────────────────────────────────────
// One neutral scale drives the whole product. Dark theme first:
//   gray-950  #0B0D10  app background
//   gray-900  #181C22  card / raised surface
//   gray-800  #242830  hairline borders, hover surfaces (≈ white @ 6% on card)
//   gray-400  #9AA4B2  secondary text
//   gray-100  #F4F6F9  primary text
// The light range mirrors the same cool cast so both themes feel related.
// Accents carry meaning only: indigo = action, emerald = success,
// amber = warning, rose = danger. Nothing else is colored.
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          50: '#F7F8FA',
          100: '#F4F6F9',
          200: '#E4E7EC',
          300: '#C4CBD4',
          400: '#9AA4B2',
          500: '#67717F',
          600: '#4E5866',
          700: '#39404B',
          800: '#242830',
          900: '#181C22',
          950: '#0B0D10',
        },
        surface: '#13161B',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
