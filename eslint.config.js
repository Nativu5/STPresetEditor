// eslint.config.js - Vue 3 + JS + Tailwind v4
import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import tailwind from 'eslint-plugin-tailwindcss';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  ...tailwind.configs['flat/recommended'],
  prettier,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
    },
    settings: {
      tailwindcss: {
        config: false,
      },
    },
    rules: {
      // 'tailwindcss/no-custom-classname': 'off',
    },
  },
];
