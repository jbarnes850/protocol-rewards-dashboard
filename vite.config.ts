import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vercel from 'vite-plugin-vercel';

const config = {
  server: {
    port: process.env.PORT as unknown as number || 5173,
    host: true,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, '/_api'),
        secure: false
      },
      '/_api': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [react(), vercel()],
  vercel: {
    rewrites: [
      {
        source: "/api/(.*)",
        destination: "/_api/$1"
      },
      {
        source: "/(.*)",
        destination: "/index.html"
      }
    ]
  },
  define: {
    'process.env.VITE_GITHUB_CLIENT_ID': JSON.stringify(process.env.VITE_GITHUB_CLIENT_ID),
    'process.env.VITE_GITHUB_API_URL': JSON.stringify(process.env.VITE_GITHUB_API_URL),
    'process.env.VITE_GITHUB_ORG': JSON.stringify(process.env.VITE_GITHUB_ORG),
  },
};

export default defineConfig(config);
