// Tailwind v4 PostCSS plugin. Only CSS entries that `@import 'tailwindcss'`
// (currently the isolated UI pilot at src/styles/pilot.css) receive Tailwind
// output; existing CSS Modules / globals.css pass through unchanged.
const config = {
  plugins: {
    '@tailwindcss/postcss': {}
  }
};

export default config;
