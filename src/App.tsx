/**
 * Composant principal de l'application
 * Gère le routing et la structure globale
 */

import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/store/useAppStore";
import { HomePage } from "./pages/HomePage";
import { CapturePageAuto } from "./pages/CapturePageAuto";
import { AnalysisPage } from "./pages/AnalysisPage";
import { HistoryPage } from "./pages/HistoryPage";
import { CalibrationPage } from "./pages/CalibrationPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { Loader2 } from "lucide-react";
import "./index.css";

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

  return <div className="app">{renderPage()}</div>;
}

export default App;
