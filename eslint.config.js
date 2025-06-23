import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import prettierConfig from 'eslint-config-prettier';
import { fileURLToPath } from 'url'
import path from "path";
import {dirname} from 'path';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: path.resolve(__dirname, 'tsconfig.json'),
        sourceType: 'module',
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react: pluginReact,
      prettier: pluginPrettier,
      'simple-import-sort': pluginSimpleImportSort,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/no-unescaped-entities': 'off',
      'react/prop-types': 'off',
      'simple-import-sort/imports': 'error',
      'sort-imports': 'off',
      'import/order': 'off',
      'no-console': 'warn',
      'no-unused-vars': 'off',
      'semi': 'warn',
      'block-spacing': ['error', 'never'],
      'prettier/prettier': [
        'error',
        {
          printWidth: 100,
          singleQuote: true,
          trailingComma: 'es5',
          tabWidth: 2,
          endOfLine: 'auto',
        },
      ],
    },
    ignores: ['postcss.config.js', 'tailwind.config.ts'],

  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  prettierConfig,
];
