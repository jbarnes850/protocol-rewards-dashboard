import { Sun, Moon, Github, LogOut, Share2, XCircle } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';

export function Header() {
  const { user, loginWithGitHub, logout, loading, isGitHubConnected, error } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const shareProgress = () => {
    const tweetText = `🚀 Contributing to @NEARProtocol ecosystem!\n\n` +
      `Join us in building the future of web3! 🌐\n\n` +
      `#NEAR #Web3 #BUIDLers`;

    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`,
      '_blank'
    );
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <img
              src="/logo_rev.png"
              alt="NEAR Protocol"
              className="h-8 w-auto"
            />
            <span className="text-lg sm:text-xl font-bold text-white hidden sm:inline">Protocol Rewards</span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {error && (
              <div className="absolute top-20 right-4 bg-destructive/90 text-white px-4 py-2 rounded-lg shadow-lg">
                <XCircle className="inline-block mr-2 h-4 w-4" />
                {error}
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-white" />
              ) : (
                <Moon className="w-5 h-5 text-white" />
              )}
            </button>

            <button
              onClick={shareProgress}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5
                       bg-near-purple/10 text-near-purple rounded-lg
                       hover:bg-near-purple/20 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Share</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 sm:gap-4">
                {user.trackedRepository && (
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5
                              bg-near-purple/5 border border-near-purple/10 rounded-lg">
                    <Github className="w-4 h-4 text-near-purple" />
                    <span className="text-sm text-near-purple font-medium">
                      {user.trackedRepository.name}
                    </span>
                  </div>
                )}

                <div className="hidden sm:flex items-center gap-2">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full ring-2 ring-near-purple/20"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{user.name}</span>
                    {isGitHubConnected && (
                      <div className="flex items-center gap-1">
                        <Github className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{user.githubUsername}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner className="w-5 h-5 text-white" />
                  ) : (
                    <LogOut className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            ) : (
              <Button
                onClick={loginWithGitHub}
                disabled={loading}
                variant={error ? "destructive" : "default"}
                className="flex items-center gap-2"
                aria-label={loading ? 'Connecting to GitHub...' : 'Connect GitHub'}
              >
                {loading ? (
                  <>
                    <Spinner className="w-4 h-4" />
                    <span className="hidden sm:inline">Connecting...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4" />
                    <span className="hidden sm:inline">Connect GitHub</span>
                    <span className="sm:hidden">Connect</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
