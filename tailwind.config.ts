import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        candy: {
          pink: "#FFB6C1",
          rose: "#FF69B4",
          lavender: "#E6E6FA",
          mint: "#B0E0E6",
          lemon: "#FFFACD",
          peach: "#FFDAB9",
          sky: "#87CEEB",
          purple: "#DDA0DD"
        }
      },
      boxShadow: {
        'drop-gloss': '0 8px 16px -2px rgba(255, 105, 180, 0.25), inset 0 2px 4px rgba(255, 255, 255, 0.8), inset 0 -3px 6px rgba(0, 0, 0, 0.08)',
        'drop-sticker': '0 10px 20px -3px rgba(0, 0, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.05), inset 0 3px 5px rgba(255, 255, 255, 0.9), inset 0 -3px 5px rgba(0, 0, 0, 0.12)',
        'drop-glow': '0 0 15px rgba(255, 182, 193, 0.6), inset 0 1px 3px rgba(255, 255, 255, 0.9)',
      },
      backgroundImage: {
        'gloss-overlay': 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.2) 45%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.4) 100%)',
      }
    },
  },
  plugins: [],
};

export default config;
