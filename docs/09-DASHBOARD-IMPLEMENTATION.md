# 🛠️ Implémentation du Dashboard

## 📝 Vue d'ensemble

Le dashboard de TrakerDart est construit sur une architecture modulaire utilisant `react-grid-layout` pour la disposition responsive et `chart.js` pour la visualisation des données. Il est conçu pour être facilement extensible avec de nouveaux types de widgets.

## 🏗️ Architecture

### Composants Principaux

- **`DashboardLayout`** : Le conteneur principal qui gère la grille responsive.
  - Utilise une implémentation personnalisée de `WidthProvider` pour gérer le redimensionnement fluide.
  - Gère les points de rupture (breakpoints) pour mobile, tablette et desktop.
  - Accepte une liste de widgets et des callbacks pour les interactions.

- **`DashboardWidget`** : Le conteneur générique pour tous les widgets.
  - Gère l'affichage commun (Titre, Actions d'édition/suppression).
  - Supporte les images de fond et les effets de glassmorphism.
  - Gère les interactions (clic, survol).

- **`WidgetRenderer`** : Composant responsable du rendu du contenu spécifique de chaque widget en fonction de son type.

### Types de Widgets

1.  **StatWidget** (`type: 'stat'`)
    - Affiche une valeur clé, une tendance et une icône.
    - Supporte des couleurs thématiques (cyan, purple, orange, green).
    - Idéal pour les KPIs (Sessions totales, Score moyen, etc.).

2.  **ChartWidget** (`type: 'chart'`)
    - Intègre `react-chartjs-2` pour afficher des graphiques.
    - Supporte les types : ligne, barre, radar.
    - Configuré avec un thème sombre par défaut.

3.  **HeatmapWidget** (`type: 'calendar'`)
    - Affiche une carte thermique de l'activité (style GitHub).
    - Utilise `date-fns` pour la gestion des dates.
    - Affiche le nombre de sessions et le score moyen par jour.

## 🎨 Personnalisation UI/UX

### Design System

- **Thème** : Dark mode par défaut avec des accents néon (Cyan #22d3ee).
- **Glassmorphism** : Utilisation de `backdrop-blur` et de fonds semi-transparents (`bg-card/40`).
- **Typographie** : Police large et contrastée pour les valeurs importantes.

### Configuration des Widgets

Chaque widget possède une propriété `config` permettant de personnaliser :

- `color` : Couleur d'accentuation.
- `backgroundImage` : Image de fond (URL).
- `icon` : Icône Lucide-react.
- `days` : Nombre de jours pour la heatmap.
- `chartType` : Type de graphique.

## 🚀 Guide d'Utilisation

### Ajouter un nouveau widget

Pour ajouter un widget, il suffit de l'ajouter au tableau `widgets` dans `HomePage.tsx` :

```typescript
{
  id: "mon-nouveau-widget",
  type: "stat",
  title: "Mon Titre",
  position: { x: 0, y: 0, w: 3, h: 2 },
  config: {
    color: "purple",
    icon: <MyIcon />,
    backgroundImage: "/images/bg.png"
  },
  data: { value: 100, trend: 5 }
}
```

### Navigation

La navigation est gérée via le callback `onWidgetClick` dans `DashboardLayout`. Par défaut, les widgets de statistiques redirigent vers la page d'historique (`#/history`).

## 🔧 Détails Techniques

### Gestion du Responsive

Le dashboard utilise 5 points de rupture :

- `lg`: 1200px (12 colonnes)
- `md`: 996px (10 colonnes)
- `sm`: 768px (6 colonnes)
- `xs`: 480px (4 colonnes)
- `xxs`: 0px (2 colonnes)

### Performance

- Les graphiques sont optimisés pour ne pas re-rendre inutilement.
- Les images de fond sont gérées via CSS pour éviter les reflows.
- L'utilisation de `ResizeObserver` dans `WidthProvider` assure une adaptation fluide sans ralentir le thread principal.
