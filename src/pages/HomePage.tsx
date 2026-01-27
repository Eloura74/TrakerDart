/**
 * Page d'accueil de l'application
 * Point d'entrée principal avec navigation vers les fonctionnalités
 */

import { Target, History, Settings, PlayCircle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";

export function HomePage() {
  const { currentSession, startSession, sessions } = useAppStore();

  const handleStartSession = () => {
    startSession();
    // Navigation directe vers la capture
    // L'utilisateur peut aller en calibration s'il le souhaite
    window.location.hash = "#/capture";
  };

  const stats = {
    totalSessions: sessions.length,
    totalThrows: sessions.reduce((sum, s) => sum + s.stats.totalThrows, 0),
    averageConsistency:
      sessions.length > 0
        ? sessions.reduce((sum, s) => sum + s.stats.averageConsistency, 0) /
          sessions.length
        : 0,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">TrakerDart</h1>
              <p className="text-sm text-muted-foreground">
                Analyse biomécanique de lancer
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Action principale */}
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
                <h2 className="text-3xl font-bold mb-2">
                  {currentSession ? "Session en cours" : "Nouvelle session"}
                </h2>
                <p className="text-muted-foreground">
                  {currentSession
                    ? `${currentSession.volleys.length} volée(s) enregistrée(s)`
                    : "Commencez une nouvelle session d'entraînement"}
                </p>
              </div>
              <Button
                onClick={handleStartSession}
                size="lg"
                className="w-full md:w-auto"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                {currentSession ? "Continuer" : "Démarrer"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card
            className="relative overflow-hidden group border-white/10"
            style={{
              backgroundImage: `linear-gradient(to bottom right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url('/images/stats_sessions_bg.png')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <CardHeader>
              <CardDescription className="text-gray-400">
                Sessions totales
              </CardDescription>
              <CardTitle className="text-4xl text-white">
                {stats.totalSessions}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card
            className="relative overflow-hidden group border-white/10"
            style={{
              backgroundImage: `linear-gradient(to bottom right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url('/images/stats_throws_bg.png')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <CardHeader>
              <CardDescription className="text-gray-400">
                Lancers effectués
              </CardDescription>
              <CardTitle className="text-4xl text-white">
                {stats.totalThrows}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card
            className="relative overflow-hidden group border-white/10"
            style={{
              backgroundImage: `linear-gradient(to bottom right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url('/images/stats_consistency_bg.png')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <CardHeader>
              <CardDescription className="text-gray-400">
                Régularité moyenne
              </CardDescription>
              <CardTitle className="text-4xl text-white">
                {stats.averageConsistency.toFixed(0)}%
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Navigation rapide */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className="cursor-pointer hover:border-primary transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] relative overflow-hidden group border-white/10"
            onClick={() => {
              window.location.hash = "#/history";
            }}
            style={{
              backgroundImage: `linear-gradient(to bottom right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url('/images/history_bg.png')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <History className="h-5 w-5 text-cyan-400" />
                Historique
              </CardTitle>
              <CardDescription className="text-gray-400">
                Consultez vos sessions et suivez votre progression
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="ghost"
                className="w-full border border-white/10 bg-black/40 hover:bg-cyan-500/20 text-cyan-400"
              >
                Voir l'historique
              </Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-primary transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] relative overflow-hidden group border-white/10"
            onClick={() => {
              window.location.hash = "#/calibration";
            }}
            style={{
              backgroundImage: `linear-gradient(to bottom right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url('/images/calibration_bg.png')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Settings className="h-5 w-5 text-cyan-400" />
                Calibration
              </CardTitle>
              <CardDescription className="text-gray-400">
                Guide de positionnement et vérification caméra
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="ghost"
                className="w-full border border-white/10 bg-black/40 hover:bg-cyan-500/20 text-cyan-400"
              >
                📍 Calibrer
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Guide rapide pour les nouveaux utilisateurs */}
        {sessions.length === 0 && (
          <Card className="mt-8 border-dashed">
            <CardHeader>
              <CardTitle>Bienvenue ! 👋</CardTitle>
              <CardDescription>
                Quelques étapes pour commencer :
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  <strong>Positionnez votre appareil</strong> - Placez la caméra
                  de façon à vous voir de profil lors du lancer
                </li>
                <li>
                  <strong>Calibrez votre position</strong> - Effectuez un lancer
                  test pour vérifier le cadrage
                </li>
                <li>
                  <strong>Lancez une volée</strong> - Effectuez 3 lancers
                  consécutifs
                </li>
                <li>
                  <strong>Analysez vos résultats</strong> - Consultez le
                  feedback biomécanique détaillé
                </li>
              </ol>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>TrakerDart v0.1.0 - Analyse biomécanique de fléchettes</p>
        </div>
      </footer>
    </div>
  );
}
