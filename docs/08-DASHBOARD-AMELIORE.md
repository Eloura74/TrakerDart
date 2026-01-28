# 📊 Dashboard Amélioré

## 🎯 Objectif

Créer un tableau de bord interactif et personnalisable pour visualiser les performances et progressions.

## 🎨 Fonctionnalités

### 1. Widgets Personnalisables

```typescript
interface DashboardWidget {
  id: string;
  type: 'chart' | 'stat' | 'calendar' | 'radar' | 'list';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: WidgetConfig;
  data: any;
}

const AVAILABLE_WIDGETS: WidgetTemplate[] = [
  { type: 'stat', title: 'Score Moyen', icon: <TrendingUp />, size: { w: 2, h: 1 } },
  { type: 'chart', title: 'Évolution 30j', icon: <LineChart />, size: { w: 4, h: 2 } },
  { type: 'radar', title: 'Analyse Technique', icon: <Target />, size: { w: 3, h: 3 } },
  { type: 'calendar', title: 'Heatmap', icon: <Calendar />, size: { w: 4, h: 2 } },
  { type: 'list', title: 'Objectifs', icon: <CheckCircle />, size: { w: 2, h: 3 } }
];

export function DashboardEditor({ onSave }: DashboardEditorProps) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="relative">
      <DashboardToolbar
        editMode={editMode}
        onToggleEdit={() => setEditMode(!editMode)}
        onAddWidget={handleAddWidget}
      />

      <GridLayout
        cols={12}
        rowHeight={80}
        width={1200}
        isDraggable={editMode}
        isResizable={editMode}
        onLayoutChange={handleLayoutChange}
      >
        {widgets.map(widget => (
          <div key={widget.id} data-grid={widget.position}>
            <WidgetRenderer widget={widget} editMode={editMode} />
          </div>
        ))}
      </GridLayout>
    </div>
  );
}
```

### 2. Graphiques Interactifs

```typescript
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';

// Graphique d'évolution avec zoom/pan
export function EvolutionChart({ data, period }: EvolutionChartProps) {
  const chartRef = useRef<any>();

  const options = {
    responsive: true,
    plugins: {
      zoom: {
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: 'x' as const
        },
        pan: {
          enabled: true,
          mode: 'x' as const
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const trend = calculateTrend(context.dataIndex, data);
            return `${label}: ${value} (${trend > 0 ? '+' : ''}${trend}%)`;
          }
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false
    }
  };

  return (
    <div className="relative">
      <Line ref={chartRef} data={chartData} options={options} />
      <ChartControls
        onReset={() => chartRef.current?.resetZoom()}
        onExport={() => exportChart(chartRef.current)}
      />
    </div>
  );
}
```

### 3. Calendrier Heatmap

```typescript
interface HeatmapData {
  date: Date;
  value: number;
  sessions: number;
}

export function SessionHeatmap({ data }: SessionHeatmapProps) {
  const getColor = (value: number) => {
    if (value === 0) return '#1a1a1a';
    if (value < 50) return '#0a4d4d';
    if (value < 75) return '#00a896';
    if (value < 90) return '#00f2ff';
    return '#00ffaa';
  };

  return (
    <div className="grid grid-cols-53 gap-1">
      {data.map((day, idx) => (
        <Tooltip key={idx} content={`${day.date.toLocaleDateString()} - ${day.value}%`}>
          <div
            className="aspect-square rounded-sm cursor-pointer hover:ring-2 ring-cyan-400 transition-all"
            style={{ backgroundColor: getColor(day.value) }}
            onClick={() => onDayClick(day)}
          />
        </Tooltip>
      ))}
    </div>
  );
}
```

### 4. Statistiques en Temps Réel

```typescript
export function LiveStats() {
  const { sessions } = useAppStore();
  const [stats, setStats] = useState<DashboardStats>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        todayScore: calculateTodayScore(sessions),
        weekStreak: calculateStreak(sessions),
        improvement: calculateImprovement(sessions),
        nextGoal: getNextGoal(sessions)
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [sessions]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title="Aujourd'hui"
        value={stats.todayScore}
        icon={<Target />}
        trend={stats.improvement}
        color="cyan"
      />
      <StatCard
        title="Série"
        value={`${stats.weekStreak} jours`}
        icon={<Flame />}
        color="orange"
      />
      {/* ... */}
    </div>
  );
}
```

### 5. Objectifs & Progression

```typescript
interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: Date;
  type: 'consistency' | 'technique' | 'sessions';
}

export function GoalsWidget({ goals }: GoalsWidgetProps) {
  return (
    <div className="space-y-3">
      {goals.map(goal => {
        const progress = (goal.current / goal.target) * 100;
        const isCompleted = progress >= 100;
        const daysLeft = Math.ceil((goal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        return (
          <Card key={goal.id} className={isCompleted ? 'border-green-500' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{goal.title}</h4>
                {isCompleted && <CheckCircle className="text-green-500" />}
              </div>

              <Progress value={progress} className="mb-2" />

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{goal.current} / {goal.target}</span>
                <span>{daysLeft} jours restants</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
```

## 📦 Dépendances

```json
{
  "react-grid-layout": "^1.4.4",
  "chart.js": "^4.4.1",
  "react-chartjs-2": "^5.2.0",
  "chartjs-plugin-zoom": "^2.0.1",
  "date-fns": "^3.0.0"
}
```

## ✅ Checklist

- [x] Système de widgets drag & drop ✅ **IMPLÉMENTÉ**
- [x] Types de widgets (Stat, Chart, Heatmap) ✅ **IMPLÉMENTÉ**
- [x] Graphiques interactifs ✅ **IMPLÉMENTÉ**
- [x] Calendrier heatmap ✅ **IMPLÉMENTÉ**
- [x] Stats temps réel (via Store) ✅ **IMPLÉMENTÉ**
- [x] Interface d'édition (DashboardEditor) ✅ **IMPLÉMENTÉ**
- [ ] Système d'objectifs
- [ ] Profils dashboard sauvegardés
- [ ] Export dashboard en image
- [x] Responsive mobile ✅ **IMPLÉMENTÉ**

---

**Difficulté** : ⭐⭐ Moyenne  
**Durée** : 2-3 semaines  
**Impact** : 💰💰💰 Élevé
