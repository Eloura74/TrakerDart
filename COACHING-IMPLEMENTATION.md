# 🎓 Coaching Temps Réel - Implémentation

**Date** : 28 janvier 2026 - 20h50  
**Statut** : 🔄 Structure créée (40%), intégration restante

---

## ✅ Ce qui est FAIT (4 fichiers créés)

### 1. Types (`src/types/coaching.ts`)
- ✅ `RealtimeCoachingConfig` - Configuration complète
- ✅ `CoachingFeedback` - Structure des feedbacks
- ✅ `CoachingStats` - Statistiques coaching
- ✅ `SENSITIVITY_THRESHOLDS` - Seuils par niveau
- ✅ `FEEDBACK_MESSAGES` - Messages prédéfinis

### 2. Service (`src/services/realtimeCoach.ts`)
- ✅ `RealtimeCoach` class - Analyse temps réel
- ✅ `analyzePose()` - Point d'entrée principal
- ✅ `analyzeElbow()` - Détection angle coude
- ✅ `analyzeShoulder()` - Détection alignement épaules
- ✅ `analyzeWrist()` - Détection position poignet
- ✅ `analyzeGaze()` - Détection direction regard
- ✅ `calculateAngle()` - Calcul d'angles
- ✅ `updateStats()` - Tracking statistiques

### 3. Composant Overlay (`src/components/coaching/CoachingOverlay.tsx`)
- ✅ `CoachingOverlay` - Affichage feedback visuel
- ✅ `FeedbackIcon` - Icônes par type
- ✅ `DirectionalArrow` - Flèches directionnelles animées
- ✅ `SeverityIndicator` - Indicateur d'urgence
- ✅ Animations Framer Motion
- ✅ Design glassmorphism

### 4. Composant Settings (`src/components/coaching/CoachingSettings.tsx`)
- ✅ `CoachingSettings` - Panneau configuration
- ✅ Toggle activation coaching
- ✅ Sélection mode (visuel/audio/haptic/all)
- ✅ Sélection sensibilité (relaxed/normal/strict)
- ✅ Toggles zones de focus (coude/épaules/poignet/regard)
- ✅ Slider cooldown entre feedbacks

---

## 🚧 Ce qui RESTE à Faire

### 1. Intégration dans CapturePageAuto (2-3h)

**Étapes** :
1. Importer les composants et services
2. Initialiser `RealtimeCoach` au montage
3. Appeler `coach.analyzePose(pose)` à chaque frame
4. Afficher `CoachingOverlay` avec le feedback
5. Ajouter panneau `CoachingSettings` dans l'UI
6. Persister la config dans localStorage

**Code à ajouter** :
```typescript
// src/pages/CapturePageAuto.tsx
import { RealtimeCoach } from '@/services/realtimeCoach';
import { CoachingOverlay } from '@/components/coaching/CoachingOverlay';
import { CoachingSettings } from '@/components/coaching/CoachingSettings';
import type { RealtimeCoachingConfig, CoachingFeedback } from '@/types/coaching';

export function CapturePageAuto() {
  const [coachingConfig, setCoachingConfig] = useState<RealtimeCoachingConfig>({
    enabled: true,
    mode: 'visual',
    sensitivity: 'normal',
    focusAreas: [
      { joint: 'elbow', threshold: 15, priority: 'high' },
      { joint: 'shoulder', threshold: 15, priority: 'medium' }
    ],
    cooldownMs: 2000
  });
  
  const [currentFeedback, setCurrentFeedback] = useState<CoachingFeedback | null>(null);
  const coachRef = useRef<RealtimeCoach | null>(null);

  // Initialiser coach
  useEffect(() => {
    coachRef.current = new RealtimeCoach(coachingConfig);
  }, []);

  // Mettre à jour config
  useEffect(() => {
    if (coachRef.current) {
      coachRef.current.updateConfig(coachingConfig);
    }
  }, [coachingConfig]);

  // Dans le callback de détection pose
  const handlePoseDetected = (pose: Pose) => {
    // Analyse biomécanique existante
    // ...

    // Coaching temps réel
    if (coachRef.current && coachingConfig.enabled) {
      const feedback = coachRef.current.analyzePose(pose);
      setCurrentFeedback(feedback);
      
      // Clear feedback après 3s
      if (feedback) {
        setTimeout(() => setCurrentFeedback(null), 3000);
      }
    }
  };

  return (
    <div className="relative">
      {/* Video canvas existant */}
      <video ref={videoRef} ... />
      <canvas ref={canvasRef} ... />

      {/* Overlay coaching par-dessus */}
      <CoachingOverlay
        feedback={currentFeedback}
        show={coachingConfig.enabled && isCapturing}
      />

      {/* Settings coaching dans sidebar */}
      <CoachingSettings
        config={coachingConfig}
        onChange={setCoachingConfig}
      />
    </div>
  );
}
```

