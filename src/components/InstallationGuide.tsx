import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/Button';
import { Terminal, Copy, ExternalLink, Github } from 'lucide-react';
import { toast } from 'sonner';

export function InstallationGuide() {
  const installCommand = import.meta.env.VITE_INSTALLATION_COMMAND;
  const docsUrl = import.meta.env.VITE_DOCS_URL;

  const copyCommand = () => {
    navigator.clipboard.writeText(installCommand);
    toast.success('Command copied to clipboard');
  };

  return (
    <Card className="border border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          Quick Start Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Installation Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Installation</h3>
          <p className="text-gray-400">One command is all you need:</p>
          
          <div className="relative">
            <pre className="bg-black/50 p-4 rounded-lg font-mono text-sm">
              {installCommand}
            </pre>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={copyCommand}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* What Happens Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">What Happens Next?</h3>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-start gap-2">
              <Github className="w-4 h-4 mt-1 shrink-0" />
              Creates a GitHub Actions workflow file
            </li>
            <li className="flex items-start gap-2">
              <Terminal className="w-4 h-4 mt-1 shrink-0" />
              Configures automatic metrics collection
            </li>
            <li className="flex items-start gap-2">
              <ExternalLink className="w-4 h-4 mt-1 shrink-0" />
              Sets up your repository for rewards tracking
            </li>
          </ul>
        </div>

        {/* Next Steps Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Next Steps</h3>
          <ol className="list-decimal list-inside space-y-3 text-gray-400">
            <li>Your metrics will start being collected automatically</li>
            <li>Initial data will appear within 5-10 minutes</li>
            <li>Full historical data will be available within 24 hours</li>
          </ol>
        </div>

        {/* Documentation Link */}
        <div className="pt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(docsUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Full Documentation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 