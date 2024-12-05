import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Code, Rocket, ExternalLink, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip } from './ui/Tooltip';

const codeExamples = {
  install: `npx near-protocol-rewards init`,
  configure: `# .github/workflows/near-rewards.yml

name: NEAR Protocol Rewards Tracking
on:
  schedule:
    - cron: '*/5 * * * *'  # Adjust this for different frequency
  workflow_dispatch:
  push:
    branches: [ main ]

jobs:
  track-metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Run Metrics Collection
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          GITHUB_REPO: \${{ github.repository }}
        run: npx near-protocol-rewards track`,
  deploy: `# Your metrics will start being collected automatically!
# View them at https://protocol-rewards-dashboard.vercel.app/

# Need more control? Use the SDK:
import { NEARProtocolRewardsSDK } from 'near-protocol-rewards';

const sdk = new NEARProtocolRewardsSDK({
  githubRepo: 'your-org/repo',
  githubToken: process.env.GITHUB_TOKEN
});`
};

export function GetStartedCard() {
  const [activeStep, setActiveStep] = useState<'install' | 'configure' | 'deploy'>('install');
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(codeExamples[activeStep]);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="dashboard-card">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-near-purple/20 rounded-lg">
              <Terminal className="w-6 h-6 text-near-purple" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">Get Started with Protocol Rewards</h2>
                <span className="px-2 py-0.5 text-xs bg-near-purple/20 text-near-purple rounded-full">
                  Beta
                </span>
              </div>
              <p className="text-gray-400 mt-1">
                Track your contributions, earn rewards, and become part of the NEAR ecosystem
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex space-x-2 mb-4">
            <Tooltip content="Initialize rewards tracking">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveStep('install')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  activeStep === 'install' 
                    ? 'bg-near-purple text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span className="text-sm font-medium">1. Initialize</span>
              </motion.button>
            </Tooltip>

            <Tooltip content="View GitHub Actions workflow">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveStep('configure')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  activeStep === 'configure'
                    ? 'bg-near-purple text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Code className="w-4 h-4" />
                <span className="text-sm font-medium">2. Workflow</span>
              </motion.button>
            </Tooltip>

            <Tooltip content="View advanced SDK usage">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveStep('deploy')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  activeStep === 'deploy'
                    ? 'bg-near-purple text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Rocket className="w-4 h-4" />
                <span className="text-sm font-medium">3. Advanced</span>
              </motion.button>
            </Tooltip>
          </div>

          <div className="relative mt-4">
            <pre className="bg-black/20 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <code className={`language-${activeStep === 'install' ? 'bash' : 'typescript'} hljs`}>
                {codeExamples[activeStep]}
              </code>
            </pre>
            <button
              onClick={handleCopy}
              className="absolute right-3 top-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 
                       text-gray-400 hover:text-white transition-colors"
            >
              {copying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : copied ? (
                <CheckCircle className="w-4 h-4 text-near-green" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/10">
            <a
              href="https://github.com/near/protocol-rewards"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-near-purple transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View on GitHub
            </a>
            <a
              href="https://docs.near.org/protocol-rewards"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-near-purple transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}