/// <reference types="vite/client" />

/**
 * Déclaration des types pour les variables d'environnement Vite
 * Permet d'accéder à import.meta.env avec le typage TypeScript
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // Autres variables d'environnement à ajouter ici si nécessaire
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
