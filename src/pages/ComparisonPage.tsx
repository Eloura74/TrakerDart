import { useState, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { SessionSelector } from "@/components/comparison/SessionSelector";
import { ComparisonCharts } from "@/components/comparison/ComparisonCharts";
import { ComparisonTable } from "@/components/comparison/ComparisonTable";
import { compareSessionsMetrics } from "@/lib/comparison/sessionComparator";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AppHeader } from "@/components/layout/AppHeader";
import { ExportDialog } from "@/components/export/ExportDialog";

export function ComparisonPage() {
  const { sessions } = useAppStore();
  const [selectedSessionId1, setSelectedSessionId1] = useState<string>("");
  const [selectedSessionId2, setSelectedSessionId2] = useState<string>("");
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Sélectionner par défaut les 2 dernières sessions
  useMemo(() => {
    if (sessions.length >= 2 && !selectedSessionId1 && !selectedSessionId2) {
      const sorted = [...sessions].sort((a, b) => b.createdAt - a.createdAt);
      setSelectedSessionId1(sorted[0].id);
      setSelectedSessionId2(sorted[1].id);
    }
  }, [sessions, selectedSessionId1, selectedSessionId2]);

  const selectedSessions = useMemo(() => {
    return sessions.filter(
      (s) => s.id === selectedSessionId1 || s.id === selectedSessionId2,
    );
  }, [sessions, selectedSessionId1, selectedSessionId2]);

  const session1 = sessions.find((s) => s.id === selectedSessionId1);
  const session2 = sessions.find((s) => s.id === selectedSessionId2);

  const comparisonData = useMemo(() => {
    if (selectedSessions.length < 2) return null;
    return compareSessionsMetrics(selectedSessions);
  }, [selectedSessions]);

  return (
    <div className="min-h-screen app-bg-gradient text-white">
      <AppHeader />

      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Comparaison de Sessions
            </h1>
            <p className="text-sm text-gray-400">
              Analysez votre progression entre deux entraînements
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsExportOpen(true)}
            disabled={!session1}
          >
            <Download className="h-4 w-4" />
            Exporter le rapport
          </Button>
        </div>

        {/* Selection */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-md">
          <CardContent className="p-6">
            <SessionSelector
              sessions={sessions}
              selectedSessionId1={selectedSessionId1}
              selectedSessionId2={selectedSessionId2}
              onSelectSession1={setSelectedSessionId1}
              onSelectSession2={setSelectedSessionId2}
            />
          </CardContent>
        </Card>

        {session1 && session2 && comparisonData ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPIs de progression */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-white/10 bg-black/40 backdrop-blur-md">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-400">
                    Progression Régularité
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      comparisonData.improvementRate > 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {comparisonData.improvementRate > 0 ? "+" : ""}
                    {comparisonData.improvementRate.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
              {/* Autres KPIs à ajouter ici */}
            </div>

            {/* Graphiques */}
            <ComparisonCharts session1={session1} session2={session2} />

            {/* Tableau détaillé */}
            <ComparisonTable sessions={[session1, session2]} />
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-white/10 bg-white/5">
            <p className="text-gray-400">
              Sélectionnez deux sessions pour voir la comparaison
            </p>
          </div>
        )}
      </div>

      {session1 && (
        <ExportDialog
          session={session1}
          open={isExportOpen}
          onClose={() => setIsExportOpen(false)}
        />
      )}
    </div>
  );
}
