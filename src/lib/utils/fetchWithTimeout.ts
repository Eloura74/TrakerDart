/**
 * Utilitaire fetch avec timeout configurable via AbortController
 * Évite les blocages UX en cas de timeout réseau
 */

/**
 * Fetch avec timeout automatique
 * @param url - URL à appeler
 * @param options - Options fetch standard
 * @param timeoutMs - Timeout en millisecondes (défaut: 30000ms = 30s)
 * @returns Promise de Response
 * @throws Error si timeout ou erreur réseau
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 30000
): Promise<Response> {
  // Créer un AbortController pour gérer le timeout
  const controller = new AbortController();
  const { signal } = controller;

  // Fusionner le signal avec les options existantes
  const mergedOptions: RequestInit = {
    ...options,
    signal,
  };

  // Timer de timeout qui abort la requête
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    // Exécuter le fetch avec signal
    const response = await fetch(url, mergedOptions);
    
    // Nettoyer le timeout si succès
    clearTimeout(timeoutId);
    
    return response;
  } catch (error) {
    // Nettoyer le timeout
    clearTimeout(timeoutId);

    // Distinguer timeout des autres erreurs
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(
          `Timeout: La requête vers ${url} a dépassé ${timeoutMs}ms`
        );
      }
    }

    // Relancer l'erreur originale si ce n'est pas un timeout
    throw error;
  }
}

/**
 * Fetch JSON avec timeout et parsing sécurisé
 * @param url - URL à appeler
 * @param options - Options fetch standard
 * @param timeoutMs - Timeout en millisecondes
 * @returns Promise de l'objet JSON parsé
 */
export async function fetchJSONWithTimeout<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 30000
): Promise<T> {
  const response = await fetchWithTimeout(url, options, timeoutMs);

  if (!response.ok) {
    // Tenter de lire le message d'erreur
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error?.message || errorData.message || errorMessage;
    } catch {
      // Impossible de parser l'erreur, garder le message par défaut
    }
    throw new Error(errorMessage);
  }

  // Parser le JSON de manière sécurisée
  try {
    return (await response.json()) as T;
  } catch (error) {
    throw new Error(`Impossible de parser la réponse JSON: ${error}`);
  }
}
