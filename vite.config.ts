import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vercel from 'vite-plugin-vercel';
import type { ProxyOptions } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ExtendedProxyOptions extends ProxyOptions {
  configure?: (proxy: any, options: Record<string, any>) => void;
}

const config = {
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    cors: true,
    hmr: {
      clientPort: 443,
      host: 'github-oauth-dashboard-tunnel-zey7t2sj.devinapps.com'
    },
    proxy: {
      '/_api/github/oauth/test-errors': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy: any, _options: Record<string, any>) => {
          proxy.on('error', (err: Error, _req: IncomingMessage, _res: ServerResponse) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq: any, req: IncomingMessage, res: ServerResponse) => {
            console.log('Proxying:', req.method, req.url);
            if (req.url?.startsWith('/_api/github/oauth/test-errors')) {
              const vercelReq = {
                ...req,
                query: Object.fromEntries(new URLSearchParams(req.url.split('?')[1] || '')),
                body: {},
                method: req.method
              } as unknown as VercelRequest;

              const vercelRes = {
                status: (code: number) => {
                  res.statusCode = code;
                  return vercelRes;
                },
                json: (data: any) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return vercelRes;
                },
                redirect: (code: number, url: string) => {
                  res.statusCode = code;
                  res.setHeader('Location', url);
                  res.end();
                  return vercelRes;
                }
              } as unknown as VercelResponse;

              if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                  body += chunk.toString();
                });
                req.on('end', () => {
                  try {
                    vercelReq.body = JSON.parse(body);
                  } catch (error) {
                    console.error('Error parsing request body:', error);
                    vercelReq.body = {};
                  }
                  import('./_api/github/oauth/test-errors').then(module => {
                    module.default(vercelReq, vercelRes).catch((error: Error) => {
                      console.error('Test endpoint error:', error);
                      res.statusCode = 500;
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({
                        error: 'internal_server_error',
                        message: error.message
                      }));
                    });
                  });
                });
              } else {
                import('./_api/github/oauth/test-errors').then(module => {
                  module.default(vercelReq, vercelRes).catch((error: Error) => {
                    console.error('Test endpoint error:', error);
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      error: 'internal_server_error',
                      message: error.message
                    }));
                  });
                });
              }
              return true;
            }
          });
        }
      } as ExtendedProxyOptions,
      '/_api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy: any, _options: Record<string, any>) => {
          proxy.on('error', (err: Error) => {
            console.log('proxy error', err);
          });
        }
      }
    }
  },
  plugins: [react(), vercel()],
  vercel: {
    rewrites: [
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
    'process.env.VITE_GITHUB_CALLBACK_URL': JSON.stringify(process.env.VITE_GITHUB_CALLBACK_URL),
    'process.env.VITE_GITHUB_SCOPES': JSON.stringify(process.env.VITE_GITHUB_SCOPES),
  },
};

export default defineConfig(config);
