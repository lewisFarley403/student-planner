/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Calm Base ---
        primary: {
          // Using Teal for a calm, focused feel
          DEFAULT: '#14B8A6', // teal-500
          dark: '#0D9488',    // teal-600 (for hover)
        },
        // --- Excitement Accents (for Gamification) ---
        accent: {
          DEFAULT: '#F59E0B', // amber-500 (Warm, positive)
          // Optional secondary accent if needed:
          // secondary: '#EC4899', // pink-500 (Vibrant, celebratory)
        }
      },
    },
  },
  plugins: [],
} 