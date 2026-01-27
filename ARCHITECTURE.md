# Architecture technique - TrakerDart

## 🏛️ Vue d'ensemble

TrakerDart est une Progressive Web App (PWA) construite avec React et TypeScript, utilisant TensorFlow.js pour l'analyse biomécanique en temps réel.

## 📊 Architecture globale

```
┌─────────────────────────────────────────────────────────┐
│                     INTERFACE UTILISATEUR                │
│                  (React + TailwindCSS)                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Capture    │  │   Analyse    │  │  Historique  │  │
│  │    Vidéo     │  │ Biomécanique │  │     &        │  │
│  │              │  │              │  │  Progression │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                    COUCHE MÉTIER                         │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Détection   │  │    Calculs   │  │   Feedback   │  │
│  │   de Pose    │  │Biomécaniques │  │ Pédagogique  │  │
│  │(TensorFlow)  │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                   COUCHE DONNÉES                         │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Zustand    │  │  IndexedDB   │  │ LocalStorage │  │
│  │    Store     │  │  (Sessions)  │  │  (Préfs)     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 📁 Structure détaillée

### `/src/components`

**Composants React réutilisables**

- **`/ui`** - Composants de base (Button, Card, Progress, Badge...)
  - Basés sur shadcn/ui et Radix UI
  - Entièrement accessibles (ARIA)
  - Personnalisables via className

- **`/camera`** - Gestion de la capture vidéo
  - `CameraCapture.tsx` - Composant principal de capture
  - Gère les permissions et le flux vidéo
  - Affiche l'overlay de squelette

- **`/analysis`** - Affichage des analyses
  - `FeedbackCard.tsx` - Carte de recommandation
  - `ScoreDisplay.tsx` - Affichage circulaire des scores

### `/src/lib`

**Bibliothèques métier**

- **`/pose`** - Détection de pose avec TensorFlow.js
  - `detector.ts` - Interface avec MoveNet
  - Initialisation et configuration du modèle
  - Dessin du squelette sur canvas

- **`/biomechanics`** - Calculs biomécaniques
  - `angles.ts` - Calcul des angles articulaires
  - `phaseDetection.ts` - Découpage en phases
  - `analyzer.ts` - Orchestrateur d'analyse
  - `comparison.ts` - Comparaison inter-lancers

- **`/feedback`** - Génération de recommandations
  - `generator.ts` - Transforme les analyses en feedback pédagogique
  - Priorisation des corrections
  - Messages personnalisés selon le niveau

- **`/storage`** - Persistance des données
  - `indexedDB.ts` - Interface avec IndexedDB
  - Stockage des sessions et vidéos
  - Gestion du quota de stockage

- **`utils.ts`** - Fonctions utilitaires
  - Formatage de données
  - Calculs statistiques
  - Helpers divers

### `/src/store`

**State management avec Zustand**

- `useAppStore.ts` - Store global de l'application
  - Configuration caméra et calibration
  - Session en cours
  - Historique des sessions
  - États UI (recording, analyzing, errors)
  - Persistance automatique (localStorage)

### `/src/types`

**Définitions TypeScript**

- `index.ts` - Tous les types de l'application
  - Types de détection (Pose, Keypoint)
  - Types d'analyse (BiomechanicalAnalysis, etc.)
  - Types de données (Throw, Volley, Session)
  - Types UI (Feedback, Recommendations)

### `/src/hooks`

**Custom React Hooks**

- `useCamera.ts` - Gestion simplifiée de la caméra
- `usePoseDetection.ts` - Détection de pose en hook

### `/src/pages`

**Pages de l'application**

- `HomePage.tsx` - Page d'accueil avec dashboard
- (À venir: CapturePage, AnalysisPage, HistoryPage)

## 🔄 Flux de données

### 1. Capture d'une volée

```
Utilisateur démarre l'enregistrement
           ↓
    Activation caméra
           ↓
Détection de pose en temps réel (TensorFlow.js)
           ↓
  Stockage des Poses[] pour chaque lancer
           ↓
    Fin de la volée (3 lancers)
```

### 2. Analyse biomécanique

```
       Poses[] × 3 lancers
              ↓
    Détection des phases du mouvement
              ↓
    Calcul des angles articulaires
              ↓
   Analyse par indicateur (coude, poignet, etc.)
              ↓
      BiomechanicalAnalysis × 3
              ↓
    Comparaison des 3 lancers
              ↓
        VolleyComparison
```

### 3. Génération de feedback

```
   BiomechanicalAnalysis[] + VolleyComparison
                  ↓
        Analyse des défauts détectés
                  ↓
       Priorisation des corrections
                  ↓
      Génération des messages pédagogiques
                  ↓
             Recommendations
