/**
 * Page d'accueil de l'application
 * Point d'entrée principal avec navigation vers les fonctionnalités
 */

import {
  Target,
  History,
  PlayCircle,
  Trophy,
  Activity,
  LayoutDashboard,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardWidget } from "@/components/dashboard/DashboardWidget";
import { useState, useEffect } from "react";

export function HomePage() {
  const { startSession, sessions } = useAppStore();
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
      },
      data: { value: 0, trend: 0 },
    },
    {
      id: "chart-evolution",
      type: "chart",
      title: "Évolution de la Précision",
      position: { x: 0, y: 2, w: 8, h: 6 },
      config: { chartType: "line" },
      data: {
        labels: [],
        datasets: [],
      },
    },
    {
      id: "calendar-heatmap",
      type: "calendar",
      title: "Activité Récente",
      position: { x: 8, y: 2, w: 4, h: 6 },
      config: { days: 60 },
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
              data: { ...w.data, value: `${avgConsistency.toFixed(0)}%` },
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

  const handleLayoutChange = (layout: any) => {
    // Save layout to local storage or store
    console.log("Layout changed:", layout);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 z-50 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">TrakerDart</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Analyse biomécanique de lancer
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
                className={
                  isEditMode
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground"
                }
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                {isEditMode ? "Terminer" : "Personnaliser"}
              </Button>
              <Button
                onClick={handleStartSession}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Nouvelle Session</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
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
          onWidgetRemove={(id) => console.log("Remove", id)}
          onWidgetEdit={(id) => console.log("Edit", id)}
          isEditable={isEditMode}
          onWidgetClick={handleWidgetClick}
        />
      </main>
    </div>
  );
}
