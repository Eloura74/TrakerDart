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

      {/* Banner Nouvelle Session */}
      <div className="container mx-auto px-4 pt-6 pb-0">
        <div
          className="relative group cursor-pointer"
          onClick={handleStartSession}
        >
          {/* Background Gradient & Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-xl blur-md group-hover:blur-lg transition-all duration-300 opacity-75" />

          {/* Main Content */}
          <div className="relative h-20 rounded-xl overflow-hidden border border-cyan-500/30 bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:border-cyan-500/50 transition-all duration-300">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-background-shine opacity-50" />
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl" />

            {/* Text & Icon */}
            <div className="relative z-10 flex items-center gap-3">
              <div className="p-2 rounded-full bg-cyan-500/20 border border-cyan-500/50 group-hover:scale-110 transition-transform duration-300">
                <PlayCircle className="h-6 w-6 text-cyan-400" />
              </div>
              <span className="text-xl font-bold text-white tracking-wide text-glow">
                Nouvelle Session
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Editor Toggle (Hidden but accessible if needed, or moved) */}
        {isEditMode && (
          <div className="mt-2 flex justify-end">
            <DashboardEditor
              isEditable={isEditMode}
              onToggleEdit={() => setIsEditMode(!isEditMode)}
              onAddWidget={handleAddWidget}
              onSaveLayout={handleSaveLayout}
            />
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-3 pb-3">
        {/* Usage Banner (limites premium) */}
        <div className="mb-3">
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
