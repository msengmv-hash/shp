/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#e30613",
          ink: "#202124",
          muted: "#f4f5f6",
          line: "#e6e8eb",
        },
      },
      boxShadow: {
        soft: "0 10px 30px rgba(20, 26, 35, 0.08)",
      },
    },
  },
  plugins: [],
};
