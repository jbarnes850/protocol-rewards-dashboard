import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { AuthCallback } from './pages/AuthCallback';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './providers/AuthProvider';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { SEO } from './components/SEO';
import { MetricsProvider } from './providers/MetricsProvider';
import { verifyDemoReadiness, logVerificationResults } from './lib/demo-verification';
import { toast } from 'sonner';

function App() {
  useEffect(() => {
    const verifyDemo = async () => {
      const results = await verifyDemoReadiness();
      logVerificationResults(results);

      if (!results.ready) {
        console.error('Demo verification failed. Please check the console for details.');
        toast.error('Demo environment needs configuration', {
          description: `${results.errors.length} issues found. Check console for details.`,
          duration: 5000,
        });
      } else {
        console.log('✅ Demo environment verified and ready!');
        toast.success('Demo environment ready!', {
          description: 'All systems verified and ready for demo.',
        });
      }
    };

    verifyDemo();
  }, []);

  return (
    <HelmetProvider>
      <SEO />
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <MetricsProvider>
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
            </MetricsProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;