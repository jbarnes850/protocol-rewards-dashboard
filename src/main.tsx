import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Validate environment variables at startup
function validateEnvironment() {
  // Only validate in production
  if (import.meta.env.PROD) {
    const requiredVars = {
      VITE_CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
      VITE_GITHUB_API_URL: import.meta.env.VITE_GITHUB_API_URL,
      VITE_GITHUB_SCOPES: import.meta.env.VITE_GITHUB_SCOPES,
      VITE_GITHUB_ORG: import.meta.env.VITE_GITHUB_ORG,
    };

    const errors = Object.entries(requiredVars)
      .filter(([, value]) => !value)
      .map(([key]) => `Missing required environment variable: ${key}`);

    if (errors.length > 0) {
      console.error(`Environment configuration errors:\n${errors.join('\n')}`);
      // In production, we might want to show a user-friendly error UI instead of throwing
      return false;
    }
  }
  return true;
}

// Validate environment before rendering
validateEnvironment();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
