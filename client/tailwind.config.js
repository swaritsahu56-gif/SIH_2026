/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],

  theme: {
    extend: {
      colors: {
        leaf: {
          50: '#f2faf3',
          100: '#dff3e2',
          500: '#2c9a59',
          600: '#1d7a43',
          700: '#176237',
          900: '#0d3921'
        }
      },

      boxShadow: {
        card: '0 10px 30px rgba(23, 98, 55, .08)'
      }
    }
  },

  plugins: []
};