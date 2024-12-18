import { SignInButton, UserButton, useAuth } from '@clerk/clerk-react';
import { Spinner } from './Spinner';
import { Button } from './Button';

export function AuthButton() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <Spinner className="w-5 h-5" />;

  return isSignedIn ? (
    <UserButton
      afterSignOutUrl="/"
      appearance={{
        elements: {
          avatarBox: { width: '32px', height: '32px' },
          userButtonPopoverCard: {
            backgroundColor: '#2c2e33',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          userButtonPopoverText: { color: '#ffffff' },
        },
      }}
    />
  ) : (
    <SignInButton mode="modal">
      <Button variant="default">Sign in with GitHub</Button>
    </SignInButton>
  );
}
