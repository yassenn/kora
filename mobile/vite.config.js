import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'tsx',
    include: /.*\.[tj]sx?$/,
    exclude: [],
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: ['.web.tsx', '.tsx', '.web.ts', '.ts', '.web.jsx', '.jsx', '.web.js', '.js', '.json']
  },
  define: {
    __DEV__: process.env.NODE_ENV !== 'production' || true,
    global: 'window',
  },
  optimizeDeps: {
    exclude: ['react-native-date-picker'],
    esbuildOptions: {
      resolveExtensions: ['.web.tsx', '.tsx', '.web.ts', '.ts', '.web.jsx', '.jsx', '.web.js', '.js', '.json'],
      loader: {
        '.js': 'jsx',
      },
    }
  }
});