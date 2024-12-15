/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_GITHUB_API_URL: string
  readonly VITE_GITHUB_SCOPES: string
  readonly VITE_GITHUB_ORG: string
  readonly VITE_TEST_MODE?: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
