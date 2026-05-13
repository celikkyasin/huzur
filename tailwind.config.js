/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        huzur: {
          cream: "#F8F4EA",
          paper: "#FFFDF8",
          emerald: "#075E47",
          sage: "#DDE9DE",
          mint: "#EAF4EE",
          gold: "#D7B35A",
          ink: "#1B2B29",
          muted: "#71807B"
        }
      }
    }
  },
  plugins: []
};
