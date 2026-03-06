/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        matrix: {
          light: '#b3ffb3',
          DEFAULT: '#00FF41',
          dark: '#008F11',
          bg: '#030303'
        },
        neon: {
          blue: '#00F0FF',
          cyan: '#00FFFF',
          red: '#FF0055',
          purple: '#8b5cf6'
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 4s linear infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite alternate',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%': { filter: 'drop-shadow(0 0 5px rgba(0, 240, 255, 0.5))' },
          '100%': { filter: 'drop-shadow(0 0 15px rgba(0, 240, 255, 0.9))' },
        }
      }
    }
  },
  plugins: [],
}
