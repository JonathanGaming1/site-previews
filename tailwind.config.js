/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/templates/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heebo: ["Heebo", "system-ui", "sans-serif"],
        frank: ["'Frank Ruhl Libre'", "Heebo", "serif"],
      },
    },
  },
  plugins: [],
};
