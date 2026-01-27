# 🎯 Mode Coaching Virtuel

## 🎯 Objectif

Fournir un coaching en temps réel pendant la capture pour corriger instantanément les erreurs de posture et améliorer la technique.

## 🎨 Fonctionnalités

### 1. Corrections Temps Réel
```typescript
interface RealtimeCoaching {
  enabled: boolean;
  mode: 'visual' | 'audio' | 'haptic' | 'all';
  sensitivity: 'relaxed' | 'normal' | 'strict';
  focusAreas: CoachingFocusArea[];
}

interface CoachingFocusArea {
  joint: 'elbow' | 'wrist' | 'shoulder' | 'trunk' | 'gaze';
  threshold: number;              // Seuil de déclenchement
  priority: 'low' | 'medium' | 'high';
}

// Analyse en temps réel pendant capture
class RealtimeCoach {
  private lastFeedback: number = 0;
  private feedbackCooldown: number = 2000; // 2s entre feedbacks
  
  analyzePose(pose: Pose, calibration: Calibration): CoachingFeedback | null {
    const now = Date.now();
    
    // Éviter spam de feedbacks
    if (now - this.lastFeedback < this.feedbackCooldown) {
      return null;
    }
    
    // Analyse des angles
    const elbowAngle = calculateElbowAngle(pose.keypoints, calibration.dominantHand);
    const shoulderAlignment = calculateShoulderAlignment(pose.keypoints);
    const gazeDirection = calculateHeadOrientation(pose.keypoints);
    
    // Détection d'erreurs critiques
    if (elbowAngle < 70 || elbowAngle > 150) {
      this.lastFeedback = now;
      return {
        type: 'error',
        joint: 'elbow',
        message: elbowAngle < 70 
          ? 'Coude trop fermé! Ouvrez l\'angle' 
          : 'Coude trop ouvert! Fléchissez légèrement',
        visualCue: { highlight: 'elbow', color: '#ff0055' },
        audioFile: 'coude_incorrect.mp3',
        vibrationPattern: [100, 50, 100]
      };
    }
    
    if (Math.abs(shoulderAlignment) > 15) {
      this.lastFeedback = now;
      return {
        type: 'warning',
        joint: 'shoulder',
        message: 'Épaules non alignées! Redressez-vous',
        visualCue: { highlight: 'shoulder', color: '#ffaa00' }
      };
    }
    
    return null;
  }
}
```

### 2. Interface Visuelle de Coaching

```typescript
// Overlay visuel pendant capture
export function CoachingOverlay({ 
  feedback, 
  pose 
}: CoachingOverlayProps) {
  if (!feedback) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Highlight du joint problématique */}
      {feedback.visualCue && (
        <HighlightJoint 
          joint={feedback.visualCue.highlight}
          color={feedback.visualCue.color}
          pose={pose}
        />
      )}
      
      {/* Message de feedback */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "absolute top-4 left-1/2 -translate-x-1/2",
            "px-6 py-3 rounded-full backdrop-blur-xl",
            feedback.type === 'error' && "bg-red-500/20 border-2 border-red-500",
            feedback.type === 'warning' && "bg-yellow-500/20 border-2 border-yellow-500",
            feedback.type === 'success' && "bg-green-500/20 border-2 border-green-500"
          )}
        >
          <p className="text-white font-bold text-center">
            {feedback.message}
          </p>
        </motion.div>
      </AnimatePresence>
      
      {/* Indicateurs directionnels */}
      {feedback.direction && (
        <DirectionalArrow direction={feedback.direction} />
      )}
    </div>
  );
}

// Composant flèche directionnelle
function DirectionalArrow({ direction }: { direction: Direction }) {
  const arrows = {
    up: '⬆️',
    down: '⬇️',
    left: '⬅️',
    right: '➡️'
  };
  
  return (
    <motion.div
      animate={{ y: direction === 'up' ? [-10, 0] : [10, 0] }}
      transition={{ repeat: Infinity, duration: 0.8 }}
      className="absolute bottom-20 left-1/2 -translate-x-1/2 text-6xl"
    >
      {arrows[direction]}
    </motion.div>
  );
}
```

### 3. Feedback Audio
```typescript
class AudioCoach {
  private audioContext: AudioContext;
  private audioCache: Map<string, AudioBuffer>;
  
  constructor() {
    this.audioContext = new AudioContext();
    this.audioCache = new Map();
  }
  
  async preloadAudios() {
    const audioFiles = [
      'coude_incorrect.mp3',
      'epaules_desalignees.mp3',
      'regard_stable.mp3',
      'excellent.mp3',
      'trop_rapide.mp3',
      'trop_lent.mp3'
    ];
    
    await Promise.all(
      audioFiles.map(file => this.loadAudio(file))
    );
  }
  
  async loadAudio(filename: string) {
    const response = await fetch(`/audio/coaching/${filename}`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.audioCache.set(filename, audioBuffer);
  }
  
  play(filename: string, volume: number = 1.0) {
    const buffer = this.audioCache.get(filename);
    if (!buffer) return;
    
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start();
  }
  
  // Synthèse vocale pour messages dynamiques
  speak(text: string, lang: string = 'fr-FR') {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    speechSynthesis.speak(utterance);
  }
}
```

