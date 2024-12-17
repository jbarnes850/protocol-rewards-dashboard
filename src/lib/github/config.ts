interface GitHubConfig {
  apiUrl: string;
  scopes: string[];
  orgName?: string;
}

export const githubConfig: GitHubConfig = {
  apiUrl: import.meta.env.VITE_GITHUB_API_URL,
  scopes: import.meta.env.VITE_GITHUB_SCOPES.split(','),
  ...(import.meta.env.VITE_GITHUB_ORG && {
    orgName: import.meta.env.VITE_GITHUB_ORG
  })
};

export function validateGitHubConfig() {
  const required = ['VITE_GITHUB_API_URL', 'VITE_GITHUB_SCOPES'];
  
  const missing = required.filter(key => !import.meta.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required GitHub configuration: ${missing.join(', ')}`);
  }
} 