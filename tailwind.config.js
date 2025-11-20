/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  darkMode: "class", // 🔥 Required for theme switching

  safelist: [
    "theme-dark",
    "theme-light",
    "theme-amoled",
  ],

  theme: {
    extend: {
      animation: {
        fadeUp: "fadeUp 0.25s ease-out backwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      }
    },
  },

  plugins: [],
};
