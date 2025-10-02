/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/@lekoarts/gatsby-theme-cara/**/*.{js,jsx,ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Brand colors
      colors: {
        brand: {
          DEFAULT: "#0EA5E9",
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e0',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      // Font family
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        heading: ['"Poppins"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      // Shadows for buttons
      boxShadow: {
        lift: "0 6px 16px rgba(2,6,23,.10)",
        ring: "0 0 0 4px rgba(14, 165, 233, 0.35)",
      },
    },
  },
  plugins: [],
};
