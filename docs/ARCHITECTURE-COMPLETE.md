# 🏗️ Architecture Complète TrakerDart
## Analyse des Fonctionnalités et Plan d'Implémentation

> **Dernière mise à jour** : 28 janvier 2026 - 13h17  
> **Statut Projet** : EN DÉVELOPPEMENT ACTIF (85% Premium + UI complète)

---

## 📊 Vue d'Ensemble du Projet

**TrakerDart** est une application web d'analyse biomécanique pour fléchettes utilisant:
- **Vision par ordinateur** (MediaPipe/TensorFlow.js)
- **IA générative** (Transformers.js, potentiellement Ollama)
- **Analyse en temps réel** avec feedback coaching
- **Modèle freemium** avec 3 tiers (Gratuit/Pro/Elite)

---

## ✅ ÉTAT ACTUEL (Janvier 2026)

### Fonctionnalités 100% Opérationnelles

#### 1. **Unification Visuelle** ✅
- Mode dark forcé avec variables CSS
- Design system premium uniforme (glassmorphism, glow effects)
- 9 pages uniformisées avec AppHeader moderne
- Palette cyan/noir/blanc cohérente

#### 2. **Modèle Premium** ✅ (85%)
- Architecture complète (types, config, services)
- 3 tiers configurés avec feature gating
- Pages: PricingPage, DevPage, SubscriptionPage
- Base Supabase (3 tables + RLS + functions)
- Mode dev actif (VITE_DEV_MODE=true)
- **Reste**: Intégration feature gating dans features existantes

#### 3. **Capture & Analyse Basique** ✅
- Détection pose MediaPipe
- Analyse biomécanique (angles articulations)
- Calcul régularité/score technique
- Replay 3D avec skeleton
- Dashboard avec widgets

#### 4. **Comparaison Sessions** ✅
- Sélection multi-sessions
- Graphiques d'évolution (Recharts)
- Analyse de similarité DTW
- Détection patterns et tendances

#### 5. **Export Basique** ✅ (Partiel)
- Export CSV/JSON ✅
- Export PDF avec graphiques ✅
- Export vidéo annotée ❌ (planifié)

---

## 🚧 FONCTIONNALITÉS À DÉVELOPPER

### 🔴 PRIORITÉ HAUTE (Q1 2026)

#### 1. **Feature Gating Complet** (1-2 jours)
**Objectif** : Intégrer le modèle premium dans toute l'app

**Actions**:
```typescript
// Protéger création de sessions
const access = await checkAndTrackFeature('sessions_per_month');
if (!access.hasAccess) {
  showPaywall('Limite atteinte', 'sessions_per_month');
  return;
}

// Protéger exports PDF
const pdfAccess = await checkAndTrackFeature('pdf_exports');

// Protéger exports vidéo avec résolution
const videoAccess = await checkAndTrackFeature('video_export_1080p');
```

**Fichiers à modifier**:
- `src/pages/CapturePage*.tsx` - Vérifier limite sessions
- `src/components/export/ExportDialog.tsx` - Gating exports
- `src/components/comparison/SessionSelector.tsx` - Limite comparaison
- `src/pages/HomePage.tsx` - Afficher usage/limites

**Dépendances**: Aucune nouvelle (déjà en place)

---

#### 2. **Coaching Virtuel Temps Réel** (4-6 semaines)
**Objectif** : Feedback instantané pendant la capture

**Architecture**:
```
src/
├── services/
│   ├── realtimeCoach.ts         # Analyse temps réel
│   ├── audioCoach.ts            # Feedback audio (Web Audio API)
│   └── hapticCoach.ts           # Vibrations mobile
├── components/
│   └── coaching/
│       ├── CoachingOverlay.tsx  # Overlay visuel
│       ├── DirectionalArrow.tsx # Flèches guidage
│       └── GuidedPractice.tsx   # Mode pratique guidée
└── hooks/
    └── useRealtimeCoaching.ts   # Hook coaching
```

