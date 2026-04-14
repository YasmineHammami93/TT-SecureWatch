/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        foreground: '#0f172a',
        card: '#ffffff',
        'card-foreground': '#0f172a',
        primary: {
          DEFAULT: '#1d4ed8',
          foreground: '#ffffff',
          light: '#3b82f6',
        },
      },
    },
  },
  plugins: [],
}
