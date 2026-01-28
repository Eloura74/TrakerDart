# 📊 Comparaison de Sessions

## 🎯 Objectif

Permettre aux utilisateurs de comparer leurs performances entre différentes sessions d'entraînement pour visualiser leur progression et identifier les domaines d'amélioration.

## 🎨 Fonctionnalités

### 1. Sélection de Sessions

- Interface de sélection multiple de sessions (checkboxes)
- Filtres par date, score, type d'entraînement
- Présets : "7 derniers jours", "Ce mois", "Meilleur vs Pire"

### 2. Graphiques de Comparaison

#### Évolution Temporelle

```typescript
interface SessionComparison {
  sessions: TrainingSession[];
  metrics: ComparisonMetrics;
  charts: ChartData[];
}

interface ComparisonMetrics {
  consistencyTrend: number[]; // Évolution régularité
  technicalScoreTrend: number[]; // Évolution score technique
  elbowAngleTrend: number[]; // Évolution angle coude
  improvementRate: number; // Taux d'amélioration %
  bestMetrics: MetricSnapshot; // Meilleurs métriques
  worstMetrics: MetricSnapshot; // Pires métriques
}
```

#### Types de Graphiques

- **Ligne** : Évolution dans le temps
- **Radar** : Comparaison multi-critères
- **Barres** : Comparaison directe de métriques
- **Heatmap** : Performance par jour/heure

### 3. Tableau Comparatif

| Session   | Date  | Régularité | Technique | Coude | Poignet | Épaule | Tendance |
| --------- | ----- | ---------- | --------- | ----- | ------- | ------ | -------- |
| Session 1 | 20/01 | 85%        | 92        | ✅    | ⚠️      | ✅     | ↗️ +5%   |
| Session 2 | 22/01 | 78%        | 88        | ⚠️    | ✅      | ✅     | ↘️ -3%   |
| Session 3 | 24/01 | 92%        | 95        | ✅    | ✅      | ✅     | ↗️ +8%   |

### 4. Statistiques Avancées

```typescript
interface AdvancedStats {
  // Tendances
  weekOverWeekChange: number;
  monthOverMonthChange: number;
  bestStreak: number; // Meilleure série de sessions
  currentStreak: number;

  // Patterns
  bestDayOfWeek: string;
  bestTimeOfDay: string;
  consistencyStdDev: number;

  // Prédictions
  predictedNextScore: number;
  estimatedGoalDate: Date;
}
```

## 💻 Implémentation

### Composants React

```typescript
// src/components/comparison/SessionComparison.tsx
interface SessionComparisonProps {
  sessions: TrainingSession[];
  onSessionSelect: (ids: string[]) => void;
}

export function SessionComparison({ sessions, onSessionSelect }: SessionComparisonProps) {
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonMetrics | null>(null);

  useEffect(() => {
    if (selectedSessions.length >= 2) {
      const data = compareSessionsMetrics(
        sessions.filter(s => selectedSessions.includes(s.id))
      );
      setComparisonData(data);
    }
  }, [selectedSessions, sessions]);

  return (
    <div className="space-y-6">
      <SessionSelector
        sessions={sessions}
        selected={selectedSessions}
        onChange={setSelectedSessions}
      />

      {comparisonData && (
        <>
          <ComparisonCharts data={comparisonData} />
          <ComparisonTable data={comparisonData} />
          <StatsSummary data={comparisonData} />
        </>
      )}
    </div>
  );
}
```

### Logique de Comparaison

