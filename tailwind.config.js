/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./frontend/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'tech-blue': '#001A33',
        'coral': '#B4495A',
        'red-brand': '#C8102E',
      }
    },
  },
  plugins: [],
}
