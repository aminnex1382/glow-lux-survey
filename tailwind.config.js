/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glow: {
          50: '#fff5f7',
          100: '#fde8ed',
          200: '#fbd0db',
          300: '#f7a8bd',
          400: '#f17599',
          500: '#e54576',
          600: '#d1295d',
          700: '#b01c49',
          800: '#921b40',
          900: '#7d1b3b',
          950: '#480a1d',
        },
        roseGold: {
          light: '#f7dcd5',
          DEFAULT: '#b76e79',
          dark: '#8b4b55',
          gold: '#c5a059',
          metallic: '#d4af37',
        },
        luxury: {
          bg: '#faf6f7',
          surface: '#ffffff',
          darkBg: '#1f161c',
          textDark: '#2c1e28',
          textMuted: '#6f5a67',
        }
      },
      fontFamily: {
        vazir: ['Vazirmatn', 'sans-serif'],
      },
      boxShadow: {
        'glow-soft': '0 10px 30px -5px rgba(229, 69, 118, 0.15), 0 4px 12px -2px rgba(183, 110, 121, 0.1)',
        'glow-hover': '0 15px 35px -5px rgba(229, 69, 118, 0.25), 0 8px 20px -3px rgba(183, 110, 121, 0.2)',
        'luxury-card': '0 20px 40px -15px rgba(60, 20, 45, 0.08), 0 0 0 1px rgba(230, 200, 210, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle': 'pulseSubtle 3s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
}
