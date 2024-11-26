import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { AuthCallback } from './pages/AuthCallback';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './providers/AuthProvider';
import { TooltipProvider } from '@radix-ui/react-tooltip';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
              <Header />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
              </Routes>
              <Toaster 
                position="top-right" 
                toastOptions={{
                  style: {
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(8px)',
                  },
                }}
              />
            </div>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;