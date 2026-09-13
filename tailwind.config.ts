import type { Config } from "tailwindcss";

// Design direction: deep black/charcoal, matte gold accents, white, neutral grey,
// large premium typography, strong whitespace. See docs/architecture.md.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: "#0B0B0C",
          900: "#0B0B0C",
          800: "#141416",
          700: "#1E1E21",
        },
        gold: {
          DEFAULT: "#A8895A", // matte, not shiny/retail gold
          light: "#C7AE85",
          dark: "#7C6440",
        },
        stone: {
          50: "#FAFAF9",
          200: "#E7E5E4",
          400: "#A8A29E",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.2em",
      },
    },
  },
  plugins: [],
};

export default config;
