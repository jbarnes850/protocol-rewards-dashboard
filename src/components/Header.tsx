import { Sun, Moon, Share2 } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';
import { AuthButton } from './ui/AuthButton';
import { RepoDisplay } from './ui/RepoDisplay';

export function Header() {
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

            <div className="flex items-center gap-2 sm:gap-4">
              <RepoDisplay />
              <AuthButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
