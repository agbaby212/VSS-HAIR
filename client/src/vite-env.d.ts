interface ImportMetaEnv {
  readonly VITE_USE_MOCKS: string; // "true" or "false" (env values are always strings)
  readonly VITE_API_URL: string;
  readonly VITE_WHATSAPP_NUMBER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
