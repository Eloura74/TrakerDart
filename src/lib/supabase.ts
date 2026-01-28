import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// En mode dev sans Supabase configuré, utiliser des valeurs factices valides
const isDevMode = import.meta.env.VITE_DEV_MODE === "true";
const hasValidConfig =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "your_supabase_project_url" &&
  supabaseAnonKey !== "your_supabase_anon_key";

if (!hasValidConfig) {
  if (isDevMode) {
    console.warn(
      "🔧 Mode DEV : Supabase non configuré. Les fonctionnalités nécessitant la DB seront simulées.",
    );
  } else {
    console.error(
      "❌ Missing Supabase environment variables. Please check your .env file.",
    );
  }
}

// Utiliser des valeurs factices valides si pas configuré (pour éviter les erreurs)
const finalUrl = hasValidConfig
  ? supabaseUrl
  : "https://placeholder.supabase.co";
const finalKey = hasValidConfig
  ? supabaseAnonKey
  : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

export const supabase = createClient(finalUrl, finalKey);