**Fonctionnalités**:
- ✅ Détection erreurs critiques (coude, épaules, regard)
- ✅ Overlay visuel avec highlights articulations
- ✅ Feedback audio (préenregistré + TTS)
- ✅ Patterns vibration mobile
- ✅ Coaching adaptatif selon niveau utilisateur
- ✅ Mode pratique guidée (exercices progressifs)

**Dépendances**:
```json
{
  "framer-motion": "^11.0.0",
  "tone": "^14.8.0"
}
```

**Métriques de performance**:
- Latence feedback < 100ms
- Maintien 60 FPS pendant coaching
- Cooldown 2s entre feedbacks (éviter spam)

---

#### 3. **Export Vidéo Annotée** (2-3 semaines)
**Objectif** : Exporter replays avec overlays biomécaniques

**Architecture**:
```typescript
interface VideoExportOptions {
  resolution: '720p' | '1080p' | '4K';
  fps: 30 | 60;
  codec: 'h264' | 'h265';
  overlays: VideoOverlay[];
  slowMotion: boolean;
}

// Utilisation FFmpeg.wasm pour encoding
async function exportAnnotatedVideo(
  volley: Volley,
  options: VideoExportOptions
): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  
  // 1. Générer frames du replay
  const frames = await generateReplayFrames(volley.throws);
  
  // 2. Ajouter overlays (skeleton, angles, scores)
  const annotatedFrames = await addOverlays(frames, options.overlays);
  
  // 3. Encoder vidéo
  return ffmpeg.encode({
    frames: annotatedFrames,
    fps: options.fps,
    codec: options.codec
  });
}
```

**Overlays disponibles**:
- Skeleton pose (lignes articulées)
- Angles en temps réel (coude, poignet, épaule)
- Score technique dynamique
- Texte personnalisé
- Slow motion sur phase critique

**Feature gating**:
- Gratuit: ❌ Pas d'export vidéo
- Pro: 720p (5 vidéos/mois)
- Elite: 1080p + 4K illimité

**Dépendances**:
```json
{
  "@ffmpeg/ffmpeg": "^0.12.10",
  "@ffmpeg/util": "^0.12.1"
}
```

---

### 🟡 PRIORITÉ MOYENNE (Q2 2026)

#### 4. **IA Générative** (6-8 semaines)
**Objectif** : Recommandations personnalisées et analyse prédictive

**Modules**:

##### A. Recommandations IA
```typescript
class AIRecommendationEngine {
  async generateRecommendations(
    userProfile: UserProfile,
    sessions: TrainingSession[]
  ): Promise<AIRecommendation[]> {
    // Analyser patterns utilisateur
    const patterns = this.analyzePatterns(sessions);
    
    // Générer avec Transformers.js (modèle local)
    const model = await pipeline('text-generation', 'Xenova/gpt2');
    const prompt = this.buildPrompt(userProfile, patterns);
    
    return this.parseRecommendations(await model(prompt));
  }
}
```

##### B. Plans d'Entraînement Auto
```typescript
interface TrainingPlan {
  duration: number;              // Jours
  goal: string;                  // Objectif (ex: +15% régularité)
  weeks: TrainingWeek[];         // Plan semaine par semaine
  expectedImprovement: number;   // Prédiction
}

// Génération adaptée au niveau et temps disponible
const plan = await AITrainingPlanner.generatePlan(
  currentLevel: 75,
  targetGoal: 'Atteindre 90% régularité',
  availableTime: 3 // heures/semaine
);
```

##### C. Prédiction Performance
```typescript
// Modèle TensorFlow.js pour prédire score futur
class PerformancePredictor {
  private model: tf.LayersModel;
  
  async predict(recentSessions: TrainingSession[]) {
    const features = this.extractFeatures(recentSessions);
    
    return {
      nextSessionScore: 88.5,
      confidence: 0.85,
      in7Days: 89.2,
      in30Days: 91.8,
      factors: ['Amélioration angle coude', 'Constance épaules']
    };
  }
}
```

