import { defineConfig } from 'vite';

export default defineConfig({
  root: './src/',
  publicDir: false,
  base: './',
  build: {
    outDir: '../www/',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        index: 'index.html'
      }
    }
  },
  server: {
    port: 3333,
    open: true
  }
});
