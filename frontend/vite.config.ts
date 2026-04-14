import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true, // open browser on start
  },
  build: {
    outDir: 'build', // match CRA build folder name
  },
});
