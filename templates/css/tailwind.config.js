/** @type {import('tailwindcss').Config} */
export default {
  content: ["./**/*.{<%= view || "html" %>,css,js}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
