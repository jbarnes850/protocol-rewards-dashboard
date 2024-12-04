import { GitHubAuth } from './github-auth';
import { SDKManager } from './sdk-manager';

interface VerificationResult {
  ready: boolean;
  checks: {
    env: {
      clientId: boolean;
      clientSecret: boolean;
      appUrl: boolean;
    };
    github: {
      api: boolean;
      scopes: boolean;
      rateLimit: number;
    };
    sdk: {
      initialized: boolean;
      connected: boolean;
    };
  };
  errors: string[];
}

export async function verifyDemoReadiness(): Promise<VerificationResult> {
  const errors: string[] = [];
  const githubAuth = GitHubAuth.getInstance();
  const sdkManager = SDKManager.getInstance();

  // 1. Verify environment variables
  const envChecks = {
    clientId: !!import.meta.env.VITE_GITHUB_CLIENT_ID,
    clientSecret: !!import.meta.env.VITE_GITHUB_CLIENT_SECRET,
    appUrl: !!import.meta.env.VITE_APP_URL
  };

  if (!envChecks.clientId) errors.push('Missing GitHub Client ID');
  if (!envChecks.clientSecret) errors.push('Missing GitHub Client Secret');
  if (!envChecks.appUrl) errors.push('Missing App URL');

  // 2. Verify GitHub API access and rate limits
  let githubChecks = {
    api: false,
    scopes: false,
    rateLimit: 0
  };

  try {
    const response = await fetch('https://api.github.com/rate_limit', {
      headers: {
        'Authorization': `Bearer ${githubAuth.getAccessToken()}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.ok) {
      githubChecks.api = true;
      const data = await response.json();
      githubChecks.rateLimit = data.resources.core.remaining;

      if (githubChecks.rateLimit < 100) {
        errors.push(`Low GitHub API rate limit: ${githubChecks.rateLimit} remaining`);
      }

      // Verify scopes if authenticated
      if (githubAuth.getAccessToken()) {
        const currentScopes = githubAuth.getCurrentScopes();
        githubChecks.scopes = currentScopes.includes('repo');
        
        if (!githubChecks.scopes) {
          errors.push('Missing required GitHub scopes');
        }
      }
    } else {
      errors.push('GitHub API access failed');
    }
  } catch (error) {
    errors.push(`GitHub API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // 3. Verify SDK initialization
  let sdkChecks = {
    initialized: false,
    connected: false
  };

  try {
    sdkChecks.initialized = !!sdkManager;
    if (sdkChecks.initialized) {
      sdkChecks.connected = await sdkManager.healthCheck();
    }

    if (!sdkChecks.initialized) errors.push('SDK not initialized');
    if (!sdkChecks.connected) errors.push('SDK not connected');
  } catch (error) {
    errors.push(`SDK verification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    ready: errors.length === 0,
    checks: {
      env: envChecks,
      github: githubChecks,
      sdk: sdkChecks
    },
    errors
  };
}

export function logVerificationResults(results: VerificationResult): void {
  console.group('Demo Verification Results');
  
  console.log('Overall Status:', results.ready ? '✅ Ready' : '❌ Not Ready');
  
  console.group('Environment Checks');
  Object.entries(results.checks.env).forEach(([key, value]) => {
    console.log(`${key}: ${value ? '✅' : '❌'}`);
  });
  console.groupEnd();

  console.group('GitHub Checks');
  console.log(`API Access: ${results.checks.github.api ? '✅' : '❌'}`);
  console.log(`Required Scopes: ${results.checks.github.scopes ? '✅' : '❌'}`);
  console.log(`Rate Limit Remaining: ${results.checks.github.rateLimit}`);
  console.groupEnd();

  console.group('SDK Checks');
  console.log(`Initialized: ${results.checks.sdk.initialized ? '✅' : '❌'}`);
  console.log(`Connected: ${results.checks.sdk.connected ? '✅' : '❌'}`);
  console.groupEnd();

  if (results.errors.length > 0) {
    console.group('Errors');
    results.errors.forEach((error, index) => {
      console.error(`${index + 1}. ${error}`);
    });
    console.groupEnd();
  }

  console.groupEnd();
} 