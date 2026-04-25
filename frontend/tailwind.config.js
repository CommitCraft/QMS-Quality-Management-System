/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        steel: {
          50: '#f4f7fa',
          100: '#e4eaf0',
          200: '#c9d3df',
          300: '#9fadc0',
          400: '#72839b',
          500: '#516176',
          600: '#3b4959',
          700: '#2b3642',
          800: '#1e2731',
          900: '#131a22',
          950: '#0b1016',
        },
        copper: {
          400: '#d99b6c',
          500: '#c27a47',
          600: '#a95f2b',
        },
        accent: {
          400: '#5dd6c4',
          500: '#29c7b0',
          600: '#17aa95',
        },
      },
      boxShadow: {
        panel: '0 20px 45px rgba(0, 0, 0, 0.25)',
      },
      backgroundImage: {
        'industrial-grid': 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        'steel-glow': 'radial-gradient(circle at top, rgba(89, 163, 255, 0.22), transparent 46%), radial-gradient(circle at bottom right, rgba(201, 147, 85, 0.14), transparent 35%)',
      },
      fontFamily: {
        display: ['"Segoe UI"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['"Segoe UI"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
