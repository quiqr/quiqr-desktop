import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactYouMightNotNeedAnEffect from 'eslint-plugin-react-you-might-not-need-an-effect';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'react-you-might-not-need-an-effect': reactYouMightNotNeedAnEffect
    },
    rules: {
      ...reactYouMightNotNeedAnEffect.configs.recommended.rules,
      'no-console': 0,
      'no-async-promise-executor': 0,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      }
    }
  }
];
