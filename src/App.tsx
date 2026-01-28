/**
 * Composant principal de l'application
 * Gère le routing et la structure globale
 */

import { useState, useEffect, lazy, Suspense } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/store/useAppStore";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { Loader2 } from "lucide-react";
import "./index.css";

// Lazy loading des pages pour optimiser le bundle initial
const HomePage = lazy(() => import("./pages/HomePage").then(m => ({ default: m.HomePage })));
const CapturePageAuto = lazy(() => import("./pages/CapturePageAuto").then(m => ({ default: m.CapturePageAuto })));
const AnalysisPage = lazy(() => import("./pages/AnalysisPage").then(m => ({ default: m.AnalysisPage })));
const ComparisonPage = lazy(() => import("./pages/ComparisonPage").then(m => ({ default: m.ComparisonPage })));
const HistoryPage = lazy(() => import("./pages/HistoryPage").then(m => ({ default: m.HistoryPage })));
const CalibrationPage = lazy(() => import("./pages/CalibrationPage").then(m => ({ default: m.CalibrationPage })));
const LoginPage = lazy(() => import("./pages/auth/LoginPage").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage").then(m => ({ default: m.RegisterPage })));
const PricingPage = lazy(() => import("./pages/PricingPage").then(m => ({ default: m.PricingPage })));
const DevPage = lazy(() => import("./pages/DevPage").then(m => ({ default: m.DevPage })));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage").then(m => ({ default: m.SubscriptionPage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage").then(m => ({ default: m.SettingsPage })));
const AISettingsPage = lazy(() => import("./pages/AISettingsPage").then(m => ({ default: m.AISettingsPage })));
const AIChatPage = lazy(() => import("./pages/AIChatPage").then(m => ({ default: m.AIChatPage })));
const AITrainingPlanPage = lazy(() => import("./pages/AITrainingPlanPage").then(m => ({ default: m.AITrainingPlanPage })));
const ArucoCalibrationPage = lazy(() => import("./pages/ArucoCalibrationPage").then(m => ({ default: m.ArucoCalibrationPage })));

/**
 * Router basique avec hash routing
 * Format des routes:
 * - #/ ou #/home → HomePage
 * - #/capture → CapturePage
 * - #/calibration → CalibrationPage
 * - #/analysis/:id → AnalysisPage
 * - #/history → HistoryPage
 */
function App() {
  const [currentRoute, setCurrentRoute] = useState(
    window.location.hash.slice(1) || "/",
  );
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const loadUserData = useAppStore((state) => state.loadUserData);

  useEffect(() => {
    // Récupérer la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) {
        loadUserData();
      }
    });

    // Écouter les changements d'auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadUserData();
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash.slice(1) || "/");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Parser la route pour extraire les paramètres
  const parseRoute = (route: string) => {
    const parts = route.split("/");
    return {
      path: parts[1] || "",
      param: parts[2] || undefined,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  // Router basique
  const renderPage = () => {
    const { path, param } = parseRoute(currentRoute);

    // Routes publiques
    if (path === "login") return <LoginPage />;
    if (path === "register") return <RegisterPage />;

    // Protection des routes privées
    if (!session) {
      // Rediriger vers login si non connecté
      window.location.hash = "#/login";
      return <LoginPage />;
    }

    switch (path) {
      case "":
      case "home":
        return <HomePage />;

      case "capture":
        return <CapturePageAuto />;

      case "calibration":
        return <CalibrationPage />;

      case "analysis":
        return <AnalysisPage volleyId={param} />;

      case "history":
        return <HistoryPage />;

      case "comparison":
        return <ComparisonPage />;

      case "pricing":
        return <PricingPage />;

      case "dev":
        return <DevPage />;

      case "subscription":
        return <SubscriptionPage />;

      case "settings":
        return <SettingsPage />;

      case "ai-settings":
        return <AISettingsPage />;

      case "ai-chat":
        return <AIChatPage />;

      case "ai-training":
        return <AITrainingPlanPage />;

      case "aruco-calibration":
        return <ArucoCalibrationPage />;

      default:
        return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-muted-foreground mb-4">Page non trouvée</p>
              <button
                onClick={() => {
                  window.location.hash = "#/";
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="app dark text-foreground relative">
        {/* Background Grid Global - Sur toutes les pages */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <Suspense
          fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
            </div>
          }
        >
          {renderPage()}
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default App;
