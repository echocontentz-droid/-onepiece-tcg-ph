import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cardhaus: {
          ink: "#0b0b0f",
          paper: "#fafaf7",
          accent: "#e63946",
          gold: "#d4a017",
        },
      },
      fontFamily: {
        display: ["ui-serif", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