```

### 4. Stockage

```
      Volley complète
            ↓
   Sauvegarde IndexedDB
            ↓
     Ajout à la session
            ↓
  Mise à jour des statistiques
            ↓
   Persistance automatique (Zustand)
```

## 🧠 Algorithmes clés

### Détection des phases du mouvement

1. **Extraction des caractéristiques**
   - Angle du coude frame par frame
   - Vélocité du poignet

2. **Identification des événements**
   - Angle minimal du coude → fin d'armement
   - Pic de vélocité → relâchement

3. **Segmentation temporelle**
   - Préparation (0-30%)
   - Armement (jusqu'à angle min)
   - Accélération (angle min → pic vélocité)
   - Relâchement (pic vélocité ± 3 frames)
   - Follow-through (reste)

### Calcul de régularité

**Formule du coefficient de variation (CV):**

```
CV = écart-type / moyenne
```

**Score de régularité (0-100):**

```
Score = max(0, 100 - CV × facteur)
```

Facteurs selon l'indicateur:
- Coude: 500 (très sensible)
- Poignet: 400
- Épaule: 300
- Tronc: 500

### Score technique global

**Formule:**

```
Score = 100
  - pénalité_coude (max 15)
  - pénalité_poignet (max 15)
  - pénalité_épaule (max 15)
  - pénalité_tronc (max 20)
  - pénalité_visée (max 15)
  + bonus_fluidité (max 5)
```

## 🎯 Modèle de détection

**MoveNet** (Google TensorFlow.js)

- **Version:** Single Pose Lightning
- **Performances:** ~50ms sur mobile moderne
- **Précision:** 17 keypoints détectés
- **Avantages:**
  - Optimisé pour mobile
  - Fonctionne en temps réel
  - Pas de GPU obligatoire
  - Modèle léger (~13MB)

**Keypoints détectés:**
- Tête: nez, yeux, oreilles
- Tronc: épaules, hanches
- Bras: coudes, poignets
- Jambes: genoux, chevilles

## 💾 Stockage des données

### IndexedDB

**Store `sessions`**
```typescript
{
  id: string
  volleys: Volley[]
  stats: SessionStats
  createdAt: number
  endedAt?: number
}
```

**Store `videos`**
```typescript
{
  id: string
  blob: Blob
  createdAt: number
}
```

### LocalStorage (via Zustand persist)

- Configuration caméra
- Calibration
- Préférences utilisateur
- Historique des sessions (métadonnées uniquement)

## 🔐 Sécurité et confidentialité

- ✅ **Aucun serveur distant** - Tout est local
- ✅ **Pas de télémétrie** - Aucune donnée envoyée
- ✅ **Contrôle utilisateur** - Suppression complète possible
- ✅ **Permissions** - Demande explicite pour caméra
- ✅ **HTTPS/localhost** - Requis pour MediaDevices API

## ⚡ Optimisations

### Performances

1. **Code splitting** - Chunks séparés (React, TensorFlow, UI)
2. **Lazy loading** - Chargement à la demande
3. **Memoization** - React.memo sur composants lourds
4. **Throttling** - Limitation FPS de détection si besoin
5. **Canvas optimization** - Réutilisation, pas de recréation

### PWA

1. **Service Worker** - Cache des assets
2. **App manifest** - Installation mobile
3. **Offline first** - Fonctionnement sans réseau
4. **Assets précachés** - Chargement instantané

## 🧪 Tests (à venir)

- **Unit tests** - Vitest
- **Component tests** - React Testing Library
- **E2E tests** - Playwright
- **Performance tests** - Lighthouse CI

## 📈 Évolutions futures

### Phase 2
- Enregistrement vidéo complet
- Replay au ralenti
- Overlay des trajectoires
- Comparaison avec référence (pro)

### Phase 3
- Mode multi-joueurs
- Statistiques avancées
- Export PDF des analyses
- Intégration tableaux de score

### Phase 4
- IA prédictive (trajectoire estimée)
- Détection automatique de la cible
- Scoring automatique
- Coach virtuel IA

## 🛠️ Outils de développement

- **Vite** - Build ultra-rapide, HMR
- **TypeScript** - Typage strict
- **ESLint** - Qualité de code
- **Prettier** - Formatage automatique
- **Git hooks** - Validation pre-commit

## 📚 Documentation

- `README.md` - Vue d'ensemble
- `QUICKSTART.md` - Guide de démarrage
- `ARCHITECTURE.md` - Ce document
- `CONTRIBUTING.md` - Guide de contribution (à venir)
