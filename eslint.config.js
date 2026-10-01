import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import svelteParser from 'svelte-eslint-parser';
import { defineConfig } from 'eslint/config';

// eslint is pinned to the newest 9.x, which is the ceiling: typescript-eslint
// and eslint-plugin-svelte both declare a peer range of `^8.57 || ^9`. The 9.x
// line carries an upstream "no longer supported" notice, but moving to 10 fails
// peer resolution until those two widen their ranges, so this pin is deliberate.
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
    // Tests look lessons up by id and index into arrays whose length the
    // schema already guarantees, so a non-null assertion there is a test
    // convenience rather than a runtime claim about unvalidated data. The
    // other three are the same kind of accommodation: a test asserts against
    // a value it just parsed, and the assertion is the point.
    files: ['tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    // Build and check scripts report their result on stdout; that is the point.
    files: ['scripts/**/*.ts', '*.config.ts', '*.config.js'],
    rules: { 'no-console': 'off' },
  },
);
