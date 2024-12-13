import { useState } from 'react';
import { GitHubAuth } from '../lib/github-auth';
import { Button } from './ui/Button';

/// <reference types="vite/client" />

const ERROR_SCENARIOS = [
  'success',
  'expired_state',
  'invalid_token',
  'network_error',
  'scope_denied'
] as const;

type ErrorScenario = typeof ERROR_SCENARIOS[number];

export function TestErrorScenarios() {
  const [currentError, setCurrentError] = useState<ErrorScenario | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const auth = GitHubAuth.getInstance();

  const testScenario = async (scenario: ErrorScenario) => {
    try {
      setIsLoading(true);
      setCurrentError(scenario);
      setErrorMessage(null);
      await auth.handleTestScenario(scenario);
    } catch (error) {
      console.error('Test scenario error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!import.meta.env.DEV || !import.meta.env.VITE_TEST_MODE) {
    return null;
  }

  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-lg mb-6">
      <h2 className="text-lg font-semibold mb-4">Test Error Scenarios</h2>
      <div className="space-y-4">
        {ERROR_SCENARIOS.map((scenario) => (
          <div key={scenario} className="flex items-center justify-between">
            <span className="text-sm capitalize">{scenario.replace('_', ' ')}</span>
            <Button
              onClick={() => testScenario(scenario)}
              variant="outline"
              disabled={isLoading && currentError === scenario}
            >
              {isLoading && currentError === scenario ? 'Testing...' : 'Test'}
            </Button>
          </div>
        ))}
        {errorMessage && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}
