import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitaire pour fusionner les classes CSS conditionnelles
 * Combine clsx et tailwind-merge pour éviter les conflits de classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatte un nombre en pourcentage avec n décimales
 * @param value - Valeur à formater (entre 0 et 1)
 * @param decimals - Nombre de décimales (défaut: 1)
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formatte un angle en degrés avec symbole
 * @param degrees - Angle en degrés
 * @param decimals - Nombre de décimales (défaut: 1)
 */
export function formatAngle(degrees: number, decimals: number = 1): string {
  return `${degrees.toFixed(decimals)}°`;
}

/**
 * Formatte une durée en millisecondes en format lisible
 * @param ms - Durée en millisecondes
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

/**
 * Calcule la moyenne d'un tableau de nombres
 * @param values - Tableau de valeurs
 */
export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calcule l'écart-type d'un tableau de nombres
 * @param values - Tableau de valeurs
 */
export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = average(values);
  const squareDiffs = values.map((value) => Math.pow(value - avg, 2));
  return Math.sqrt(average(squareDiffs));
}

/**
 * Calcule le coefficient de variation (CV = écart-type / moyenne)
 * Mesure de la dispersion relative, utile pour évaluer la régularité
 * @param values - Tableau de valeurs
 */
export function coefficientOfVariation(values: number[]): number {
  const avg = average(values);
  if (avg === 0) return 0;
  return standardDeviation(values) / avg;
}

/**
 * Détermine la qualité d'un indicateur basé sur son coefficient de variation
 * @param cv - Coefficient de variation
 * @returns 'excellent' | 'good' | 'fair' | 'poor'
 */
export function getQualityLevel(
  cv: number,
): "excellent" | "good" | "fair" | "poor" {
  if (cv < 0.05) return "excellent"; // < 5% de variation
  if (cv < 0.1) return "good"; // 5-10% de variation
  if (cv < 0.2) return "fair"; // 10-20% de variation
  return "poor"; // > 20% de variation
}

/**
 * Clamp une valeur entre min et max
 * @param value - Valeur à contraindre
 * @param min - Valeur minimale
 * @param max - Valeur maximale
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Interpole linéairement entre deux valeurs
 * @param a - Valeur de départ
 * @param b - Valeur d'arrivée
 * @param t - Facteur d'interpolation (0-1)
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Convertit des radians en degrés
 */
export function radToDeg(rad: number): number {
  return rad * (180 / Math.PI);
}

/**
 * Convertit des degrés en radians
 */
export function degToRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Génère un ID unique basé sur le timestamp et un nombre aléatoire
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Formate une date en format lisible français
 * @param date - Date à formater
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Formate une date en format court
 * @param date - Date à formater
 */
export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Détecte si l'utilisateur est sur mobile
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

/**
 * Détecte si l'appareil supporte le mode paysage
 */
export function supportsOrientationChange(): boolean {
  return "orientation" in window.screen || "orientation" in window;
}

/**
 * Demande le mode plein écran
 */
export async function requestFullscreen(element: HTMLElement): Promise<void> {
  if (element.requestFullscreen) {
    await element.requestFullscreen();
  }
}

/**
 * Quitte le mode plein écran
 */
export async function exitFullscreen(): Promise<void> {
  if (document.exitFullscreen) {
    await document.exitFullscreen();
  }
}
