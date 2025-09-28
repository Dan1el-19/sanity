/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPWRITE_DATABASE_ID: string
  readonly VITE_APPWRITE_APPOINTMENTS_COLLECTION_ID: string
  readonly VITE_APPWRITE_ENDPOINT: string
  readonly VITE_APPWRITE_PROJECT_ID: string
  // dodaj inne zmienne środowiskowe jeśli potrzebujesz
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

type ProcessEnv = ImportMetaEnv & Record<string, string | boolean | undefined>;

declare const process: {
  env: ProcessEnv;
};