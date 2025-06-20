/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#e10600',
        dark: {
          bg: '#1a1a1a',
          card: '#2d2d2d',
          text: '#ffffff'
        }
      }
    },
  },
  plugins: [],
} 