##### D. Chatbot Coach
```typescript
// Option 1: Ollama local (gratuit, privé)
// Option 2: OpenAI API (payant, cloud)
class AICoachChatbot {
  async chat(userMessage: string, context: UserContext) {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        model: 'llama2',
        prompt: this.buildChatPrompt(userMessage, context)
      })
    });
    
    return response.json().response;
  }
}
```

**Dépendances**:
```json
{
  "@xenova/transformers": "^2.9.0",
  "@tensorflow/tfjs": "^4.15.0",
  "ollama": "^0.5.0"
}
```

**Feature gating**:
- Gratuit: ❌ Pas d'IA
- Pro: 20 requêtes/mois
- Elite: Illimité

---

#### 5. **Reconnaissance Gestuelle Avancée** (4-6 semaines)
**Objectif** : Classification types de lancers + détection erreurs

**Fonctionnalités**:

##### A. Classification Type de Lancer
```typescript
enum ThrowType {
  STANDARD = 'standard',    // Lancer classique
  PUSH = 'push',           // Lancer poussé
  PENDULUM = 'pendulum',   // Balancier
  SNAP = 'snap',           // Fouetté
  HYBRID = 'hybrid'        // Hybride
}

// Modèle LSTM pour classifier séquence
const classifier = new ThrowClassifier();
const result = await classifier.classifyThrow(poses);
// => { type: 'standard', confidence: 0.92 }
```

##### B. Détection 15+ Erreurs Courantes
```typescript
const ERROR_PATTERNS = {
  'elbow-drop': {
    detector: (poses) => calculateElbowDrop(poses) > 50,
    severity: 'high',
    correction: 'Maintenez le coude à hauteur constante'
  },
  'shoulder-rotation': {
    detector: (poses) => Math.abs(calculateShoulderRotation(poses)) > 20,
    severity: 'medium',
    correction: 'Gardez les épaules parallèles'
  },
  // ... 13 autres erreurs
};
```

##### C. Comparaison avec Joueurs Pro
```typescript
// Base de données de mouvements pros (MVG, Wright, Price, etc.)
class ProComparisonEngine {
  async compareWithPros(userPoses: Pose[]) {
    // DTW (Dynamic Time Warping) pour similarité
    const bestMatch = this.findMostSimilarPro(userPoses);
    
    return {
      similarity: 87,
      proPlayer: 'Michael van Gerwen',
      differences: [
        'Angle coude plus ouvert (+12°)',
        'Release plus tardif (+50ms)'
      ],
      learningPoints: [
        'Concentrez-vous sur un coude plus compact',
        'Accélérez légèrement la phase de release'
      ]
    };
  }
}
```

**Dépendances**:
```json
{
  "@tensorflow/tfjs": "^4.15.0",
  "@mediapipe/hands": "^0.4.1",
  "ml-dtw": "^1.0.0"
}
```

---

#### 6. **Rapports Détaillés** (2-3 semaines)
**Objectif** : Génération rapports professionnels multi-formats

**Types de Rapports**:

##### A. Rapport Session
```typescript
interface SessionReport {
  summary: SessionSummary;              // Résumé chiffres clés
  biomechanics: BiomechanicsSection;    // Analyse articulations
  progress: ProgressSection;            // Évolution vs sessions précédentes
  recommendations: RecommendationSection; // 3-5 conseils personnalisés
  charts: ChartSection[];               // Graphiques visuels
}
```

##### B. Rapport Comparatif Multi-Sessions
```typescript
// Rapport sur période (7j, 30j, personnalisé)
const report = generateComparisonReport(
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-01-28')
);

// Contient:
// - Évolution métriques clés
// - Meilleure/pire session
// - Insights automatiques IA
// - Tendances et prédictions
```

##### C. Export Multi-Formats
```typescript
interface ExportOptions {
  format: 'pdf' | 'html' | 'docx' | 'json';
  template: 'standard' | 'coach' | 'scientific';
  language: 'fr' | 'en';
  includeImages: boolean;
  includeRawData: boolean;
}

// Templates disponibles:
// - Standard: Grand public
// - Coach: Pour entraîneurs pros
// - Scientific: Format académique/recherche
```

