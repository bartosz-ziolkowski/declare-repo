/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors"); 

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          ...colors.green, 
          DEFAULT: "#59705b", 
          custom: "#59705b", 
        },
        yellow: {
          ...colors.yellow,
          DEFAULT: "#efbf0e",
          custom: "#efbf0e",
        },
        blue: {
          ...colors.blue,
          DEFAULT: "#2F64F1",
          custom: "#2F64F1",
        },
        beige: {
          DEFAULT: "#E2E3DB", 
        },
        indigo: {
          ...colors.indigo,
          DEFAULT: "#560591",
          custom: "#560591",
        },
        orange: {
          ...colors.orange,
          DEFAULT: "#FFA500",
          custom: "#FFA500",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "Arial", "Helvetica", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
