/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:   '#26778D',  // Logo teal exact: RGB(38,119,141)
        secondary: '#1A5E72',  // Darker teal
        accent:    '#4DADC4',  // Lighter teal for highlights
        cream:     '#FCFBF7',  // Logo cream: RGB(252,251,247)
      },
      fontFamily: {
        sans:    ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        display: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}