/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        // Custom minimalist palette (Apple-inspired)
        background: '#f8f9fa',
        sidebar: '#f5f5f7',
        accent: '#007aff',
        border: '#e5e5ea',
        text: '#1c1c1e',
      },
      width: {
        sidebar: '260px',
      },
    },
  },
  plugins: [],
};
