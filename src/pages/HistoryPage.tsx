/**
 * Page d'historique des sessions
 * Affiche toutes les sessions passées et permet de les consulter
 */

import { ArrowLeft, Calendar, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/useAppStore";
import { formatDateShort } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BiomechanicsRadar } from "@/components/analysis/BiomechanicsRadar";

export function HistoryPage() {
  const { sessions, deleteSession } = useAppStore();

  /**
   * Retour à l'accueil
   */
  const goBack = () => {
    window.location.hash = "#/";
  };

  /**
   * Supprimer une session
   */
  const handleDelete = (sessionId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette session ?")) {
      deleteSession(sessionId);
    }
  };

  /**
   * Voir l'analyse d'une volée
   */
  const viewVolleyAnalysis = (volleyId: string) => {
    window.location.hash = `#/analysis/${volleyId}`;
  };

  // Trier les sessions par date (plus récente en premier)
  const sortedSessions = [...sessions].sort(
    (a, b) => b.createdAt - a.createdAt,
  );

  return (
    <div className="min-h-screen bg-transparent pb-20">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>

            <h1 className="text-xl font-bold">Historique</h1>

            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {sortedSessions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-xl font-bold mb-2">Aucune session</h2>
              <p className="text-muted-foreground mb-6">
                Commencez une session d'entraînement pour voir votre historique
              </p>
              <Button onClick={goBack}>Retour à l'accueil</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground">
                {sortedSessions.length} session(s) enregistrée(s)
              </p>
            </div>

            {sortedSessions.map((session) => (
              <Card key={session.id} className="glass-card overflow-hidden">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value={session.id} className="border-none">
                    <AccordionTrigger className="px-6 hover:no-underline hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="text-left">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-lg">
                              {formatDateShort(new Date(session.createdAt))}
                            </span>
                            <Badge
                              variant={
                                session.stats.consistencyTrend === "improving"
                                  ? "success"
                                  : session.stats.consistencyTrend ===
                                      "declining"
                                    ? "error"
                                    : "secondary"
                              }
                            >
                              {session.stats.consistencyTrend === "improving"
                                ? "↗ Progression"
                                : session.stats.consistencyTrend === "declining"
                                  ? "↘ Régression"
                                  : "→ Stable"}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {session.volleys.length} volée(s) ·{" "}
                            {session.stats.totalThrows} lancers
                          </div>
                        </div>

                        <div className="flex gap-8 text-right">
                          <div>
                            <p className="text-2xl font-bold text-primary">
                              {session.stats.averageConsistency.toFixed(0)}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Régularité
                            </p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-primary">
                              {session.stats.averageTechnicalScore.toFixed(0)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Technique
                            </p>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-6 pb-6 pt-2 bg-black/20">
                      <div className="space-y-6">
                        <div className="flex justify-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(session.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer la session
                          </Button>
                        </div>

                        {/* Graphiques de la session */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="bg-black/40 border-white/10">
                            <CardHeader>
                              <CardTitle className="text-sm">
                                Analyse Radar Moyenne
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {/* On prend la dernière volée comme représentative ou une moyenne si on avait l'objet */}
                              {session.volleys.length > 0 && (
                                <BiomechanicsRadar
                                  data={[
                                    {
                                      value:
                                        session.volleys[0].comparison
                                          .elbowConsistency,
                                      label: "COUDE",
                                    },
                                    {
                                      value:
                                        session.volleys[0].comparison
                                          .wristConsistency,
                                      label: "POIGNET",
                                    },
                                    {
                                      value:
                                        session.volleys[0].comparison
                                          .shoulderConsistency,
                                      label: "ÉPAULE",
                                    },
                                    {
                                      value:
                                        session.volleys[0].comparison
                                          .trunkConsistency,
                                      label: "TRONC",
                                    },
                                    {
                                      value:
                                        session.volleys[0].comparison
                                          .gazeConsistency,
                                      label: "STABILITÉ",
                                    },
                                  ]}
                                />
                              )}
                            </CardContent>
                          </Card>

                          <div className="space-y-4">
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">
                              Détail des volées
                            </h4>
                            {session.volleys.map((volley, idx) => (
                              <div
                                key={volley.id}
                                className="p-3 border rounded bg-white/5 flex justify-between items-center"
                              >
                                <div>
                                  <span className="font-bold">
                                    Volée {idx + 1}
                                  </span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {new Date(
                                      volley.createdAt,
                                    ).toLocaleTimeString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <div className="text-sm font-bold text-primary">
                                      {volley.comparison.consistencyIndex}%
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                      Régularité
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      viewVolleyAnalysis(volley.id)
                                    }
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
