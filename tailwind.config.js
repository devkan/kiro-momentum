/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Safelist classes that are dynamically generated
  safelist: [
    'animate-glitch',
    'animate-flicker',
    'animate-pulse-red',
    'glitch-text',
    'crt-scanlines',
  ],
  theme: {
    extend: {
      fontFamily: {
        'peaceful': ['Roboto', 'sans-serif'],
        'horror': ['Creepster', 'cursive'],
        'nightmare': ['Nosifer', 'cursive'],
      },
      colors: {
        'nightmare-red': '#8B0000',
        'glitch-gray': '#4A4A4A',
      },
      animation: {
        'glitch': 'glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite',
        'flicker': 'flicker 0.15s infinite',
        'pulse-red': 'pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'pulse-red': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
      },
      backdropBlur: {
        'horror': '8px',
      },
      backgroundImage: {
        'vignette-red': 'radial-gradient(ellipse at center, transparent 0%, rgba(139, 0, 0, 0.7) 100%)',
      },
    },
  },
  plugins: [],
}
