/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          500: "#7C3AED",
          600: "#6D28D9",
          700: "#5B21B6"
        },
        bg: "#0F172A",
        panel: "#1E293B",
        panel2: "#0B1220"
      }
    }
  },
  plugins: []
}

