const aspectRatio = require('@tailwindcss/aspect-ratio');
const containerQueries = require('@tailwindcss/container-queries');
const forms = require('@tailwindcss/forms');
const lineClamp = require('@tailwindcss/line-clamp');
const typography = require('@tailwindcss/typography');
const plugin = require('tailwindcss/plugin');

/** @type {import("tailwindcss").Config} */
module.exports = {
  separator: '_',
  theme: {
    extend: {},
  },
  content: ['./miniprogram/**/*.{html,wxml,vue,js,ts,jsx,tsx}'],
  plugins: [
    aspectRatio,
    containerQueries,
    forms,
    lineClamp,
    typography,
    plugin(({ addComponents }) => {
      addComponents({
        '.yw-bg': {
          background: '#f3f4f6',
        },
      });
    }),
  ],
};
