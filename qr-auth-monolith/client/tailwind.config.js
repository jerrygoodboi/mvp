/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          light: '#2c3e50',
          DEFAULT: '#1a2a3a',
          dark: '#0f172a',
        },
        teal: {
          light: '#2dd4bf',
          DEFAULT: '#0d9488',
          dark: '#0f766e',
        }
      },
    },
  },
  plugins: [],
}
