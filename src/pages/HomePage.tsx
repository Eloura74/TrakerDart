/**
 * Page d'accueil de l'application
 * Point d'entrée principal avec navigation vers les fonctionnalités
 */

import { Target, History, PlayCircle, Trophy, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardWidget } from "@/components/dashboard/DashboardWidget";
import { DashboardEditor } from "@/components/dashboard/DashboardEditor";
import { AppHeader } from "@/components/layout/AppHeader";
import { UsageBanner } from "@/components/subscription/UsageBanner";
import { useState, useEffect } from "react";

export function HomePage() {
  const { startSession, sessions } = useAppStore();
  // FORCER mode édition désactivé par défaut
  const [isEditMode, setIsEditMode] = useState(false);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    {
      id: "stats-sessions",
      type: "stat",
      title: "Sessions Totales",
      position: { x: 0, y: 0, w: 3, h: 2 },
      config: {
        color: "cyan",
        icon: <History className="h-5 w-5" />,
        backgroundImage: "/images/stats_sessions_bg.png",
        className: "hover:shadow-glow-cyan transition-all duration-300",
      },
      data: { value: 0, trend: 0, trendLabel: "vs mois dernier" },
    },
    {
      id: "stats-throws",
      type: "stat",
      title: "Lancers Effectués",
      position: { x: 3, y: 0, w: 3, h: 2 },
      config: {
        color: "purple",
        icon: <Target className="h-5 w-5" />,
        backgroundImage: "/images/stats_throws_bg.png",
        className: "hover:shadow-glow-purple transition-all duration-300",
      },
      data: { value: 0, trend: 0 },
    },
    {
      id: "stats-consistency",
      type: "stat",
      title: "Régularité Moyenne",
      position: { x: 6, y: 0, w: 3, h: 2 },
      config: {
        color: "orange",
        icon: <Activity className="h-5 w-5" />,
        backgroundImage: "/images/stats_consistency_bg.png",
        className: "hover:shadow-glow-orange transition-all duration-300",
      },
      data: { value: "0%", trend: 0 },
    },
    {
      id: "stats-score",
      type: "stat",
      title: "Score Moyen",
      position: { x: 9, y: 0, w: 3, h: 2 },
      config: {
        color: "green",
        icon: <Trophy className="h-5 w-5" />,
        backgroundImage: "/images/global_bg.png",
        className: "hover:shadow-glow-green transition-all duration-300",
      },
      data: { value: 0, trend: 0 },
    },
    {
      id: "chart-evolution",
      type: "chart",
      title: "Évolution de la Précision",
      position: { x: 0, y: 2, w: 8, h: 4 },
      config: {
        chartType: "line",
        backgroundImage: "/images/calibration_bg.png",
        className: "glass-card",
      },
      data: {
        labels: [],
        datasets: [],
      },
    },
    {
      id: "calendar-heatmap",
      type: "calendar",
      title: "Activité Récente",
      position: { x: 8, y: 2, w: 4, h: 4 },
      config: {
        days: 60,
        backgroundImage: "/images/history_bg.png",
        className: "glass-card",
      },
      data: [],
    },
  ]);

  // Update stats when sessions change
  useEffect(() => {
    if (!sessions) return;

    const totalSessions = sessions.length;
    const totalThrows = sessions.reduce(
      (sum, s) => sum + (s.stats?.totalThrows || 0),
      0,
    );
    const avgConsistency =
      sessions.length > 0
        ? sessions.reduce(
            (sum, s) => sum + (s.stats?.averageConsistency || 0),
            0,
          ) / sessions.length
        : 0;

    // Calculer le score moyen (utiliser consistency comme proxy si pas de score direct)
    const avgScore =
      sessions.length > 0
        ? sessions.reduce(
            (sum, s) => sum + (s.stats?.averageConsistency || 0),
            0,
          ) / sessions.length
        : 0;

    // Prepare chart data
    const last10Sessions = [...sessions]
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(-10);
    const chartData = {
      labels: last10Sessions.map((s) =>
        new Date(s.createdAt).toLocaleDateString(),
      ),
      datasets: [
        {
          label: "Précision",
          data: last10Sessions.map((s) => s.stats?.averageConsistency || 0),
          borderColor: "rgb(34, 211, 238)",
          backgroundColor: "rgba(34, 211, 238, 0.5)",
          tension: 0.4,
        },
      ],
    };

    // Prepare heatmap data
    const heatmapData = sessions.map((s) => ({
      date: new Date(s.createdAt),
      value: s.stats?.averageConsistency || 0,
      count: 1,
    }));

    setWidgets((current) =>
      current.map((w) => {
        switch (w.id) {
          case "stats-sessions":
            return { ...w, data: { ...w.data, value: totalSessions } };
          case "stats-throws":
            return { ...w, data: { ...w.data, value: totalThrows } };
          case "stats-consistency":
            return {
              ...w,
              data: { ...w.data, value: `${avgConsistency.toFixed(1)}%` },
            };
          case "stats-score":
            return {
              ...w,
              data: { ...w.data, value: `${avgScore.toFixed(1)}%` },
            };
          case "chart-evolution":
            return { ...w, data: chartData };
          case "calendar-heatmap":
            return { ...w, data: heatmapData };
          default:
            return w;
        }
      }),
    );
  }, [sessions]);

  const handleStartSession = () => {
    try {
      startSession();
      window.location.hash = "#/capture";
    } catch (error) {
      console.error("Erreur démarrage session:", error);
    }
  };

  const handleWidgetClick = (id: string) => {
    if (id.startsWith("stats-")) {
      window.location.hash = "#/history";
    }
  };

  const handleLayoutChange = (layout: unknown) => {
    // Save layout to local storage or store
    console.log("Layout changed:", layout);
  };

  const handleAddWidget = (newWidget: Omit<DashboardWidget, "id">) => {
    const id = `widget-${Date.now()}`;
    setWidgets([...widgets, { ...newWidget, id }]);
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
  };

  const handleSaveLayout = () => {
    // Persist layout
    setIsEditMode(false);
    // TODO: Save to store/DB
  };

  return (
    <div className="min-h-screen app-bg-gradient">
      {/* Header Moderne */}
      <AppHeader />

      {/* Barre d'actions */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DashboardEditor
                isEditable={isEditMode}
                onToggleEdit={() => setIsEditMode(!isEditMode)}
                onAddWidget={handleAddWidget}
                onSaveLayout={handleSaveLayout}
              />
            </div>
            <Button
              onClick={handleStartSession}
              size="sm"
              variant="outline"
              className="border-white/20 hover:bg-white/5 hover:border-white/30"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Nouvelle Session
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Usage Banner (limites premium) */}
        <div className="mb-6">
          <UsageBanner />
        </div>

        {/* Welcome Banner if no sessions */}
        {(!sessions || sessions.length === 0) && (
          <Card
            className="mb-8 border-primary/20 relative overflow-hidden group"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.2) 100%), url('/images/homeSession.png')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold mb-2">
                    Bienvenue sur TrakerDart
                  </h2>
                  <p className="text-muted-foreground">
                    Commencez votre première session pour débloquer le tableau
                    de bord.
                  </p>
                </div>
                <Button onClick={handleStartSession} size="lg">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Démarrer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Grid */}
        <DashboardLayout
          widgets={widgets}
          onLayoutChange={handleLayoutChange}
          onWidgetRemove={handleRemoveWidget}
          onWidgetEdit={(id) => console.log("Edit", id)}
          isEditable={isEditMode}
          onWidgetClick={handleWidgetClick}
        />
      </main>
    </div>
  );
}