##### D. Rapports Automatiques Programmés
```typescript
// Envoi email automatique hebdo/mensuel
const scheduled = new ReportScheduler();
scheduled.scheduleReport({
  frequency: 'weekly',      // Chaque lundi 8h
  recipients: ['user@email.com'],
  format: { format: 'pdf', template: 'standard' },
  filters: { minConsistency: 70 } // Seulement si > 70%
});
```

**Dépendances**:
```json
{
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.8.0",
  "docx": "^8.5.0",
  "node-cron": "^3.0.3",
  "resend": "^3.0.0"
}
```

**Feature gating**:
- Gratuit: Rapport basique session uniquement
- Pro: Rapports complets + export PDF
- Elite: Tous formats + programmation auto

---

### 🔵 PRIORITÉ BASSE (Q3 2026)

#### 7. **Calibration Avancée** (3-4 semaines)
**Objectif** : Calibration automatique précise

**Fonctionnalités**:
- Détection automatique distance (via taille visage)
- Support marqueurs ArUco pour calibration spatiale
- Analyse conditions éclairage
- Multi-caméras synchronisées
- Assistant calibration guidé (wizard 4 étapes)

**Dépendances**:
```json
{
  "@techstark/opencv-js": "^4.9.0",
  "three": "^0.160.0"
}
```

---

## 🏗️ ARCHITECTURE TECHNIQUE COMPLÈTE

### Stack Technologique

```
Frontend:
├── React 18 + TypeScript 5
├── Vite 5 (build tool)
├── TailwindCSS + shadcn/ui (design system)
├── Zustand 4 (state management)
├── Framer Motion 11 (animations)
└── React Router (navigation)

Vision & IA:
├── MediaPipe Pose Detection
├── TensorFlow.js 4
├── Transformers.js 2 (LLMs locaux)
└── Ollama (optionnel - chatbot local)

Visualisation:
├── Recharts 2 (graphiques)
├── Three.js (replay 3D)
└── Chart.js + plugins

Backend & Data:
├── Supabase (PostgreSQL + Auth + Storage + RLS)
├── Edge Functions (webhooks PayPal)
└── IndexedDB (cache local)

Exports:
├── jsPDF + html2canvas (PDF)
├── FFmpeg.wasm (vidéo)
└── QRCode (partage)

Paiements:
└── PayPal SDK (abonnements récurrents)
```

### Structure Projet

