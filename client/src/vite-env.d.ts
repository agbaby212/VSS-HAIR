interface ImportMetaEnv {
  readonly VITE_USE_MOCKS: string; // "true" while building the frontend, "false" in production
  readonly VITE_API_URL: string;
  readonly VITE_WHATSAPP_NUMBER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}