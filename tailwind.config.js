/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef1f6',
          100: '#d7deea',
          200: '#aebdd4',
          300: '#8397b8',
          400: '#5a7099',
          500: '#3d5478',
          600: '#2a3d5c',
          700: '#1c2c46',
          800: '#121f36',
          900: '#0B1B33',
          950: '#070f1e',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,27,51,0.04), 0 8px 24px -12px rgba(11,27,51,0.12)',
        soft: '0 4px 16px -4px rgba(11,27,51,0.08)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