```typescript
// src/lib/comparison/sessionComparator.ts

export function compareSessionsMetrics(
  sessions: TrainingSession[],
): ComparisonMetrics {
  // Trier par date
  const sorted = sessions.sort((a, b) => a.createdAt - b.createdAt);

  // Calculer les tendances
  const consistencyTrend = sorted.map((s) => s.stats.averageConsistency);
  const technicalScoreTrend = sorted.map((s) => s.stats.averageTechnicalScore);

  // Calculer taux d'amélioration
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const improvementRate =
    ((last.stats.averageConsistency - first.stats.averageConsistency) /
      first.stats.averageConsistency) *
    100;

  // Identifier meilleurs/pires
  const bestMetrics = findBestMetrics(sorted);
  const worstMetrics = findWorstMetrics(sorted);

  // Calculer angles moyens
  const elbowAngleTrend = sorted.map((s) =>
    calculateAverageElbowAngle(s.volleys),
  );

  return {
    consistencyTrend,
    technicalScoreTrend,
    elbowAngleTrend,
    improvementRate,
    bestMetrics,
    worstMetrics,
  };
}

function calculateAverageElbowAngle(volleys: Volley[]): number {
  const angles = volleys.flatMap((v) =>
    v.throws.map((t) => t.analysis.elbow.averageAngle),
  );
  return angles.reduce((sum, a) => sum + a, 0) / angles.length;
}
```

### Graphiques avec Recharts

```typescript
// src/components/comparison/ComparisonCharts.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export function EvolutionChart({ data }: { data: ComparisonMetrics }) {
  const chartData = data.consistencyTrend.map((value, index) => ({
    session: `S${index + 1}`,
    regularite: value,
    technique: data.technicalScoreTrend[index]
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution dans le temps</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart width={800} height={400} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="session" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333'
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="regularite"
            stroke="#00f2ff"
            strokeWidth={2}
            name="Régularité"
          />
          <Line
            type="monotone"
            dataKey="technique"
            stroke="#ff0055"
            strokeWidth={2}
            name="Technique"
          />
        </LineChart>
      </CardContent>
    </Card>
  );
}
```

## 🎨 UI/UX

### Layout Desktop

```
┌─────────────────────────────────────────────────┐
│  📊 Comparaison de Sessions                     │
├─────────────────────────────────────────────────┤
│  Sélection: [Session 1] [Session 3] [Session 5]│
│  Filtres: [7 jours] [Ce mois] [Personnalisé]   │
├─────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌─────────────────────┐ │
│  │  Graphique       │  │  Radar              │ │
│  │  Évolution       │  │  Multi-critères     │ │
│  └──────────────────┘  └─────────────────────┘ │
├─────────────────────────────────────────────────┤
│  Tableau Comparatif                             │
│  [Session | Date | Régularité | Technique ...]  │
└─────────────────────────────────────────────────┘
```

### Design Mobile

- Sélection en drawer/modal
- Graphiques en scroll horizontal
- Tableau en mode cards empilées

## 📦 Dépendances

```json
{
  "recharts": "^2.10.0",
  "date-fns": "^3.0.0",
  "lodash": "^4.17.21"
}
```

## ✅ Checklist d'Implémentation

- [x] Composant SessionSelector avec multi-select ✅ **IMPLÉMENTÉ**
- [x] Fonction compareSessionsMetrics() ✅ **IMPLÉMENTÉ**
- [x] Créer la page de comparaison (`src/pages/ComparisonPage.tsx`) ✅ **IMPLÉMENTÉ**
- [x] Créer le sélecteur de sessions (`src/components/comparison/SessionSelector.tsx`) ✅ **IMPLÉMENTÉ**
- [x] Créer les graphiques comparatifs (`src/components/comparison/ComparisonCharts.tsx`) ✅ **IMPLÉMENTÉ**
- [x] Créer le tableau de statistiques (`src/components/comparison/ComparisonTable.tsx`) ✅ **IMPLÉMENTÉ**
- [x] Ajouter la route dans `App.tsx` E2E avec Playwright ✅ **IMPLÉMENTÉ**

## 🎯 Métriques de Succès

- ✅ 70%+ utilisateurs utilisent la comparaison
- ✅ Temps moyen sur page > 3 minutes
- ✅ Rétention +20% avec fonctionnalité
- ✅ NPS > 8/10 sur cette feature

## 📝 Notes Techniques

- Utiliser `useMemo` pour calculs lourds
- Cache des comparaisons dans IndexedDB
- Lazy loading des graphiques
- Virtualisation du tableau si > 50 sessions

---

**Difficulté** : ⭐⭐ Moyenne  
**Durée estimée** : 2-3 semaines  
**Impact utilisateur** : 💰💰💰 Élevé