```
TrakerDart/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui base
│   │   ├── subscription/          # ✅ Composants premium
│   │   ├── coaching/              # ⏳ Coaching temps réel
│   │   ├── comparison/            # ✅ Comparaison sessions
│   │   ├── export/                # 🔄 Exports (PDF fait, vidéo à faire)
│   │   ├── dashboard/             # ✅ Widgets dashboard
│   │   └── capture/               # ✅ Capture & analyse
│   │
│   ├── pages/
│   │   ├── HomePage.tsx           # ✅ Dashboard widgets
│   │   ├── HistoryPage.tsx        # ✅ Historique sessions
│   │   ├── CapturePage*.tsx       # ✅ Capture (auto/manuel)
│   │   ├── AnalysisPage.tsx       # ✅ Analyse détaillée
│   │   ├── ComparisonPage.tsx     # ✅ Comparaison
│   │   ├── PricingPage.tsx        # ✅ Page pricing
│   │   ├── SubscriptionPage.tsx   # ✅ Gestion abonnement
│   │   └── DevPage.tsx            # ✅ Test tiers (dev)
│   │
│   ├── services/
│   │   ├── subscription.ts        # ✅ Gestion abonnements
│   │   ├── featureGate.ts         # ✅ Feature gating
│   │   ├── realtimeCoach.ts       # ⏳ À créer
│   │   ├── aiRecommendations.ts   # ⏳ À créer
│   │   ├── videoExport.ts         # ⏳ À créer
│   │   └── reportGenerator.ts     # ⏳ À créer
│   │
│   ├── hooks/
│   │   ├── useFeatureGate.ts      # ✅ Hook feature gating
│   │   ├── useRealtimeCoaching.ts # ⏳ À créer
│   │   └── usePoseDetection.ts    # ✅ Détection pose
│   │
│   ├── config/
│   │   ├── features.ts            # ✅ Config features premium
│   │   └── exercises.ts           # ⏳ Exercices guidés
│   │
│   ├── types/
│   │   ├── subscription.ts        # ✅ Types premium
│   │   ├── coaching.ts            # ⏳ À créer
│   │   └── ai.ts                  # ⏳ À créer
│   │
│   └── store/
│       └── appStore.ts            # ✅ Zustand store global
│
├── supabase/
│   ├── migrations/
│   │   └── 20260128_create_subscriptions.sql # ✅ Tables premium
│   └── functions/                 # ⏳ Edge functions PayPal
│
├── public/
│   ├── audio/
│   │   └── coaching/              # ⏳ Fichiers audio coaching
│   └── images/
│       └── pros/                  # ⏳ Photos joueurs pros
│
└── docs/                          # ✅ 12 fichiers spec
    ├── 00-STATUT-PROJET.md
    ├── 01-COMPARAISON-SESSIONS.md
    ├── 03-EXPORT-PARTAGE.md
    └── ...
```

---

## 📋 PLAN D'IMPLÉMENTATION RECOMMANDÉ

### Phase 1: Monétisation (CETTE SEMAINE)
**Durée**: 1-2 jours  
**Priorité**: 🔴 CRITIQUE

```
✅ Modèle premium (FAIT)
✅ UI uniforme (FAIT)
✅ SubscriptionPage (FAIT)
⏳ Intégrer feature gating dans app:
   - [ ] Protéger création sessions
   - [ ] Protéger exports PDF
   - [ ] Protéger exports vidéo
   - [ ] Limiter lancers par session
   - [ ] Afficher usage/limites dans UI
```

**Fichiers à modifier**:
- `src/pages/CapturePageAuto.tsx`
- `src/pages/CapturePageManual.tsx`
- `src/components/export/ExportDialog.tsx`
- `src/pages/HomePage.tsx` (afficher limites)

---

### Phase 2: Coaching Temps Réel (FÉVRIER 2026)
**Durée**: 4-6 semaines  
**Priorité**: 🔴 HAUTE

```
Semaine 1-2: Core coaching
  - [ ] RealtimeCoach class (détection erreurs)
  - [ ] CoachingOverlay component
  - [ ] Intégration dans CapturePage
  - [ ] Tests performance (60 FPS)

Semaine 3-4: Feedback multimodal
  - [ ] AudioCoach (Web Audio API + TTS)
  - [ ] HapticCoach (vibrations mobile)
  - [ ] DirectionalArrow component
  - [ ] Tests UX

Semaine 5-6: Adaptatif & Guidé
  - [ ] AdaptiveCoach (3 niveaux)
  - [ ] GuidedPractice component
  - [ ] Exercices progressifs (config)
  - [ ] Système learning progress
```

**Feature gating**:
- Gratuit: Coaching basique (2-3 feedbacks)
- Pro: Coaching complet + adaptatif
- Elite: Coaching + pratique guidée + historique corrections

---

### Phase 3: Export Vidéo (MARS 2026)
**Durée**: 2-3 semaines  
**Priorité**: 🔴 HAUTE

```
Semaine 1: Setup FFmpeg.wasm
  - [ ] Intégrer FFmpeg.wasm
  - [ ] Fonction generateReplayFrames()
  - [ ] Tests encoding basique

Semaine 2: Overlays
  - [ ] VideoOverlay components
  - [ ] Skeleton overlay
  - [ ] Angles overlay
  - [ ] Scores overlay
  - [ ] Texte personnalisé

Semaine 3: Options & UI
  - [ ] Sélecteur résolution (720p/1080p/4K)
  - [ ] Option slow motion
  - [ ] Progression export
  - [ ] Feature gating résolutions
```

