/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Tailwind blue-500
          600: '#2563eb', // Tailwind blue-600
          700: '#1d4ed8',
          800: '#1e40af', // Tailwind blue-800
          900: '#1e3a8a',
        },
        accent: {
          light: '#eff6ff',
          card: '#dbeafe',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
