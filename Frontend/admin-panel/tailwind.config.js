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
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ticketFly: {
          '0%': { opacity: '1', transform: 'translateY(100vh) rotate(0deg)' },
          '100%': { opacity: '0', transform: 'translateY(-100vh) rotate(720deg)' },
        }
      },
      animation: {
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'ticket-fly': 'ticketFly 2.5s ease-out forwards',
      }
    },
  },
  plugins: [],
}
