import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        daylight: "#EEF3F4",
        paper: "#FFFFFF",
        ink: "#17242E",
        pine: "#1F5C57",
        marigold: "#D69A1E",
        madder: "#A9443B",
        dusk: "#6B6F9C",
        rule: "#C9D4D8",
        mist: "#DCE6E8",
      },
      fontFamily: {
        serif: ["Literata", "Georgia", "serif"],
        sans: ["Atkinson Hyperlegible", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
