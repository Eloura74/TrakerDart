/**
 * Gestionnaire de profils de calibration
 * Sauvegarde, chargement et gestion des calibrations ArUco
 */

import type { CalibrationProfile, CalibrationResult, ArucoTargetConfig } from '@/types/aruco';

const STORAGE_KEY = 'aruco_calibration_profiles';
const ACTIVE_PROFILE_KEY = 'active_calibration_profile';

/**
 * Gestionnaire de profils de calibration
 */
export class CalibrationManager {
  /**
   * Sauvegarder un nouveau profil
   */
  static saveProfile(
    name: string,
    result: CalibrationResult,
    targetConfig: ArucoTargetConfig,
    description?: string
  ): CalibrationProfile {
    const profile: CalibrationProfile = {
      id: crypto.randomUUID(),
      name,
      description,
      result,
      targetConfig,
      createdAt: new Date(),
      updatedAt: new Date(),
      deviceInfo: {
        userAgent: navigator.userAgent,
        resolution: {
          width: result.resolution.width,
          height: result.resolution.height,
        },
      },
    };

    // Charger les profils existants
    const profiles = this.getAllProfiles();
    profiles.push(profile);

    // Sauvegarder
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));

    return profile;
  }

  /**
   * Obtenir tous les profils
   */
  static getAllProfiles(): CalibrationProfile[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Erreur chargement profils:', error);
      return [];
    }
  }

  /**
   * Obtenir un profil par ID
   */
  static getProfile(id: string): CalibrationProfile | null {
    const profiles = this.getAllProfiles();
    return profiles.find(p => p.id === id) || null;
  }

  /**
   * Supprimer un profil
   */
  static deleteProfile(id: string): boolean {
    const profiles = this.getAllProfiles();
    const filtered = profiles.filter(p => p.id !== id);

    if (filtered.length === profiles.length) {
      return false; // Profil non trouvé
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    // Si c'était le profil actif, le désactiver
    const activeId = this.getActiveProfileId();
    if (activeId === id) {
      this.setActiveProfile(null);
    }

    return true;
  }

  /**
   * Mettre à jour un profil
   */
  static updateProfile(id: string, updates: Partial<CalibrationProfile>): boolean {
    const profiles = this.getAllProfiles();
    const index = profiles.findIndex(p => p.id === id);

    if (index === -1) return false;

    profiles[index] = {
      ...profiles[index],
      ...updates,
      updatedAt: new Date(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    return true;
  }

  /**
   * Définir le profil actif
   */
  static setActiveProfile(profileId: string | null): void {
    if (profileId === null) {
      localStorage.removeItem(ACTIVE_PROFILE_KEY);
    } else {
      localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
    }
  }

  /**
   * Obtenir l'ID du profil actif
   */
  static getActiveProfileId(): string | null {
    return localStorage.getItem(ACTIVE_PROFILE_KEY);
  }

  /**
   * Obtenir le profil actif
   */
  static getActiveProfile(): CalibrationProfile | null {
    const id = this.getActiveProfileId();
    if (!id) return null;
    return this.getProfile(id);
  }

  /**
   * Exporter un profil en JSON
   */
  static exportProfile(profile: CalibrationProfile): string {
    return JSON.stringify(profile, null, 2);
  }

  /**
   * Importer un profil depuis JSON
   */
  static importProfile(json: string): CalibrationProfile {
    const profile: CalibrationProfile = JSON.parse(json);
    
    // Valider les champs requis
    if (!profile.name || !profile.result || !profile.targetConfig) {
      throw new Error('Profil invalide : champs manquants');
    }

    // Générer un nouvel ID
    profile.id = crypto.randomUUID();
    profile.createdAt = new Date();
    profile.updatedAt = new Date();

    // Sauvegarder
    const profiles = this.getAllProfiles();
    profiles.push(profile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));

    return profile;
  }

  /**
   * Obtenir les statistiques des profils
   */
  static getStats(): {
    totalProfiles: number;
    averageReprojectionError: number;
    bestProfile: CalibrationProfile | null;
    worstProfile: CalibrationProfile | null;
  } {
    const profiles = this.getAllProfiles();

    if (profiles.length === 0) {
      return {
        totalProfiles: 0,
        averageReprojectionError: 0,
        bestProfile: null,
        worstProfile: null,
      };
    }

    const errors = profiles.map(p => p.result.reprojectionError);
    const avgError = errors.reduce((sum, e) => sum + e, 0) / errors.length;

    const sortedByError = [...profiles].sort(
      (a, b) => a.result.reprojectionError - b.result.reprojectionError
    );

    return {
      totalProfiles: profiles.length,
      averageReprojectionError: avgError,
      bestProfile: sortedByError[0],
      worstProfile: sortedByError[sortedByError.length - 1],
    };
  }

  /**
   * Nettoyer les anciens profils (> 90 jours)
   */
  static cleanupOldProfiles(daysToKeep: number = 90): number {
    const profiles = this.getAllProfiles();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const activeId = this.getActiveProfileId();
    const filtered = profiles.filter(p => {
      // Garder le profil actif
      if (p.id === activeId) return true;
      
      // Garder les profils récents
      const updatedAt = new Date(p.updatedAt);
      return updatedAt > cutoffDate;
    });

    const removed = profiles.length - filtered.length;

    if (removed > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }

    return removed;
  }

  /**
   * Vérifier si un profil est compatible avec une résolution
   */
  static isProfileCompatible(
    profile: CalibrationProfile,
    targetResolution: { width: number; height: number }
  ): boolean {
    const profileRes = profile.result.resolution;
    
    // Vérifier si les résolutions correspondent exactement
    // Ou si elles ont le même ratio
    if (
      profileRes.width === targetResolution.width &&
      profileRes.height === targetResolution.height
    ) {
      return true;
    }

    const profileRatio = profileRes.width / profileRes.height;
    const targetRatio = targetResolution.width / targetResolution.height;

    // Tolérance de 5% sur le ratio
    return Math.abs(profileRatio - targetRatio) < 0.05;
  }

  /**
   * Trouver le meilleur profil pour une résolution
   */
  static findBestProfileForResolution(
    targetResolution: { width: number; height: number }
  ): CalibrationProfile | null {
    const profiles = this.getAllProfiles();
    
    // Filtrer les profils compatibles
    const compatible = profiles.filter(p =>
      this.isProfileCompatible(p, targetResolution)
    );

    if (compatible.length === 0) return null;

    // Trier par erreur de reprojection
    compatible.sort((a, b) => 
      a.result.reprojectionError - b.result.reprojectionError
    );

    return compatible[0];
  }

  /**
   * Dupliquer un profil
   */
  static duplicateProfile(id: string, newName: string): CalibrationProfile | null {
    const original = this.getProfile(id);
    if (!original) return null;

    const duplicate: CalibrationProfile = {
      ...original,
      id: crypto.randomUUID(),
      name: newName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const profiles = this.getAllProfiles();
    profiles.push(duplicate);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));

    return duplicate;
  }
}

/**
 * Hook React pour utiliser le gestionnaire de calibration
 */
export function useCalibrationManager() {
  const getAllProfiles = () => CalibrationManager.getAllProfiles();
  const getProfile = (id: string) => CalibrationManager.getProfile(id);
  const saveProfile = (
    name: string,
    result: CalibrationResult,
    targetConfig: ArucoTargetConfig,
    description?: string
  ) => CalibrationManager.saveProfile(name, result, targetConfig, description);
  const deleteProfile = (id: string) => CalibrationManager.deleteProfile(id);
  const setActiveProfile = (id: string | null) => CalibrationManager.setActiveProfile(id);
  const getActiveProfile = () => CalibrationManager.getActiveProfile();

  return {
    getAllProfiles,
    getProfile,
    saveProfile,
    deleteProfile,
    setActiveProfile,
    getActiveProfile,
  };
}
