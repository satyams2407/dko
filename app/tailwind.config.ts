import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f8ef",
          100: "#e6f0d7",
          200: "#cde0ad",
          300: "#afcc7d",
          400: "#8ab14a",
          500: "#6e9630",
          600: "#587825",
          700: "#445d1d",
          800: "#384b1a",
          900: "#2f3f18"
        }
      }
    }
  },
  plugins: []
};

export default config;

