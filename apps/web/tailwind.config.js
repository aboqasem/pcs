const path = require('path');
const defaultTheme = require('tailwindcss/defaultTheme');
const { createGlobPatternsForDependencies } = require('@nrwl/react/tailwind');

/** @type {import("@types/tailwindcss/tailwind-config").TailwindConfig } */
module.exports = {
  purge: [
    path.join(__dirname, 'pages/**/*.{js,ts,jsx,tsx}'),
    path.join(__dirname, 'components/**/*.{js,ts,jsx,tsx}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  darkMode: false,
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
