module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'base': '15px',
      },
      maxWidth: {
        'content': '80rem'
      }
    },
  },
  plugins: [
    require("@tailwindcss/container-queries")
  ],
};