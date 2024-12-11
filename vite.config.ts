import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vercel from 'vite-plugin-vercel';
import type { ProxyOptions } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

interface ExtendedProxyOptions extends ProxyOptions {
  configure?: (proxy: any, options: Record<string, any>) => void;
}

const config = {
  server: {
    port: process.env.PORT as unknown as number || 5173,
    host: true,
    strictPort: true,
    proxy: {
      '/_api/github/oauth/test-errors': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        secure: false,
        configure: (proxy: any, _options: Record<string, any>) => {
          proxy.on('error', (err: Error, _req: IncomingMessage, _res: ServerResponse) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq: any, req: IncomingMessage) => {
            console.log('Proxying:', req.method, req.url);
          });
        }
      } as ExtendedProxyOptions,
      '/api': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, '/_api'),
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
