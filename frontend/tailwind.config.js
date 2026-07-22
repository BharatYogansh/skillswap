/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EEF1EC",
        "paper-dim": "#E2E7DF",
        ink: "#16292B",
        "ink-soft": "#3C5254",
        gold: "#C99A3B",
        "gold-dim": "#E7D3A3",
        rust: "#A83B2E",
      },
      fontFamily: {
        display: ["'Bricolage Grotesque'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      backgroundImage: {
        ticket:
          "repeating-linear-gradient(to bottom, transparent, transparent 5px, currentColor 5px, currentColor 9px)",
      },
    },
  },
  plugins: [],
};
