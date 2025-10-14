/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TAGMANGO_API_BASE: string
  readonly VITE_TOKEN_TEST: string
  readonly VITE_ENVIRONMENT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

