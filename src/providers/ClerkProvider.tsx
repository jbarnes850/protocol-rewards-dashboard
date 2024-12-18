import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import React from 'react';

interface CustomClerkProviderProps {
  children: React.ReactNode;
}

export function CustomClerkProvider({ children }: CustomClerkProviderProps) {
  return (
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      signInUrl={import.meta.env.VITE_CLERK_SIGN_IN_URL}
      signUpUrl={import.meta.env.VITE_CLERK_SIGN_UP_URL}
      afterSignInUrl={import.meta.env.VITE_CLERK_AFTER_SIGN_IN_URL}
      afterSignUpUrl={import.meta.env.VITE_CLERK_AFTER_SIGN_UP_URL}
      redirectUrl={import.meta.env.VITE_CLERK_OAUTH_CALLBACK_URL}
      appearance={{
        baseTheme: dark,
        elements: {
          rootBox: {
            backgroundColor: '#1a1b1e',
          },
          card: {
            backgroundColor: '#2c2e33',
            color: '#ffffff',
          },
          formButtonPrimary: {
            backgroundColor: '#885FFF',
            color: '#ffffff',
          },
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
