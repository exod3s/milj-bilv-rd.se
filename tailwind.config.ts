import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#fff9db",
          100: "#fff0a3",
          200: "#ffe066",
          300: "#ffd43b",
          400: "#fcc419",
          500: "#f5b800",
          600: "#f0b400",
          700: "#b78300",
          800: "#2a2720",
          900: "#171717",
          950: "#070707"
        },
        polish: {
          gold: "#ffd43b",
          mist: "#fff7cc",
          ink: "#101512"
        }
      },
      boxShadow: {
        soft: "0 20px 60px rgba(7, 7, 7, 0.14)"
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};

export default config;
