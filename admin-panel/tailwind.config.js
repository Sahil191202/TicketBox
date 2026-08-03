/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        deepPurple: '#1a0533',
        electricViolet: '#7c3aed',
        hotPink: '#ec4899',
        amber: '#f59e0b',
      },
    },
  },
  plugins: [],
}
