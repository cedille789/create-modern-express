/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{<%= view || "html" %>,css,js}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
