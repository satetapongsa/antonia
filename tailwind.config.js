/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#030611',
          panel: 'rgba(10, 15, 36, 0.75)',
          border: 'rgba(0, 240, 255, 0.25)',
          cyan: '#00f0ff',
          green: '#39ff14',
          amber: '#ffaa00',
          red: '#ff0055',
          blue: '#1b347a',
          gray: '#1e293b'
        }
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
        sans: ['"Rajdhani"', 'sans-serif'],
        display: ['"Orbitron"', 'sans-serif']
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.4)',
        'neon-green': '0 0 15px rgba(57, 255, 20, 0.4)',
        'neon-red': '0 0 15px rgba(255, 0, 85, 0.4)',
        'neon-amber': '0 0 15px rgba(255, 170, 0, 0.4)'
      }
    },
  },
  plugins: [],
}
