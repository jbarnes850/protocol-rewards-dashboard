# GitHub Authentication Implementation

## Token Storage and Security

The GitHub OAuth implementation uses secure token storage with the following features:

- Encrypted token storage using WebCrypto API (AES-GCM)
- Token expiration handling (1-hour validity)
- Scope-based permission management
- Automatic token refresh
- Secure storage in localStorage with encryption

### Security Measures

1. **Token Encryption**: All tokens are encrypted before storage using AES-GCM
2. **Token Expiration**: Tokens expire after 1 hour and are automatically refreshed
3. **Secure Key Management**: Encryption keys are generated using WebCrypto API
4. **Scope Validation**: OAuth scopes are tracked and validated for each operation

### Environment Variables

Required environment variables:
- `VITE_GITHUB_CLIENT_ID`: GitHub OAuth App client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth App client secret

Create a `.env.local` file with these variables before running the application.

### Error Handling

The implementation includes comprehensive error handling for:
- Token storage failures
- Encryption/decryption errors
- Token expiration
- Network errors during token refresh
- Missing or invalid environment variables

### Usage

```typescript
// Get instance
const auth = GitHubAuth.getInstance();

// Check if user has required scope
if (!auth.hasScope('repo')) {
  // Request additional permissions
  auth.requestPrivateRepoAccess();
}

// Get current user
const user = await auth.getCurrentUser();
```