### 2. Audio Feedback (1-2h)

**À créer** : `src/services/audioCoach.ts`

```typescript
export class AudioCoach {
  private audioContext: AudioContext;
  private audioCache: Map<string, AudioBuffer> = new Map();

  async playFeedback(audioFile: string) {
    // Charger et jouer audio
    const buffer = await this.loadAudio(audioFile);
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start();
  }

  private async loadAudio(file: string): Promise<AudioBuffer> {
    if (this.audioCache.has(file)) {
      return this.audioCache.get(file)!;
    }

    const response = await fetch(`/assets/audio/coaching/${file}`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    
    this.audioCache.set(file, audioBuffer);
    return audioBuffer;
  }
}
```

**Fichiers audio nécessaires** :
- `/public/assets/audio/coaching/elbow_closed.mp3`
- `/public/assets/audio/coaching/elbow_open.mp3`
- `/public/assets/audio/coaching/shoulder_align.mp3`
- `/public/assets/audio/coaching/wrist_flex.mp3`
- `/public/assets/audio/coaching/look_target.mp3`

### 3. Feedback Haptique (30 min)

**À ajouter dans `RealtimeCoach`** :

```typescript
private triggerVibration(pattern: number[]) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}
```

### 4. Persistance Config (15 min)

**localStorage hook** :

```typescript
// src/hooks/useCoachingConfig.ts
export function useCoachingConfig() {
  const [config, setConfig] = useState<RealtimeCoachingConfig>(() => {
    const saved = localStorage.getItem('coaching_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem('coaching_config', JSON.stringify(config));
  }, [config]);

  return [config, setConfig] as const;
}
```

### 5. Tests & Polish (1-2h)

- [ ] Tester chaque type d'erreur (coude/épaules/poignet/regard)
- [ ] Vérifier cooldown fonctionne
- [ ] Tester tous les niveaux de sensibilité
- [ ] Valider animations fluides
- [ ] Performance (pas de lag à 60 FPS)

---

## 📦 Dépendances Nécessaires

```bash
# Déjà installées
npm install framer-motion  # Animations
npm install lucide-react   # Icônes
```

**Nouvelles** :
```bash
# Pour génération audio (optionnel)
npm install tone  # Synthèse audio si pas de fichiers MP3
```

---

## 🎯 Feature Gating (Elite)

**Limites par tier** :

| Tier    | Coaching Actif | Zones de Focus | Audio | Haptic |
| ------- | -------------- | -------------- | ----- | ------ |
| Free    | ❌ Non         | -              | -     | -      |
| Pro     | ✅ Oui         | 2 zones max    | ❌    | ❌     |
| Elite   | ✅ Oui         | Toutes         | ✅    | ✅     |

**À ajouter dans `FEATURE_LIMITS`** :

