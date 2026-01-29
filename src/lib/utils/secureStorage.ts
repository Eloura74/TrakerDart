/**
 * Utilitaires de stockage sécurisé avec gestion d'erreurs robuste
 * Garantit que les opérations localStorage/sessionStorage ne cassent jamais l'application
 */

/**
 * Parse JSON de manière sécurisée avec fallback
 * @param jsonString - Chaîne JSON à parser
 * @param fallback - Valeur de retour en cas d'erreur
 * @returns Objet parsé ou fallback
 */
export function safeJSONParse<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString) {
    return fallback;
  }

  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("❌ Erreur parsing JSON:", error);
    console.error("Contenu corrompu:", jsonString.substring(0, 100));
    return fallback;
  }
}

/**
 * Récupère une valeur depuis localStorage de manière sécurisée
 * @param key - Clé de stockage
 * @param fallback - Valeur par défaut si erreur ou inexistant
 * @returns Valeur parsée ou fallback
 */
export function safeLocalStorageGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return safeJSONParse(item, fallback);
  } catch (error) {
    console.error(`❌ Erreur lecture localStorage [${key}]:`, error);
    return fallback;
  }
}

/**
 * Sauvegarde une valeur dans localStorage de manière sécurisée
 * @param key - Clé de stockage
 * @param value - Valeur à sauvegarder
 * @returns true si succès, false sinon
 */
export function safeLocalStorageSet(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`❌ Erreur écriture localStorage [${key}]:`, error);
    return false;
  }
}

/**
 * Récupère une chaîne brute depuis localStorage de manière sécurisée
 * @param key - Clé de stockage
 * @param fallback - Valeur par défaut
 * @returns Chaîne ou fallback
 */
export function safeLocalStorageGetString(
  key: string,
  fallback: string = ""
): string {
  try {
    return localStorage.getItem(key) || fallback;
  } catch (error) {
    console.error(`❌ Erreur lecture localStorage [${key}]:`, error);
    return fallback;
  }
}

/**
 * Sauvegarde une chaîne dans localStorage de manière sécurisée
 * @param key - Clé de stockage
 * @param value - Chaîne à sauvegarder
 * @returns true si succès, false sinon
 */
export function safeLocalStorageSetString(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`❌ Erreur écriture localStorage [${key}]:`, error);
    return false;
  }
}

/**
 * Récupère une valeur depuis sessionStorage de manière sécurisée
 * @param key - Clé de stockage
 * @param fallback - Valeur par défaut si erreur ou inexistant
 * @returns Valeur parsée ou fallback
 */
export function safeSessionStorageGet<T>(key: string, fallback: T): T {
  try {
    const item = sessionStorage.getItem(key);
    return safeJSONParse(item, fallback);
  } catch (error) {
    console.error(`❌ Erreur lecture sessionStorage [${key}]:`, error);
    return fallback;
  }
}

/**
 * Sauvegarde une valeur dans sessionStorage de manière sécurisée
 * @param key - Clé de stockage
 * @param value - Valeur à sauvegarder
 * @returns true si succès, false sinon
 */
export function safeSessionStorageSet(key: string, value: unknown): boolean {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`❌ Erreur écriture sessionStorage [${key}]:`, error);
    return false;
  }
}

/**
 * Récupère une chaîne brute depuis sessionStorage de manière sécurisée
 * @param key - Clé de stockage
 * @param fallback - Valeur par défaut
 * @returns Chaîne ou fallback
 */
export function safeSessionStorageGetString(
  key: string,
  fallback: string = ""
): string {
  try {
    return sessionStorage.getItem(key) || fallback;
  } catch (error) {
    console.error(`❌ Erreur lecture sessionStorage [${key}]:`, error);
    return fallback;
  }
}

/**
 * Sauvegarde une chaîne dans sessionStorage de manière sécurisée
 * @param key - Clé de stockage
 * @param value - Chaîne à sauvegarder
 * @returns true si succès, false sinon
 */
export function safeSessionStorageSetString(
  key: string,
  value: string
): boolean {
  try {
    sessionStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`❌ Erreur écriture sessionStorage [${key}]:`, error);
    return false;
  }
}

/**
 * Supprime une clé de localStorage de manière sécurisée
 * @param key - Clé à supprimer
 */
export function safeLocalStorageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`❌ Erreur suppression localStorage [${key}]:`, error);
  }
}

/**
 * Supprime une clé de sessionStorage de manière sécurisée
 * @param key - Clé à supprimer
 */
export function safeSessionStorageRemove(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`❌ Erreur suppression sessionStorage [${key}]:`, error);
  }
}
