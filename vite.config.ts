import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vercel from 'vite-plugin-vercel';

export default defineConfig({
  server: {
    port: process.env.PORT as unknown as number,
  },
  plugins: [react(), vercel()],
  vercel: {
    rewrites: [
      {
        source: "/api/(.*)",
        destination: "/api/$1"
      },
      {
        source: "/(.*)",
        destination: "/index.html"
      }
    ]
  },
  define: {
    'process.env': {},
  },
});