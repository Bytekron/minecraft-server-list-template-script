/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        'primary-dark': '#111212',
        'secondary-dark': '#1A1C1D',
        'discord-blue': '#5865F2',
        'light-blue': '#7289DA',
        'alert-red': '#E33B3B',
        'white': '#FFFFFF',
        'light-gray': '#D0D0D0',
        'mid-gray': '#7A7A7A',
        'grass-green': '#5865F2',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      backdropBlur: {
        'xs': '2px',
      },
      letterSpacing: {
        'widest': '0.2em',
      },
      scale: {
        '102': '1.02',
        '105': '1.05',
        '110': '1.1',
      },
      boxShadow: {
        'green': '0 0 20px rgba(60, 206, 60, 0.3)',
        'red': '0 0 20px rgba(227, 59, 59, 0.3)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};