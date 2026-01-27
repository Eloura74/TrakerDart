/**
 * Page d'analyse détaillée d'une volée
 * Affiche les résultats, scores, et recommandations
 */

import { useMemo, useState } from 'react'
import { ArrowLeft, TrendingUp, Target, Activity, BarChart3, Table } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScoreDisplay, ScoreGrid } from '@/components/analysis/ScoreDisplay'
import { FeedbackList } from '@/components/analysis/FeedbackCard'
import { AngleChartGrid } from '@/components/analysis/AngleChart'
import { DataTable } from '@/components/analysis/DataTable'
import { ThrowComparison } from '@/components/analysis/ThrowComparison'
import { FeedbackCardPro } from '@/components/analysis/FeedbackCardPro'
import { TrainingPlan } from '@/components/analysis/TrainingPlan'
import { useAppStore } from '@/store/useAppStore'
import { generateRecommendations } from '@/lib/feedback/generator'
import { generateProfessionalRecommendations, getTopPriorities, generateTrainingPlan } from '@/lib/feedback/professionalRecommendations'
import { getComparisonSummary } from '@/lib/biomechanics/comparison'
import type { Volley, Throw } from '@/types'

interface AnalysisPageProps {
  volleyId?: string
}

export function AnalysisPage({ volleyId }: AnalysisPageProps) {
  const { currentSession } = useAppStore()
  const [selectedView, setSelectedView] = useState<'summary' | 'charts' | 'data'>('summary')
  
  // Trouver la volée à afficher
  const volley: Volley | null = useMemo(() => {
    if (!currentSession) return null
    
    if (volleyId) {
      return currentSession.volleys.find(v => v.id === volleyId) || null
    }
    
    // Si pas d'ID, prendre la dernière volée
    return currentSession.volleys[currentSession.volleys.length - 1] || null
  }, [currentSession, volleyId])
  
  // Générer les recommandations (anciennes + nouvelles)
  const recommendations = useMemo(() => {
    if (!volley) return null
    
    const analyses = volley.throws.map(t => t.analysis)
    return generateRecommendations(analyses, volley.comparison)
  }, [volley])
  
  // Nouvelles recommandations professionnelles
  const proRecommendations = useMemo(() => {
    if (!volley) return []
    
    try {
      const analyses = volley.throws.map(t => t.analysis)
      return generateProfessionalRecommendations(analyses, volley.comparison)
    } catch (error) {
      console.error('Erreur génération recommandations:', error)
      return []
    }
  }, [volley])
  
  // Top 3 priorités
  const topPriorities = useMemo(() => {
    try {
      return getTopPriorities(proRecommendations)
    } catch (error) {
      console.error('Erreur génération top priorities:', error)
      return []
    }
  }, [proRecommendations])
  
  // Plan d'entraînement
  const trainingPlan = useMemo(() => {
    try {
      return generateTrainingPlan(proRecommendations)
    } catch (error) {
      console.error('Erreur génération plan:', error)
      return { week1: [], week2: [], week3: [], week4: [] }
    }
  }, [proRecommendations])
  
  // Résumé textuel de la comparaison
  const comparisonSummary = useMemo(() => {
    if (!volley) return ''
    return getComparisonSummary(volley.comparison)
  }, [volley])
  
  /**
   * Retour à l'accueil
   */
  const goBack = () => {
    window.location.hash = '#/'
  }
  
  /**
   * Nouvelle volée
   */
  const startNewVolley = () => {
    window.location.hash = '#/capture'
  }
  
  if (!volley) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Aucune volée à analyser
            </p>
            <Button onClick={goBack}>
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Calcul des scores moyens
  const avgTechnicalScore = volley.throws.reduce(
    (sum, t) => sum + t.analysis.technicalScore, 0
  ) / 3
  
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            
            <h1 className="text-xl font-bold">Analyse détaillée</h1>
            
            <Button onClick={startNewVolley} size="sm">
              Nouvelle volée
            </Button>
          </div>
          
          {/* Onglets de navigation */}
          <div className="flex gap-2">
            <Button
              variant={selectedView === 'summary' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('summary')}
            >
              <Target className="mr-2 h-4 w-4" />
              Résumé
            </Button>
            <Button
              variant={selectedView === 'charts' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('charts')}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Graphiques
            </Button>
            <Button
              variant={selectedView === 'data' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('data')}
            >
              <Table className="mr-2 h-4 w-4" />
              Données
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Vue Résumé */}
        {selectedView === 'summary' && (
        <div className="space-y-6">
          {/* TOP 3 Priorités */}
          {topPriorities.length > 0 && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  🎯 TOP 3 - Priorités absolues
                </CardTitle>
                <CardDescription>
                  Concentrez-vous sur ces 3 points en premier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeedbackCardPro recommendations={topPriorities} />
              </CardContent>
            </Card>
          )}
          
          {/* Recommandations complètes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analyse détaillée et recommandations
              </CardTitle>
              <CardDescription>
                Basé sur l'analyse biomécanique de joueurs professionnels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackCardPro recommendations={proRecommendations} />
            </CardContent>
          </Card>
          
          {/* Plan d'entraînement */}
          <TrainingPlan plan={trainingPlan} />
          
          {/* Scores principaux */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Scores globaux
              </CardTitle>
              <CardDescription>
                Évaluation de votre performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ScoreDisplay
                  score={volley.comparison.consistencyIndex}
                  label="Régularité"
                  size="lg"
                />
                <ScoreDisplay
                  score={avgTechnicalScore}
                  label="Technique moyenne"
                  size="lg"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Résumé de la comparaison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Résumé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm leading-relaxed">
                {comparisonSummary}
              </p>
            </CardContent>
          </Card>
          
          {/* Scores par indicateur */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Régularité par indicateur
              </CardTitle>
              <CardDescription>
                Cohérence entre vos 3 lancers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScoreGrid
                scores={[
                  { value: volley.comparison.elbowConsistency, label: 'Coude' },
                  { value: volley.comparison.wristConsistency, label: 'Poignet' },
                  { value: volley.comparison.shoulderConsistency, label: 'Épaule' },
                  { value: volley.comparison.trunkConsistency, label: 'Tronc' },
                  { value: volley.comparison.gazeConsistency, label: 'Visée' }
                ]}
                size="md"
              />
            </CardContent>
          </Card>
          
          {/* Détail des lancers */}
          <Card>
            <CardHeader>
              <CardTitle>Détail des lancers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {volley.throws.map((throwData, index) => {
                  const isReference = index === volley.comparison.referenceThrowIndex
                  
                  return (
                    <div
                      key={throwData.id}
                      className={`p-4 border rounded-lg ${
                        isReference ? 'border-primary bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant={isReference ? 'default' : 'secondary'}>
                            Lancer {index + 1}
                          </Badge>
                          {isReference && (
                            <Badge variant="success">Référence</Badge>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Score: {throwData.analysis.technicalScore}/100
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(throwData.duration / 1000).toFixed(1)}s
                          </p>
                        </div>
                      </div>
                      
                      {/* Mini grille de scores */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-background rounded">
                          <p className="text-muted-foreground">Coude</p>
                          <p className="font-medium">
                            {throwData.analysis.elbow.angleRange.amplitude.toFixed(0)}°
                          </p>
                        </div>
                        <div className="text-center p-2 bg-background rounded">
                          <p className="text-muted-foreground">Poignet</p>
                          <p className="font-medium">
                            {throwData.analysis.wrist.releaseAngle.toFixed(0)}°
                          </p>
                        </div>
                        <div className="text-center p-2 bg-background rounded">
                          <p className="text-muted-foreground">Tronc</p>
                          <p className="font-medium">
                            {throwData.analysis.trunk.inclination.toFixed(1)}°
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Points forts */}
          {recommendations && recommendations.strengths.length > 0 && (
            <Card className="border-success/20 bg-success/5">
              <CardHeader>
                <CardTitle className="text-success">✅ Points forts</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-success mt-1">•</span>
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          
          {/* Axes d'amélioration */}
          {recommendations && recommendations.mainIssues.length > 0 && (
            <Card className="border-warning/20 bg-warning/5">
              <CardHeader>
                <CardTitle className="text-warning">📌 Axes d'amélioration</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.mainIssues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-warning mt-1">•</span>
                      <span className="text-sm">{issue}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          
          {/* Recommandations détaillées */}
          {recommendations && (
            <Card>
              <CardHeader>
                <CardTitle>Recommandations détaillées</CardTitle>
                <CardDescription>
                  {recommendations.feedbacks.length} recommandation(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeedbackList feedbacks={recommendations.feedbacks} />
              </CardContent>
            </Card>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 justify-center pt-4">
            <Button onClick={startNewVolley} size="lg" className="min-w-[200px]">
              Nouvelle volée
            </Button>
            <Button onClick={goBack} variant="outline" size="lg">
              Retour à l'accueil
            </Button>
          </div>
        </div>
        )}
        
        {/* Vue Graphiques */}
        {selectedView === 'charts' && (
        <div className="space-y-6">
          {/* Comparaison visuelle des 3 lancers */}
          <ThrowComparison 
            throws={volley.throws as [Throw, Throw, Throw]}
            referenceIndex={volley.comparison.referenceThrowIndex}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Évolution des angles au fil du temps</CardTitle>
              <CardDescription>
                Visualisation frame par frame avec code couleur des phases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {volley.throws.map((throwData, index) => (
                  <div key={throwData.id} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge>Lancer {index + 1}</Badge>
                      {index === volley.comparison.referenceThrowIndex && (
                        <Badge variant="success">Référence</Badge>
                      )}
                    </div>
                    
                    <AngleChartGrid
                      charts={[
                        {
                          angles: throwData.analysis.elbow.angles,
                          title: 'Angle du coude',
                          color: '#3b82f6'
                        },
                        {
                          angles: throwData.analysis.wrist.angles,
                          title: 'Angle du poignet',
                          color: '#10b981'
                        }
                      ]}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Comparaison des 3 lancers sur un même graphique */}
          <Card>
            <CardHeader>
              <CardTitle>Comparaison des 3 lancers</CardTitle>
              <CardDescription>
                Superposition des courbes pour visualiser la régularité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Les 3 courbes devraient être similaires pour une bonne régularité
              </p>
              {/* TODO: Implémenter la superposition */}
              <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">
                Graphique de superposition à venir
              </div>
            </CardContent>
          </Card>
        </div>
        )}
        
        {/* Vue Données brutes */}
        {selectedView === 'data' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Données mesurées</CardTitle>
              <CardDescription>
                Valeurs brutes utilisées pour calculer les scores et recommandations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {volley.throws.map((throwData, index) => (
                  <DataTable
                    key={throwData.id}
                    analysis={throwData.analysis}
                    throwIndex={index + 1}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Statistiques de détection */}
          <Card>
            <CardHeader>
              <CardTitle>Qualité de la détection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {volley.throws.map((throwData, index) => {
                  const avgConfidence = throwData.analysis.elbow.angles.reduce(
                    (sum, a) => sum + a.confidence, 0
                  ) / throwData.analysis.elbow.angles.length
                  
                  return (
                    <div key={throwData.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <Badge>Lancer {index + 1}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {throwData.poses.length} frames · {throwData.analysis.phases.length} phases
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Confiance moyenne:</span>
                        <Badge variant={avgConfidence > 0.7 ? 'success' : avgConfidence > 0.5 ? 'warning' : 'error'}>
                          {(avgConfidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </main>
    </div>
  )
}
