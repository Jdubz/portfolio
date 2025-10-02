/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/@lekoarts/gatsby-theme-cara/**/*.{js,jsx,ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#0ea5e9" }, // your blue
      },
      borderRadius: {
        md: "10px",
        xl: "16px",
      },
      boxShadow: {
        lift: "0 4px 12px rgba(2,6,23,.10)",
        liftLg: "0 8px 24px rgba(2,6,23,.12)",
      },
    },
  },
  plugins: [],
};
