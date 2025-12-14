/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#8B6F47',      // Warm brown
          secondary: '#5C4A3A',    // Dark brown
          accent: '#D4A574',       // Light tan/beige
          light: '#F5F1ED',        // Cream/off-white
          dark: '#3E2F23',         // Deep brown
        },
      },
    },
  },
  plugins: [],
};
