const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        hud: {
          bg: '#09090b',
          surface: 'rgba(24, 24, 27, 0.7)',
          border: 'rgba(255, 255, 255, 0.1)',
          primary: '#6366f1',
          'primary-hover': '#4f46e5',
          text: {
            primary: '#f8fafc',
            secondary: '#94a3b8',
          },
          glow: 'rgba(99, 102, 241, 0.15)'
        },
      },
      backgroundImage: {
        'noise': "url('https://grainy-gradients.vercel.app/noise.svg')",
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'blob': 'blob 20s infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    // NEW: simple plugin to add animation delays
    plugin(function({ matchUtilities, theme }) {
      matchUtilities(
        {
          'animation-delay': (value) => ({
            'animation-delay': value,
          }),
        },
        { values: theme('transitionDelay') }
      )
    }),
  ],
}