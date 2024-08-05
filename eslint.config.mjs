import globals from 'globals';
import pluginJs from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  { files: ['**/*.{js,mjs,cjs}'] },
  {
    languageOptions: {
      parserOptions: { ecmaVersion: 2021, sourceType: 'module' },
      globals: globals.node,
    },
  },
  pluginJs.configs.recommended,
  prettierConfig,
  {
    plugins: { prettier: prettierPlugin },
    rules: { 'prettier/prettier': 'error' },
    'linebreak-style': ['error', 'unix'], // 또는 'windows'
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.min.js',
      '*.log',
      '*.env',
      '*.env.*',
      'tmp/**',
      'temp/**',
    ],
  },
];
