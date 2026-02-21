import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'electron-vite';

export default defineConfig({
  main: {
    entry: 'src/main/index.ts',
  },
  preload: {
    input: 'src/preload/index.ts',
  },
  renderer: {
    root: 'src/renderer',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/renderer'),
      },
    },
  },
});