### 4. Feedback Haptique (Mobile)
```typescript
class HapticCoach {
  // Patterns de vibration
  private readonly patterns = {
    error: [200, 100, 200],
    warning: [100, 50, 100],
    success: [50, 30, 50, 30, 50],
    attention: [300]
  };
  
  vibrate(type: keyof typeof this.patterns) {
    if (!navigator.vibrate) return;
    
    const pattern = this.patterns[type];
    navigator.vibrate(pattern);
  }
  
  // Feedback continu pour guidage
  pulseVibration(intensity: number, duration: number) {
    if (!navigator.vibrate) return;
    
    const pulseInterval = 100;
    const pulses = Math.floor(duration / pulseInterval);
    const pattern: number[] = [];
    
    for (let i = 0; i < pulses; i++) {
      pattern.push(intensity * 50, pulseInterval - intensity * 50);
    }
    
    navigator.vibrate(pattern);
  }
}
```

### 5. Coaching Adaptatif
```typescript
interface AdaptiveCoaching {
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  learningProgress: LearningProgress;
  focusPriorities: CoachingPriority[];
}

class AdaptiveCoach {
  private userProfile: UserProfile;
  private feedbackHistory: CoachingFeedback[] = [];
  
  // Adapter le coaching selon le niveau
  generateFeedback(
    pose: Pose,
    userLevel: string
  ): CoachingFeedback | null {
    const errors = this.detectErrors(pose);
    
    // Débutant : 1 conseil à la fois, le plus critique
    if (userLevel === 'beginner') {
      const criticalError = errors
        .sort((a, b) => b.severity - a.severity)[0];
      return criticalError || null;
    }
    
    // Intermédiaire : 2-3 conseils, priorisés
    if (userLevel === 'intermediate') {
      return this.combineFeedbacks(errors.slice(0, 3));
    }
    
    // Avancé : Tous les détails, analyse fine
    return this.detailedFeedback(errors);
  }
  
  // Apprentissage progressif
  updateLearningProgress(session: TrainingSession) {
    // Identifier points améliorés
    const improvements = this.detectImprovements(session);
    
    // Débloquer nouveaux critères de coaching
    if (improvements.includes('elbow') && 
        !this.userProfile.masteredAspects.includes('elbow')) {
      this.userProfile.masteredAspects.push('elbow');
      this.unlockNextCoachingLevel('wrist');
    }
  }
}
```

### 6. Mode Pratique Guidée
```typescript
interface GuidedPractice {
  exercises: Exercise[];
  currentExercise: number;
  duration: number;
  restTime: number;
}

interface Exercise {
  name: string;
  description: string;
  focusArea: string;
  targetReps: number;
  successCriteria: SuccessCriteria;
}

// Exercices progressifs
const GUIDED_EXERCISES: Exercise[] = [
  {
    name: 'Alignement Épaules',
    description: 'Concentrez-vous sur garder vos épaules alignées',
    focusArea: 'shoulder',
    targetReps: 10,
    successCriteria: {
      shoulderAlignment: { min: -5, max: 5 },
      consistency: 80
    }
  },
  {
    name: 'Angle Coude Optimal',
    description: 'Maintenez votre coude entre 90° et 120°',
    focusArea: 'elbow',
    targetReps: 15,
    successCriteria: {
      elbowAngle: { min: 90, max: 120 },
      consistency: 85
    }
  },
  // ... autres exercices
];

export function GuidedPracticeMode({ onComplete }: GuidedPracticeModeProps) {
  const [exercise, setExercise] = useState(0);
  const [reps, setReps] = useState(0);
  
  const currentExercise = GUIDED_EXERCISES[exercise];
  
  const handleThrowComplete = (throwData: Throw) => {
    const success = evaluateSuccess(throwData, currentExercise.successCriteria);
    
    if (success) {
      setReps(prev => prev + 1);
      
      if (reps + 1 >= currentExercise.targetReps) {
        // Exercice terminé
        if (exercise < GUIDED_EXERCISES.length - 1) {
          setExercise(prev => prev + 1);
          setReps(0);
        } else {
          onComplete();
        }
      }
    }
  };
  
  return (
    <div className="space-y-4">
      <ExerciseCard exercise={currentExercise} progress={reps} />
      <CaptureWithCoaching onThrowComplete={handleThrowComplete} />
    </div>
  );
}
```

## 💻 Intégration dans Capture

```typescript
// Modification de CapturePageAuto.tsx
export function CapturePageAuto() {
  const [coachingEnabled, setCoachingEnabled] = useState(true);
  const coachRef = useRef(new RealtimeCoach());
  
  const { poses } = usePoseDetection(videoRef, {
    onPose: (pose) => {
      if (coachingEnabled && recordingState === 'recording') {
        const feedback = coachRef.current.analyzePose(pose, calibration);
        if (feedback) {
          setCurrentFeedback(feedback);
          playFeedback(feedback);
        }
      }
    }
  });
  
  return (
    <>
      <video ref={videoRef} />
      {coachingEnabled && (
        <CoachingOverlay feedback={currentFeedback} pose={currentPose} />
      )}
    </>
  );
}
```

## 📦 Dépendances

```json
{
  "framer-motion": "^11.0.0",
  "tone": "^14.8.0",
  "@tensorflow/tfjs": "^4.15.0"
}
```

## ✅ Checklist

- [ ] Détection temps réel des erreurs
- [ ] Overlay visuel avec highlights
- [ ] Feedback audio (préenregistré + TTS)
- [ ] Feedback haptique mobile
- [ ] Coaching adaptatif par niveau
- [ ] Mode pratique guidée
- [ ] Paramètres de sensibilité
- [ ] Historique des corrections
- [ ] Tests de performance (60 FPS)

## 🎯 Métriques

- ✅ Latence feedback < 100ms
- ✅ Amélioration 30%+ avec coaching
- ✅ 60%+ utilisateurs activent
- ✅ Satisfaction > 8/10

---

**Difficulté** : ⭐⭐⭐ Élevée  
**Durée** : 4-6 semaines  
**Impact** : 💰💰💰 Très élevé