---

### Phase 4: IA Générative (AVRIL-MAI 2026)
**Durée**: 6-8 semaines  
**Priorité**: 🟡 MOYENNE

```
Semaine 1-2: Recommandations
  - [ ] AIRecommendationEngine
  - [ ] Intégration Transformers.js
  - [ ] Parsing & affichage recommandations

Semaine 3-4: Plans d'entraînement
  - [ ] AITrainingPlanner
  - [ ] Générateur exercices adaptatifs
  - [ ] UI visualisation plan

Semaine 5-6: Prédiction performance
  - [ ] PerformancePredictor
  - [ ] Modèle TensorFlow.js
  - [ ] Entraînement sur données user
  - [ ] UI prédictions

Semaine 7-8: Chatbot
  - [ ] AICoachChatbot
  - [ ] Intégration Ollama local
  - [ ] UI chat interface
  - [ ] Context management
```

---

### Phase 5: Reconnaissance Avancée (JUIN 2026)
**Durée**: 4-6 semaines  
**Priorité**: 🟡 MOYENNE

```
Semaine 1-2: Classification
  - [ ] ThrowClassifier (LSTM)
  - [ ] Entraînement sur dataset
  - [ ] UI affichage type détecté

Semaine 3-4: Détection erreurs
  - [ ] 15+ patterns d'erreurs
  - [ ] ErrorDetector class
  - [ ] UI liste erreurs avec corrections

Semaine 5-6: Comparaison pros
  - [ ] Base de données pros
  - [ ] ProComparisonEngine (DTW)
  - [ ] UI comparaison visuelle
```

---

### Phase 6: Rapports & Calibration (Q3 2026)
**Durée**: 5-7 semaines  
**Priorité**: 🔵 BASSE

```
Rapports (2-3 semaines):
  - [ ] Générateur rapports multi-formats
  - [ ] 3 templates (standard/coach/scientific)
  - [ ] Rapports programmés (cron)
  - [ ] Email delivery

Calibration (3-4 semaines):
  - [ ] Détection auto distance
  - [ ] Support ArUco markers
  - [ ] Analyse environnement
  - [ ] Assistant calibration
```

---

## 🎯 MÉTRIQUES DE SUCCÈS

### Business (Premium)
- ✅ Conversion free→paid: **> 5%**
- ✅ Churn rate: **< 5%/mois**
- ✅ LTV: **> 200€**
- ✅ MRR growth: **+20%/mois**

### Technique
- ⚡ Latence détection pose: **< 50ms**
- ⚡ Framerate capture: **≥ 30 FPS** (idéal 60)
- ⚡ Temps génération PDF: **< 5s**
- ⚡ Taille vidéo 1080p: **< 50MB**

### Utilisateur
- 📈 Rétention 30j: **> 40%**
- 📈 Sessions/semaine: **> 3**
- 📈 NPS: **> 8/10**
- 📈 Amélioration avec coaching: **+30%**

---

## 💰 MONÉTISATION - FEATURES PAR TIER

| Feature                    | Gratuit       | Pro (9.99€)      | Elite (19.99€)      |
| -------------------------- | ------------- | ---------------- | ------------------- |
| **Sessions/mois**          | 10            | ♾️               | ♾️                  |
| **Lancers/session**        | 3             | ♾️               | ♾️                  |
| **Comparaison sessions**   | 2 max         | 5 max            | Illimité            |
| **Export PDF**             | ❌            | 10/mois          | ♾️                  |
| **Export vidéo**           | ❌            | 720p (5/mois)    | 1080p + 4K ♾️       |
| **Coaching temps réel**    | Basique       | Complet          | + Pratique guidée   |
| **IA recommandations**     | ❌            | 20/mois          | ♾️                  |
| **IA chatbot**             | ❌            | 50 messages/mois | ♾️                  |
| **Plans entraînement IA**  | ❌            | 1/mois           | ♾️                  |
| **Reconnaissance avancée** | ❌            | ✅               | ✅                  |
| **Comparaison pros**       | ❌            | ❌               | ✅                  |
| **Rapports détaillés**     | Basique       | PDF complet      | Multi-format + auto |
| **Historique**             | 30 jours      | 1 an             | Illimité            |
| **Support**                | Email         | Email prioritaire | Chat + Email        |

