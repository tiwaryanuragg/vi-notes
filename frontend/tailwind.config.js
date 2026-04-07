/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "system-ui", "sans-serif"],
        display: ["Poppins", "Roboto", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#ecfdf7",
          100: "#d1fae9",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#0e8c6f",
          700: "#08664f",
          800: "#0c3c35",
          900: "#06281f",
        },
      },
      boxShadow: {
        soft: "0 16px 40px rgba(9, 32, 24, 0.12)",
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at 14% 8%, rgba(14, 140, 111, 0.24), transparent 42%), radial-gradient(circle at 88% 18%, rgba(217, 116, 43, 0.18), transparent 36%), linear-gradient(180deg, #f8fbf9 0%, #edf3ee 100%)",
      },
      keyframes: {
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        floatIn: "floatIn 240ms ease",
      },
    },
  },
  plugins: [],
};
