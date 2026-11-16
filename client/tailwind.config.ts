import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Each name points at a CSS variable in styles/index.css (single source of truth)
      colors: {
        espresso: "var(--color-espresso)",
        cocoa: "var(--color-cocoa)",
        ivory: "var(--color-ivory)",
        sand: "var(--color-sand)",
        gold: "var(--color-gold)",
        "gold-light": "var(--color-gold-light)",
        "gold-deep": "var(--color-gold-deep)",
      },
      fontFamily: {
        // "sans" is Tailwind's default, so plain text uses Hanken Grotesk automatically
        sans: ['"Hanken Grotesk"', "system-ui", "sans-serif"],
        display: ['"Bodoni Moda"', "Georgia", "serif"],
      },
      backgroundImage: {
        foil: "var(--foil)",
      },
    },
  },
  plugins: [],
} satisfies Config;