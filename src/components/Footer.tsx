import React from 'react';
import { Github, Twitter, Telegram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm mt-12">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <img 
              src="/logo_rev.png" 
              alt="NEAR Protocol" 
              className="h-6 w-auto"
            />
            <span className="text-sm text-gray-400">
              © {new Date().getFullYear()} NEAR Protocol
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <a 
              href="https://t.me/2339081220/1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-near-purple transition-colors"
            >
              <Telegram className="w-5 h-5" />
            </a>
            <a 
              href="https://twitter.com/nearprotocol"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-near-purple transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a 
              href="https://github.com/near"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-near-purple transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <a 
              href="https://near.org/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-near-purple transition-colors"
            >
              Privacy
            </a>
            <a 
              href="https://near.org/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-near-purple transition-colors"
            >
              Terms
            </a>
            <a 
              href="https://t.me/2339081220/1"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-near-purple transition-colors"
            >
              Community
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 