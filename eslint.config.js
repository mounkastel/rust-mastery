import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import svelteParser from 'svelte-eslint-parser';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'public/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...svelte.configs['flat/recommended'],
  prettier,
  ...svelte.configs['flat/prettier'],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        projectService: { allowDefaultProject: ['*.js'] },
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.svelte', '.svelte.ts'],
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      // Numbers and strings in template literals are exactly what they are for;
      // the rule's defaults reject them, which is noise in formatting code.
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true, allowNullish: false },
      ],
      'prefer-const': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  {
    // The svelte parser has to be re-declared after the typescript-eslint
    // configs, which otherwise hand .svelte files to the TypeScript parser and
    // fail on `<script lang="ts">`.
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: { parser: tseslint.parser, projectService: true },
    },
    rules: {
      // {@render} is typed as returning void, which this rule reads as a
      // mistake wherever a snippet is rendered inside an element. That is the
      // normal Svelte 5 idiom and is how the markup below is written.
      '@typescript-eslint/no-confusing-void-expression': 'off',
    },
  },
  {
    // Svelte 5's reactive-store convention is a `.svelte.ts` module. It is a
    // plain TypeScript file, so the svelte parser must not claim it: its
    // `**/*.svelte` glob also matches `store.svelte.ts`.
    files: ['**/*.svelte.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { projectService: true, extraFileExtensions: ['.svelte', '.svelte.ts'] },
    },
  },
  {
    // Tests read the curriculum by id and index into arrays whose length the
    // schema already guarantees. A non-null assertion there is a test
    // convenience, not a runtime claim about unvalidated data.
    files: ['tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['scripts/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['*.config.ts', '*.config.js'],
    rules: { 'no-console': 'off' },
  },
);
