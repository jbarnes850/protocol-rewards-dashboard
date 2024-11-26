import React from 'react';
import { Github, ExternalLink, Book, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-white/10 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/logo_rev.png" 
                alt="NEAR Protocol" 
                className="h-8 w-auto"
              />
              <span className="text-lg font-bold">Protocol Rewards</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Earn rewards by contributing to the NEAR ecosystem and help build the future of the open web.
            </p>
            <a 
              href="https://near.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-near-purple hover:text-near-purple/80 flex items-center gap-2"
            >
              Visit NEAR.org
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-medium mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://docs.near.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white flex items-center gap-2"
                >
                  <Book className="w-4 h-4" />
                  Documentation
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/near" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </li>
              <li>
                <Link 
                  to="/leaderboard"
                  className="text-sm text-gray-400 hover:text-white flex items-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  Contributors
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-medium mb-4">Community</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://near.org/blog" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white"
                >
                  Blog
                </a>
              </li>
              <li>
                <a 
                  href="https://near.org/discord" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white"
                >
                  Discord
                </a>
              </li>
              <li>
                <a 
                  href="https://twitter.com/nearprotocol" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 mt-8 border-t border-white/10">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} NEAR Protocol. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <Link to="/privacy" className="text-sm text-gray-400 hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-gray-400 hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 