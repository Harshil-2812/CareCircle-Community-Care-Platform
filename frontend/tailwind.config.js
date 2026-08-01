/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c2d5ff',
          300: '#94b4ff',
          400: '#6089ff',
          500: '#3b5bff',
          600: '#2236f5',
          700: '#1a27e1',
          800: '#1c23b6',
          900: '#1c228f',
          950: '#111457',
        },
        accent: {
          400: '#f97316',
          500: '#ea6c0a',
        },
        rose: {
          400: '#fb7185',
          500: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      },
    },
  },
  plugins: [],
}
