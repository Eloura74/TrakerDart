/**
 * Store global de l'application avec Zustand
 * Gère l'état de configuration, session, et UI
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppState,
  CameraConfig,
  Calibration,
  UserPreferences,
  TrainingSession,
  Volley,
} from "@/types";

/**
 * Actions du store
 */
interface AppActions {
  // Configuration caméra
  setCameraConfig: (config: CameraConfig) => void;
  setCalibration: (calibration: Calibration) => void;

  // Préférences utilisateur
  setPreferences: (preferences: Partial<UserPreferences>) => void;

  // Session d'entraînement
  startSession: () => void;
  endSession: () => void;
  addVolleyToSession: (volley: Volley) => void;

  // Volée en cours
  setCurrentVolley: (volley: Partial<Volley> | null) => void;

  // États UI
  setRecording: (isRecording: boolean) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  setError: (error: string | null) => void;

  // Historique
  addSession: (session: TrainingSession) => void;
  deleteSession: (sessionId: string) => void;

  // Chargement des données
  loadUserData: () => Promise<void>;

  // Reset
  reset: () => void;
}

/**
 * État initial
 */
const initialState: AppState = {
  cameraConfig: null,
  calibration: null,
  preferences: {
    language: "fr",
    units: "metric",
    analysisDetail: "intermediate",
    soundEnabled: false,
    vibrationEnabled: true,
    theme: "dark",
  },
  currentSession: null,
  currentVolley: null,
  sessions: [],
  isRecording: false,
  isAnalyzing: false,
  error: null,
};

/**
 * Store principal de l'application
 */
