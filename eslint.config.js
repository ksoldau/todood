import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  prettierConfig, // disable ESLint formatting rules
  {
    rules: {
      // custom rules can go here
    },
  },
];
