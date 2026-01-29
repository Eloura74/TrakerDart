/**
 * Configuration du client Supabase avec gestion robuste des erreurs
 * 
 * Stratégie :
 * - Mode DEV : Permet de fonctionner sans Supabase (features désactivées)
 * - Mode PROD : Fail-fast si Supabase non configuré (erreur explicite)
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Déterminer si on est en mode dev ou production
const isDevMode = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === "true";
const isProdMode = import.meta.env.PROD && import.meta.env.VITE_DEV_MODE !== "true";

// Vérifier si la config Supabase est valide
const hasValidConfig = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "your_supabase_project_url" &&
  supabaseAnonKey !== "your_supabase_anon_key" &&
  supabaseUrl.includes("supabase.co")
);

/**
 * Flag public pour vérifier si Supabase est disponible
 * Les composants peuvent utiliser cette variable pour désactiver les features nécessitant Supabase
 */
export const isSupabaseConfigured = hasValidConfig;

// Gestion des cas d'erreur
if (!hasValidConfig) {
  if (isProdMode) {
    // EN PRODUCTION : Fail-fast avec message d'erreur explicite
    const errorMessage = 
      "❌ ERREUR CRITIQUE : Supabase n'est pas configuré en production.\n" +
      "Veuillez configurer VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans vos variables d'environnement.\n" +
      "L'application ne peut pas fonctionner sans authentification.";
    
    console.error(errorMessage);
    
    // Afficher un message d'erreur visible à l'utilisateur
    if (typeof document !== "undefined") {
      document.addEventListener("DOMContentLoaded", () => {
        const errorDiv = document.createElement("div");
        errorDiv.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #1a1a1a;
          color: #ef4444;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          z-index: 99999;
          padding: 2rem;
          font-family: monospace;
        `;
        errorDiv.innerHTML = `
          <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ Configuration manquante</h1>
          <p style="font-size: 1rem; max-width: 600px; text-align: center; line-height: 1.6;">
            Supabase n'est pas configuré. L'application ne peut pas fonctionner.<br/>
            Veuillez contacter l'administrateur système.
          </p>
        `;
        document.body.appendChild(errorDiv);
      });
    }
    
    // Lancer une erreur pour arrêter l'exécution
    throw new Error(errorMessage);
  } else if (isDevMode) {
    // EN MODE DEV : Warning sans bloquer l'app
    console.warn(
      "🔧 MODE DEV : Supabase non configuré.\n" +
      "Les fonctionnalités suivantes seront DÉSACTIVÉES :\n" +
      "  - Authentification\n" +
      "  - Synchronisation des sessions\n" +
      "  - Sauvegarde cloud\n" +
      "L'application fonctionnera en mode local uniquement."
    );
  }
}

// Créer le client Supabase
// En dev sans config, utiliser des valeurs placeholder (le client ne sera pas utilisé)
const finalUrl = hasValidConfig
  ? supabaseUrl
  : "https://placeholder-dev.supabase.co";
const finalKey = hasValidConfig
  ? supabaseAnonKey
  : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder";

export const supabase = createClient(finalUrl, finalKey);

/**
 * Helper pour vérifier si une opération Supabase peut être effectuée
 * @returns true si Supabase est configuré et utilisable
 */
export function canUseSupabase(): boolean {
  return isSupabaseConfigured;
}

/**
 * Wrapper sécurisé pour les opérations Supabase
 * Lance un warning en console si Supabase n'est pas configuré
 * @param operation - Nom de l'opération (pour le logging)
 * @returns true si l'opération peut continuer, false sinon
 */
export function requireSupabase(operation: string): boolean {
  if (!isSupabaseConfigured) {
    console.warn(
      `⚠️ Opération Supabase ignorée [${operation}] : ` +
      "Supabase n'est pas configuré. Fonctionnalité désactivée."
    );
    return false;
  }
  return true;
}