import { supabase } from "@/lib/supabase";

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Chargement des données depuis Supabase
      loadUserData: async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) return;

        try {
          // 1. Charger la calibration (optionnel - table peut ne pas exister)
          try {
            const { data: calibrationData, error: calibrationError } = await supabase
              .from("calibrations")
              .select("config")
              .eq("user_id", session.user.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (calibrationError) {
              console.warn("Table calibrations non disponible:", calibrationError.message);
            } else if (calibrationData?.config) {
              set({ calibration: calibrationData.config });
            }
          } catch (calibrationError) {
            // Table n'existe pas ou pas accessible, continuer sans calibration
            console.warn("Calibration non chargée:", calibrationError);
          }

          // 2. Charger les sessions (optionnel - table peut ne pas exister)
          try {
            const { data: sessionsData, error: sessionsError } = await supabase
              .from("sessions")
              .select("*")
              .eq("user_id", session.user.id)
              .order("created_at", { ascending: false });

            if (sessionsError) {
              console.warn("Table sessions non disponible:", sessionsError.message);
            } else if (sessionsData) {
              const sessions: TrainingSession[] = sessionsData.map((s) => ({
                id: s.id, // Utiliser l'ID UUID de Supabase
                volleys: s.volleys || [],
                stats: s.stats || {
                  totalThrows: 0,
                  averageConsistency: 0,
                  averageTechnicalScore: 0,
                  consistencyTrend: "stable",
                },
                createdAt: new Date(s.created_at).getTime(),
                endedAt: s.ended_at ? new Date(s.ended_at).getTime() : undefined,
                duration: s.duration || 0,
              }));
              set({ sessions });
            }
          } catch (sessionsError) {
            // Table n'existe pas ou pas accessible, continuer avec sessions vides
            console.warn("Sessions non chargées:", sessionsError);
          }
        } catch (error) {
          console.error("Erreur générale lors du chargement des données:", error);
        }
      },

      // Configuration caméra
      setCameraConfig: (config) => set({ cameraConfig: config }),

      setCalibration: async (calibration) => {
        console.log("✅ Calibration sauvegardée:", calibration);
        set({ calibration });

        // Sauvegarde Supabase
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from("calibrations").insert({
            user_id: session.user.id,
            config: calibration,
          });
        }
      },

      // Préférences
      setPreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),

      // Session d'entraînement
      startSession: () => {
        const session: TrainingSession = {
          id: `session-${Date.now()}`,
          volleys: [],
          stats: {
            totalThrows: 0,
            averageConsistency: 0,
            averageTechnicalScore: 0,
            consistencyTrend: "stable",
          },
          createdAt: Date.now(),
          duration: 0,
        };
        set({ currentSession: session });
      },

      endSession: async () => {
        const { currentSession } = get();
        if (!currentSession) return;

        // Calculer la durée finale
        const endedSession: TrainingSession = {
          ...currentSession,
          endedAt: Date.now(),
          duration: Date.now() - currentSession.createdAt,
        };

        // Ajouter à l'historique local
        set((state) => ({
          sessions: [...state.sessions, endedSession],
          currentSession: null,
        }));

        // Sauvegarde Supabase
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const { error } = await supabase.from("sessions").insert({
            user_id: session.user.id,
            created_at: new Date(endedSession.createdAt).toISOString(),
            ended_at: endedSession.endedAt
              ? new Date(endedSession.endedAt).toISOString()
              : null,
            duration: endedSession.duration,
            stats: endedSession.stats,
            volleys: endedSession.volleys,
          });

          if (error) console.error("Erreur sauvegarde session:", error);
        }
      },

      addVolleyToSession: (volley) => {
        set((state) => {
          if (!state.currentSession) return state;

          const volleys = [...state.currentSession.volleys, volley];

          // Recalculer les stats
          const totalThrows = volleys.length * 3;
          const consistencies = volleys.map(
            (v) => v.comparison.consistencyIndex,
          );
          const averageConsistency =
            consistencies.reduce((sum, c) => sum + c, 0) / consistencies.length;

          const technicalScores = volleys.flatMap((v) =>
            v.throws.map((t) => t.analysis.technicalScore),
          );
          const averageTechnicalScore =
            technicalScores.reduce((sum, s) => sum + s, 0) /
            technicalScores.length;

          // Détecter la tendance (simple: comparer première et dernière moitié)
          const halfPoint = Math.floor(consistencies.length / 2);
          const firstHalf = consistencies.slice(0, halfPoint);
          const secondHalf = consistencies.slice(halfPoint);
          const firstAvg =
            firstHalf.reduce((sum, c) => sum + c, 0) / firstHalf.length;
          const secondAvg =
            secondHalf.reduce((sum, c) => sum + c, 0) / secondHalf.length;

          let consistencyTrend: "improving" | "stable" | "declining" = "stable";
          if (secondAvg > firstAvg + 5) consistencyTrend = "improving";
          else if (secondAvg < firstAvg - 5) consistencyTrend = "declining";

          // Meilleure volée
          const bestVolley = volleys.reduce(
            (best, current) =>
              current.comparison.consistencyIndex >
              best.comparison.consistencyIndex
                ? current
                : best,
            volleys[0],
          );

          return {
            currentSession: {
              ...state.currentSession,
              volleys,
              stats: {
                totalThrows,
                averageConsistency,
                averageTechnicalScore,
                consistencyTrend,
                bestVolley: {
                  id: bestVolley.id,
                  consistencyIndex: bestVolley.comparison.consistencyIndex,
                },
              },
            },
          };
        });
      },

      // Volée en cours
      setCurrentVolley: (volley) => set({ currentVolley: volley }),

      // États UI
      setRecording: (isRecording) => set({ isRecording }),
      setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
      setError: (error) => set({ error }),

      // Historique
      addSession: (session) =>
        set((state) => ({
          sessions: [...state.sessions, session],
        })),

      deleteSession: async (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
        }));

        // Suppression Supabase
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase
            .from("sessions")
            .delete()
            .eq("id", sessionId)
            .eq("user_id", session.user.id);
        }
      },

      // Reset complet
      reset: () => set(initialState),
    }),
    {
      name: "trakerdart-storage", // Nom dans localStorage
      partialize: (state) => ({
        // Ne persister que certaines parties de l'état
        cameraConfig: state.cameraConfig,
        calibration: state.calibration,
        preferences: state.preferences,
        sessions: state.sessions,
        // Ne PAS persister: currentSession, currentVolley, isRecording, isAnalyzing, error
      }),
    },
  ),
);

/**
 * Sélecteurs pour accès optimisé
 */
export const selectCameraConfig = (state: AppState & AppActions) =>
  state.cameraConfig;
export const selectCalibration = (state: AppState & AppActions) =>
  state.calibration;
export const selectPreferences = (state: AppState & AppActions) =>
  state.preferences;
export const selectCurrentSession = (state: AppState & AppActions) =>
  state.currentSession;
export const selectSessions = (state: AppState & AppActions) => state.sessions;
export const selectIsRecording = (state: AppState & AppActions) =>
  state.isRecording;
export const selectIsAnalyzing = (state: AppState & AppActions) =>
  state.isAnalyzing;
