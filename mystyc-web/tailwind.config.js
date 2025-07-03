module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        'content': '80rem'
      }
    },
  },
  plugins: [
    require("@tailwindcss/container-queries")
  ],
};