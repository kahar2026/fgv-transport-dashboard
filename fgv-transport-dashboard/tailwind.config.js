/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fgv: {
          green: '#005A36',
          dark: '#0A251C',
          orange: '#FF6B00',
        }
      }
    },
  },
  plugins: [],
}