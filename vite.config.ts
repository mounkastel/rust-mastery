import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

// GitHub Pages serves this project from https://<user>.github.io/rust-mastery/,
// so every emitted asset URL has to carry that prefix. Vite derives all of them
// from this one value; nothing in the source may hardcode a root-absolute path.
export default defineConfig({
  base: '/rust-mastery/',
  plugins: [svelte()],
  build: {
    target: 'es2022',
    modulePreload: { polyfill: false },
    reportCompressedSize: true,
  },
  server: { port: 5173 },
  preview: { port: 4173 },
});
