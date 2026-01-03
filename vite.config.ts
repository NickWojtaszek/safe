import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
            rewrite: (path) => path
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.ANTHROPIC_API_KEY': JSON.stringify(env.ANTHROPIC_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              // Split vendor libraries for better caching
              'vendor': ['react', 'react-dom'],
              // Split utilities as separate chunk
              'utils': ['crypto']
            }
          }
        },
        // Increase chunk size limit since we're using manual chunks
        chunkSizeWarningLimit: 1000
      }
    };
});