```typescript
// src/config/features.ts
export const FEATURE_LIMITS = {
  // ...existing
  realtime_coaching: { free: 0, pro: 1, elite: 1 },
  coaching_focus_areas: { free: 0, pro: 2, elite: -1 },
  coaching_audio: { free: 0, pro: 0, elite: 1 },
  coaching_haptic: { free: 0, pro: 0, elite: 1 },
};
```

**Check dans CoachingSettings** :

```typescript
const { hasAccess } = useFeatureGate('realtime_coaching');

if (!hasAccess) {
  return <PaywallModal featureName="Coaching Temps Réel" />;
}
```

---

## 🎨 Design & UX

### Feedback Visuel
- ✅ Messages en haut centré (glassmorphism)
- ✅ Couleurs par type (rouge/jaune/vert/bleu)
- ✅ Animations entrée/sortie (Framer Motion)
- ✅ Icônes expressives (lucide-react)
- ✅ Flèches directionnelles animées
- ✅ Indicateur de sévérité (gauge circulaire)

### Settings Panel
- ✅ Card dark glassmorphism
- ✅ Switches pour activation
- ✅ Selects pour mode/sensibilité
- ✅ Toggles pour zones de focus
- ✅ Slider pour cooldown

---

## 📊 Métriques de Succès

**Objectifs** :
- ✅ Détection erreurs < 200ms
- ✅ Pas de lag vidéo (60 FPS maintenu)
- ✅ Feedback pertinent (taux erreur < 10%)
- ✅ Utilisation par 50%+ utilisateurs Pro/Elite
- ✅ Amélioration technique +15% avec coaching actif

---

## 🐛 Points d'Attention

### Performance
- Coaching analysé à chaque frame (60 FPS)
- Utiliser `useMemo` pour calculs angles
- Throttle si FPS < 30
- Désactiver auto si CPU > 80%

### UX
- Cooldown essentiel (pas de spam)
- Messages courts et clairs
- Vibrations courtes (< 200ms)
- Audio pas trop fort

### Edge Cases
- Pose non détectée → skip analyse
- Keypoints score < 0.5 → ignorer
- Multiples erreurs simultanées → prioriser par severity

---

## ✅ Checklist Finale

**Code** :
- [x] ✅ Types créés (`coaching.ts`)
- [x] ✅ Service `RealtimeCoach` créé
- [x] ✅ Composant `CoachingOverlay` créé
- [x] ✅ Composant `CoachingSettings` créé
- [ ] 🔶 Intégration `CapturePageAuto`
- [ ] 🔶 Service `AudioCoach` (optionnel)
- [ ] 🔶 Feedback haptique
- [ ] 🔶 Persistance config localStorage
- [ ] 🔶 Feature gating

**Tests** :
- [ ] Test erreur coude
- [ ] Test erreur épaules
- [ ] Test erreur poignet
- [ ] Test erreur regard
- [ ] Test sensibilités (relaxed/normal/strict)
- [ ] Test cooldown
- [ ] Test performance 60 FPS

**Polish** :
- [ ] Animations fluides
- [ ] Messages français parfait
- [ ] Design cohérent avec app
- [ ] Responsive mobile
- [ ] Documentation utilisateur

---

## 🚀 Prochaines Étapes IMMÉDIATES

1. **Demain (29 Jan) - 3h** :
   - Intégrer dans CapturePageAuto
   - Ajouter localStorage config
   - Feature gating Pro/Elite
   - Tests basiques

2. **Semaine prochaine - 2-3h** :
   - Audio feedback (fichiers MP3)
   - Haptic feedback mobile
   - Tests approfondis
   - Documentation utilisateur

3. **Améliorations futures** :
   - Coaching IA personnalisé (Phase 5)
   - Historique des corrections
   - Progression tracking
   - Coaching par objectif

---

**Temps total estimé restant** : 4-6h  
**Impact utilisateur** : 🔥🔥🔥 TRÈS ÉLEVÉ  
**Complexité** : ⭐⭐⭐ Moyenne-Haute

**Status** : 40% terminé, prêt pour intégration ! 🎯
