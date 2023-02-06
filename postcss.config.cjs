const postcssImport = require('postcss-import');
const postcssNesting = require('postcss-nesting');
const postcssPresetEnv = require('postcss-preset-env');
const tailwindcss = require('tailwindcss');
const tailwindcssNesting = require('tailwindcss/nesting');
const youdeyiwuMp = require('@youdeyiwu/postcss-plugin-mp');

module.exports = {
  plugins: [
    postcssImport,
    tailwindcssNesting(postcssNesting),
    tailwindcss,
    youdeyiwuMp({
      rootSelectorReplace: [{ find: '*,', replace: 'page,view,text,image' }],
    }),
    postcssPresetEnv({
      features: {
        'nesting-rules': false,
      },
    }),
  ],
};
