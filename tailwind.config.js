/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This line ensures components folder is scanned
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}