---

## 📦 DÉPENDANCES NPM À INSTALLER

### Déjà installées ✅
```json
{
  "react": "^18.x",
  "typescript": "^5.x",
  "@supabase/supabase-js": "^2.x",
  "zustand": "^4.x",
  "recharts": "^2.10.0"
}
```

### À installer par phase ⏳

**Phase 2 - Coaching**:
```bash
npm install framer-motion@^11.0.0 tone@^14.8.0
```

**Phase 3 - Vidéo**:
```bash
npm install @ffmpeg/ffmpeg@^0.12.10 @ffmpeg/util@^0.12.1
```

**Phase 4 - IA**:
```bash
npm install @xenova/transformers@^2.9.0 @tensorflow/tfjs@^4.15.0 ollama@^0.5.0
```

**Phase 5 - Reconnaissance**:
```bash
npm install @mediapipe/hands@^0.4.1 ml-dtw@^1.0.0
```

**Phase 6 - Rapports**:
```bash
npm install jspdf@^2.5.1 jspdf-autotable@^3.8.0 docx@^8.5.0 node-cron@^3.0.3 resend@^3.0.0
```

**Calibration (optionnel)**:
```bash
npm install @techstark/opencv-js@^4.9.0 three@^0.160.0
```

---

## 🚀 ACTIONS IMMÉDIATES

### Aujourd'hui (28 janvier 2026)
1. ✅ Lire toute la documentation (FAIT)
2. ⏳ **Intégrer feature gating dans CapturePageAuto.tsx**
3. ⏳ **Intégrer feature gating dans ExportDialog.tsx**
4. ⏳ **Afficher limites/usage dans HomePage.tsx**

### Cette semaine
5. Tester flow complet premium (free → paywall → upgrade)
6. Créer composant UsageBanner (affiche limites en haut)
7. Ajouter analytics usage features

### Semaine prochaine
8. Démarrer Phase 2: Coaching temps réel
9. Créer structure dossiers coaching/
10. Implémenter RealtimeCoach class

---

## 📚 RESSOURCES UTILES

### Documentation Interne
- `00-STATUT-PROJET.md` - Vue d'ensemble projet
- `22-MODELE-PREMIUM.md` - Détails système premium
- `05-COACHING-VIRTUEL.md` - Spec coaching détaillée
- `10-IA-GENERATIVE.md` - Spec IA complète

### APIs & SDKs
- MediaPipe Pose: https://google.github.io/mediapipe/solutions/pose
- TensorFlow.js: https://www.tensorflow.org/js
- Transformers.js: https://huggingface.co/docs/transformers.js
- FFmpeg.wasm: https://ffmpegwasm.netlify.app/
- Supabase: https://supabase.com/docs

### Design
- shadcn/ui: https://ui.shadcn.com/
- Lucide Icons: https://lucide.dev/
- Tailwind CSS: https://tailwindcss.com/

---

## ✅ CONCLUSION

**État actuel**: Fondations solides (85% premium + UI parfaite)  
**Prochaine étape**: Feature gating (1-2 jours)  
**Focus Q1**: Coaching temps réel + Export vidéo + Monétisation  
**Vision long terme**: Plateforme IA complète pour fléchettes pro

**Estimation durée totale**: 6-9 mois pour toutes les fonctionnalités planifiées  
**ROI attendu**: Très élevé (monétisation + différenciation forte)

---

**Document créé le**: 28 janvier 2026 - 13h17  
**Auteur**: Cascade AI pour @Eloura74  
**Version**: 1.0
