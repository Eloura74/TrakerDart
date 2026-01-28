# 🚀 Roadmap d'Exécution TrakerDart
## Plan d'Implémentation Complet - App Unique & Parfaite

**Objectif** : Application premium exceptionnelle, responsive, UX parfaite  
**Design** : Glassmorphism cyan/noir déjà en place ✅  
**Durée totale** : ~6 mois (6-9 mois avec IA)

---

## 🎯 PHASE 1: Tests & Polish Feature Gating ✅ EN COURS
**Durée** : 2-3 heures (Aujourd'hui)  
**Priorité** : 🔴 CRITIQUE

### Objectifs
- ✅ Feature gating opérationnel
- ✅ Tests des 3 tiers (Free/Pro/Elite)
- ✅ Documentation utilisateur
- ✅ Screenshots/Démo

### Actions Immédiates
1. **Tester Free Tier** (`.env` → `VITE_DEV_DEFAULT_TIER=free`)
   - Créer 10 sessions
   - Vérifier paywall à la 11ème
   - Tenter export PDF → Paywall
   - UsageBanner visible

2. **Tester Pro Tier** (`VITE_DEV_DEFAULT_TIER=pro`)
   - Sessions illimitées
   - 10 exports PDF/mois
   - UsageBanner affiche compteurs

3. **Tester Elite Tier** (`VITE_DEV_DEFAULT_TIER=elite`)
   - Tout illimité
   - UsageBanner masquée
   - Aucun paywall

4. **Polish UX**
   - Vérifier animations PaywallModal
   - Messages d'erreur clairs
   - Responsive mobile (tester)

5. **Documentation**
   - Mettre à jour `00-STATUT-PROJET.md`
   - Screenshots des paywalls
   - Guide utilisateur rapide

---

## 🎥 PHASE 2: Export Vidéo Annotée
**Durée** : 2 semaines  
**Priorité** : 🔴 HAUTE  
**Impact** : 💰💰💰 Très élevé (Viralité)

### Objectifs
- Export vidéo avec overlays biomécaniques
- 3 résolutions (720p/1080p/4K)
- Feature gating par résolution
- Slow motion sur phases critiques

### Semaine 1: FFmpeg.wasm + Génération Frames
**Fichiers à créer** :
```
src/
├── services/
│   └── videoExport.ts         # Service export vidéo
├── lib/
│   └── ffmpeg/
│       ├── loader.ts          # Chargement FFmpeg.wasm
│       └── encoder.ts         # Encoding vidéo
└── components/
    └── export/
        ├── VideoExportOptions.tsx  # UI options
        └── VideoExportProgress.tsx # Progression
```

**Dépendances** :
```bash
npm install @ffmpeg/ffmpeg @ffmpeg/util
```

**Code clé** :
```typescript
// src/services/videoExport.ts
export async function exportAnnotatedVideo(
  volley: Volley,
  options: VideoExportOptions
): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  
  // 1. Générer frames du replay (canvas)
  const frames = await generateReplayFrames(volley.throws);
  
  // 2. Ajouter overlays (skeleton, angles, scores)
  const annotatedFrames = await addOverlays(frames, options);
  
  // 3. Encoder avec FFmpeg
  return await ffmpeg.encode({
    frames: annotatedFrames,
    fps: options.fps,
    codec: options.codec,
    resolution: options.resolution
  });
}
```

### Semaine 2: Overlays + UI + Feature Gating
**Overlays à implémenter** :
- ✅ Skeleton pose (lignes articulées cyan)
- ✅ Angles temps réel (coude, poignet, épaule)
- ✅ Score technique (coin supérieur droit)
- ✅ Texte personnalisé
- ✅ Logo TrakerDart (watermark)

**Feature Gating** :
```typescript
// Dans ExportDialog.tsx
const handleExportVideo = async (resolution: string) => {
  let featureKey = 'video_exports_720p';
  if (resolution === '1080p') featureKey = 'video_exports_1080p';
  if (resolution === '4K') featureKey = 'video_exports_4k';
  
  const access = await checkAndTrackFeature(featureKey);
  if (!access.hasAccess) {
    setShowPaywall(true);
    return;
  }
  
  // Exporter...
};
```

**UI Polish** :
- Progression avec étapes (Frames → Overlays → Encoding)
- Prévisualisation avant export
- Temps estimé
- Bouton annuler

---

## 📋 PHASE 3: Rapports Détaillés
**Durée** : 1-2 semaines  
**Priorité** : 🟡 MOYENNE  
**Impact** : 💰💰 Moyen (Pro)

### Objectifs
- Export PDF amélioré (graphiques, stats avancées)
- Export HTML interactif
- Export DOCX pour coachs
- Rapports programmés automatiques (Elite)

### Semaine 1: Améliorations PDF + HTML
**Fichiers à créer** :
```
src/
├── services/
│   └── reportGenerator.ts     # Générateur multi-formats
└── components/
    └── reports/
        ├── ReportTemplate.tsx     # Templates
        ├── ReportPreview.tsx      # Prévisualisation
        └── ReportScheduler.tsx    # Programmation
```

**Templates disponibles** :
- **Standard** : Grand public (graphiques simples)
- **Coach** : Pros (analyse détaillée)
- **Scientific** : Académique (format recherche)

**Dépendances** :
```bash
npm install jspdf jspdf-autotable docx html2canvas
```

### Semaine 2: DOCX + Programmation
**Rapports programmés** :
- Hebdomadaire (lundi 8h)
- Mensuel (1er du mois)
- Personnalisé

**UI** :
```typescript
<ReportScheduler
  frequency="weekly"
  email="user@example.com"
  template="coach"
  filters={{ minConsistency: 70 }}
/>
```

---

## 🎓 PHASE 4: Coaching Temps Réel
**Durée** : 4-6 semaines  
**Priorité** : 🔴 TRÈS HAUTE  
**Impact** : 💰💰💰💰 Critique (Différenciation)

### Objectifs
- Feedback instantané pendant capture
- 3 modes : Visuel / Audio / Haptique
- Coaching adaptatif (3 niveaux)
- Mode pratique guidée

### Semaine 1-2: Core Coaching
**Fichiers à créer** :
```
src/
├── services/
│   └── coaching/
│       ├── realtimeCoach.ts       # Analyse temps réel
│       └── errorDetector.ts       # Détection erreurs
├── components/
│   └── coaching/
│       ├── CoachingOverlay.tsx    # Overlay visuel
│       ├── DirectionalArrow.tsx   # Flèches guidage
│       └── CoachingSettings.tsx   # Paramètres
└── types/
    └── coaching.ts                # Types
```

**Erreurs détectées** :
```typescript
const ERRORS = {
  'elbow-too-closed': {
    threshold: 70,  // degrés
    message: 'Coude trop fermé! Ouvrez l\'angle',
    color: '#ff0055',
    priority: 'high'
  },
  'shoulder-misaligned': {
    threshold: 15,  // degrés rotation
    message: 'Épaules non alignées! Redressez-vous',
    color: '#ffaa00',
    priority: 'medium'
  },
  'unstable-gaze': {
    threshold: 30,  // pixels mouvement
    message: 'Fixez la cible du regard',
    color: '#00f2ff',
    priority: 'low'
  }
  // ... 12+ erreurs
};
```

**Performance critique** :
- Latence < 100ms
- 60 FPS maintenu
- Cooldown 2s entre feedbacks (éviter spam)

### Semaine 3-4: Feedback Multimodal
**Audio Coach** :
```typescript
class AudioCoach {
  // Précharger fichiers audio
  async preloadAudios() {
    const files = [
      'coude_incorrect.mp3',
      'epaules_desalignees.mp3',
      'excellent.mp3'
    ];
    await Promise.all(files.map(f => this.loadAudio(f)));
  }
  
  // TTS dynamique
  speak(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    speechSynthesis.speak(utterance);
  }
}
```

**Haptique Mobile** :
```typescript
class HapticCoach {
  vibrate(type: 'error' | 'warning' | 'success') {
    const patterns = {
      error: [200, 100, 200],
      warning: [100, 50, 100],
      success: [50, 30, 50, 30, 50]
    };
    navigator.vibrate(patterns[type]);
  }
}
```

### Semaine 5-6: Adaptatif + Pratique Guidée
**3 Niveaux** :
- **Débutant** : 1 conseil à la fois (le plus critique)
- **Intermédiaire** : 2-3 conseils priorisés
- **Avancé** : Analyse complète détaillée

**Mode Pratique Guidée** :
```typescript
const EXERCISES = [
  {
    name: 'Alignement Épaules',
    targetReps: 10,
    successCriteria: { shoulderAlignment: { min: -5, max: 5 } }
  },
  {
    name: 'Angle Coude Optimal',
    targetReps: 15,
    successCriteria: { elbowAngle: { min: 90, max: 120 } }
  }
  // ... 8 exercices progressifs
];
```

---

## 🤖 PHASE 5: IA Générative
**Durée** : 6-8 semaines  
**Priorité** : 🟡 MOYENNE  
**Impact** : 💰💰💰 Très élevé (Différenciation)

### Objectifs
- Recommandations IA personnalisées
- Plans d'entraînement automatiques
- Prédiction performance
- Chatbot coach assistant

### Semaine 1-2: Recommandations IA
**Dépendances** :
```bash
npm install @xenova/transformers
```

**Code** :
```typescript
class AIRecommendationEngine {
  private model: TransformersModel;
  
  async initialize() {
    this.model = await pipeline('text-generation', 'Xenova/gpt2');
  }
  
  async generateRecommendations(
    userProfile: UserProfile,
    sessions: TrainingSession[]
  ): Promise<AIRecommendation[]> {
    const patterns = this.analyzePatterns(sessions);
    const prompt = this.buildPrompt(userProfile, patterns);
    
    const response = await this.model(prompt, {
      max_length: 500,
      temperature: 0.7
    });
    
    return this.parseRecommendations(response);
  }
}
```

### Semaine 3-4: Plans d'Entraînement
**Génération adaptée** :
```typescript
const plan = await AITrainingPlanner.generatePlan({
  currentLevel: 75,
  targetGoal: 'Atteindre 90% régularité',
  availableTime: 3, // heures/semaine
  duration: 30 // jours
});

// Retourne:
// - 4 semaines détaillées
// - 3-4 sessions/semaine
// - Exercices progressifs
// - Prédiction amélioration: +15%
```

### Semaine 5-6: Prédiction Performance
**Modèle TensorFlow.js** :
```typescript
class PerformancePredictor {
  private model: tf.LayersModel;
  
  async train(sessions: TrainingSession[]) {
    // Modèle séquentiel LSTM
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 1 })
      ]
    });
    
    await this.model.fit(features, labels, { epochs: 50 });
  }
  
  async predict(recentSessions) {
    return {
      nextSessionScore: 88.5,
      in7Days: 89.2,
      in30Days: 91.8,
      confidence: 0.85
    };
  }
}
```

### Semaine 7-8: Chatbot Coach
**Ollama local (gratuit, privé)** :
```typescript
class AICoachChatbot {
  async chat(userMessage: string, context: UserContext) {
    const prompt = `
Tu es un coach virtuel de fléchettes expert.

Contexte utilisateur:
- Niveau: ${context.level}
- Dernière session: Régularité ${context.lastConsistency}%
- Problèmes: ${context.commonIssues.join(', ')}

Utilisateur: ${userMessage}
Assistant:`;
    
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      body: JSON.stringify({ model: 'llama2', prompt })
    });
    
    return response.json().response;
  }
}
```

---

## 📊 PHASE 6: Reconnaissance Avancée
**Durée** : 4-6 semaines  
**Priorité** : 🟡 MOYENNE  
**Impact** : 💰💰 Moyen

### Objectifs
- Classification types de lancers (5 types)
- Détection 15+ erreurs courantes
- Comparaison avec joueurs pros
- Analyse LSTM séquentielle

### Fonctionnalités
**5 Types de Lancers** :
- Standard
- Push (poussé)
- Pendulum (balancier)
- Snap (fouetté)
- Hybrid

**Comparaison Pros** :
- Base de données MVG, Wright, Price, etc.
- Similarité DTW (Dynamic Time Warping)
- Analyse différences
- Conseils personnalisés

---

## ⚙️ PHASE 7: Calibration Automatique
**Durée** : 3-4 semaines  
**Priorité** : 🔵 BASSE  
**Impact** : 💰 Faible

### Objectifs
- Détection auto distance (via taille visage)
- Support marqueurs ArUco
- Multi-caméras synchronisées
- Analyse environnement (éclairage)

---

## 🎨 PHASE 8: Polish Final + Mobile
**Durée** : 2-3 semaines  
**Priorité** : 🔴 HAUTE  
**Impact** : 💰💰💰 Très élevé

### Objectifs
- **Responsive parfait** (mobile/tablette/desktop)
- **Multi-langue** (FR/EN/ES/DE)
- **Mobile app** (React Native)
- **Animations** (Framer Motion++)
- **Performance** (Lazy loading, code splitting)
- **PWA** (Installable, offline)
- **SEO** (Meta tags, sitemap)

---

## 📊 Métriques de Succès

| Phase                 | Durée   | Impact User | ROI    | Difficulté |
| --------------------- | ------- | ----------- | ------ | ---------- |
| 1. Tests & Polish     | 3h      | ⭐⭐⭐⭐⭐  | 🔥🔥🔥🔥 | ⭐         |
| 2. Export Vidéo       | 2 sem   | ⭐⭐⭐⭐    | 🔥🔥🔥🔥 | ⭐⭐       |
| 3. Rapports           | 1-2 sem | ⭐⭐⭐      | 🔥🔥🔥   | ⭐⭐       |
| 4. Coaching TR        | 4-6 sem | ⭐⭐⭐⭐⭐  | 🔥🔥🔥🔥🔥 | ⭐⭐⭐     |
| 5. IA Générative      | 6-8 sem | ⭐⭐⭐⭐⭐  | 🔥🔥🔥🔥 | ⭐⭐⭐⭐   |
| 6. Reconnaissance     | 4-6 sem | ⭐⭐⭐      | 🔥🔥     | ⭐⭐⭐⭐   |
| 7. Calibration        | 3-4 sem | ⭐⭐        | 🔥      | ⭐⭐⭐     |
| 8. Polish Final       | 2-3 sem | ⭐⭐⭐⭐⭐  | 🔥🔥🔥🔥🔥 | ⭐⭐       |

**Total** : ~6 mois (24-28 semaines)

---

## ✅ Checklist Globale

**Foundation (FAIT)** :
- [x] ✅ Design system premium (glassmorphism cyan/noir)
- [x] ✅ Modèle premium 3 tiers
- [x] ✅ Feature gating opérationnel
- [x] ✅ Dashboard widgets
- [x] ✅ Comparaison sessions
- [x] ✅ Export PDF

**En Cours** :
- [x] 🔄 Tests feature gating (Aujourd'hui)
- [ ] ⏳ Export vidéo annotée
- [ ] ⏳ Rapports détaillés

**À Faire** :
- [ ] 🎓 Coaching temps réel
- [ ] 🤖 IA générative
- [ ] 📊 Reconnaissance avancée
- [ ] ⚙️ Calibration auto
- [ ] 🎨 Polish final + Mobile

---

## 🚀 GO !

**Prochaine action** : Tester le feature gating (30 min)  
**Objectif** : App unique, responsive, UX parfaite  
**Timeline** : 6 mois pour app complète exceptionnelle

**Let's build something amazing! 🎯**

---

**Créé le** : 28 janvier 2026 - 13h41  
**Version** : 1.0  
**Statut** : 🚀 EN COURS
