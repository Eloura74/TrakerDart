# 🎯 Reconnaissance Gestuelle Avancée

## 🎯 Objectif

Améliorer la précision de détection et reconnaître automatiquement types de lancers, erreurs courantes et patterns complexes.

## 🎨 Fonctionnalités

### 1. Classification Type de Lancer

```typescript
enum ThrowType {
  STANDARD = 'standard',
  PUSH = 'push',
  PENDULUM = 'pendulum',
  SNAP = 'snap',
  HYBRID = 'hybrid'
}

interface ThrowClassification {
  type: ThrowType;
  confidence: number;
  characteristics: string[];
  recommendations: string[];
}

class ThrowClassifier {
  private model: tf.LayersModel;
  
  async classifyThrow(poses: Pose[]): Promise<ThrowClassification> {
    // Extraire features clés
    const features = this.extractThrowFeatures(poses);
    
    // Prédire type
    const prediction = await this.model.predict(tf.tensor2d([features]));
    const probabilities = await prediction.data();
    
    const maxIdx = probabilities.indexOf(Math.max(...probabilities));
    const types = Object.values(ThrowType);
    
    return {
      type: types[maxIdx],
      confidence: probabilities[maxIdx],
      characteristics: this.identifyCharacteristics(types[maxIdx], features),
      recommendations: this.getRecommendations(types[maxIdx])
    };
  }
  
  private extractThrowFeatures(poses: Pose[]): number[] {
    return [
      this.calculateArmSpeed(poses),
      this.calculateReleaseAngle(poses),
      this.calculateFollowThrough(poses),
      this.calculateBodyRotation(poses),
      this.calculateElbowExtension(poses),
      this.calculateWristSnap(poses),
      // ... 20+ features
    ];
  }
}
```

### 2. Détection Erreurs Communes

```typescript
interface CommonError {
  type: string;
  severity: 'low' | 'medium' | 'high';
  frame: number;
  description: string;
  correction: string;
  videoTimestamp: number;
}

const ERROR_PATTERNS = {
  'elbow-drop': {
    detector: (poses: Pose[]) => {
      const releaseFrame = findReleaseFrame(poses);
      const elbowDrop = poses[releaseFrame].elbow.y - poses[0].elbow.y;
      return elbowDrop > 50; // pixels
    },
    severity: 'high',
    description: 'Chute du coude pendant le lancer',
    correction: 'Maintenez le coude à hauteur constante'
  },
  'shoulder-rotation': {
    detector: (poses: Pose[]) => {
      const rotation = calculateShoulderRotation(poses);
      return Math.abs(rotation) > 20; // degrés
    },
    severity: 'medium',
    description: 'Rotation excessive des épaules',
    correction: 'Gardez les épaules parallèles à la cible'
  },
  // ... 15+ erreurs courantes
};

class ErrorDetector {
  detectErrors(poses: Pose[]): CommonError[] {
    const errors: CommonError[] = [];
    
    for (const [errorType, pattern] of Object.entries(ERROR_PATTERNS)) {
      if (pattern.detector(poses)) {
        const frame = this.findErrorFrame(poses, pattern);
        errors.push({
          type: errorType,
          severity: pattern.severity,
          frame,
          description: pattern.description,
          correction: pattern.correction,
          videoTimestamp: poses[frame].timestamp
        });
      }
    }
    
    return errors.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }
}
```

### 3. Analyse Séquentielle (LSTM)

```typescript
class SequentialAnalyzer {
  private lstm: tf.LayersModel;
  
  async buildModel() {
    this.lstm = tf.sequential({
      layers: [
        tf.layers.lstm({
          units: 128,
          returnSequences: true,
          inputShape: [null, 34] // 17 keypoints * 2 (x,y)
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.lstm({
          units: 64,
          returnSequences: false
        }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 5, activation: 'softmax' }) // 5 classes
      ]
    });
    
    this.lstm.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
  }
  
  async analyzeSequence(poses: Pose[]): Promise<SequenceAnalysis> {
    // Normaliser et préparer séquence
    const sequence = this.prepareSequence(poses);
    
    // Prédire
    const prediction = await this.lstm.predict(sequence);
    const results = await prediction.data();
    
    return {
      quality: results[0],
      consistency: results[1],
      smoothness: results[2],
      timing: results[3],
      confidence: results[4]
    };
  }
  
  private prepareSequence(poses: Pose[]): tf.Tensor3D {
    const normalized = poses.map(pose => 
      pose.keypoints.flatMap(kp => [
        (kp.x - 320) / 320, // Normaliser [-1, 1]
        (kp.y - 240) / 240
      ])
    );
    
    return tf.tensor3d([normalized]);
  }
}
```

### 4. Détection Phases Automatique

```typescript
interface PhaseDetection {
  phases: DetectedPhase[];
  transitions: Transition[];
  timing: PhaseTiming;
}

interface DetectedPhase {
  type: ThrowPhase;
  startFrame: number;
  endFrame: number;
  duration: number;
  quality: number;
}

class AutoPhaseDetector {
  detectPhases(poses: Pose[]): PhaseDetection {
    const velocity = this.calculateVelocityProfile(poses);
    const acceleration = this.calculateAcceleration(velocity);
    
    // Détection basée sur la vélocité de la main
    const phases: DetectedPhase[] = [];
    let currentPhase: ThrowPhase = 'preparation';
    let phaseStart = 0;
    
    for (let i = 1; i < poses.length; i++) {
      const newPhase = this.determinePhase(
        velocity[i],
        acceleration[i],
        poses[i]
      );
      
      if (newPhase !== currentPhase) {
        phases.push({
          type: currentPhase,
          startFrame: phaseStart,
          endFrame: i - 1,
          duration: poses[i-1].timestamp - poses[phaseStart].timestamp,
          quality: this.evaluatePhaseQuality(currentPhase, poses.slice(phaseStart, i))
        });
        
        currentPhase = newPhase;
        phaseStart = i;
      }
    }
    
    return {
      phases,
      transitions: this.analyzeTransitions(phases),
      timing: this.analyzeTiming(phases)
    };
  }
  
  private determinePhase(
    velocity: number,
    acceleration: number,
    pose: Pose
  ): ThrowPhase {
    if (velocity < 50) return 'preparation';
    if (acceleration > 100) return 'acceleration';
    if (velocity > 200) return 'release';
    return 'follow_through';
  }
}
```

### 5. Comparaison avec Pros

```typescript
interface ProComparison {
  similarity: number;
  proPlayer: ProPlayer;
  differences: Difference[];
  learningPoints: string[];
}

class ProComparisonEngine {
  private proDatabase: ProPlayer[];
  
  async compareWithPros(
    userPoses: Pose[]
  ): Promise<ProComparison> {
    // Trouver le pro le plus similaire
    const similarities = this.proDatabase.map(pro => ({
      pro,
      similarity: this.calculateSimilarity(userPoses, pro.referencePoses)
    }));
    
    const bestMatch = similarities.sort((a, b) => b.similarity - a.similarity)[0];
    
    // Identifier différences clés
    const differences = this.identifyDifferences(userPoses, bestMatch.pro.referencePoses);
    
    // Générer points d'apprentissage
    const learningPoints = this.generateLearningPoints(differences, bestMatch.pro);
    
    return {
      similarity: bestMatch.similarity,
      proPlayer: bestMatch.pro,
      differences,
      learningPoints
    };
  }
  
  private calculateSimilarity(poses1: Pose[], poses2: Pose[]): number {
    // DTW (Dynamic Time Warping) pour comparer séquences
    const dtw = this.dynamicTimeWarping(
      this.extractKeypoints(poses1),
      this.extractKeypoints(poses2)
    );
    
    // Convertir distance en similarité [0-100]
    return Math.max(0, 100 - (dtw / 10));
  }
}
```

### 6. Reconnaissance Gestes UI

```typescript
class GestureController {
  private gestures: Map<string, GestureHandler> = new Map([
    ['thumbs-up', () => this.handleThumbsUp()],
    ['peace-sign', () => this.handlePeaceSign()],
    ['pointing', () => this.handlePointing()],
    ['open-palm', () => this.handleOpenPalm()]
  ]);
  
  detectGesture(pose: Pose): string | null {
    // Vérifier chaque geste
    if (this.isThumbsUp(pose)) return 'thumbs-up';
    if (this.isPeaceSign(pose)) return 'peace-sign';
    if (this.isPointing(pose)) return 'pointing';
    if (this.isOpenPalm(pose)) return 'open-palm';
    
    return null;
  }
  
  private isThumbsUp(pose: Pose): boolean {
    const thumb = pose.keypoints.find(k => k.name === 'right_thumb');
    const index = pose.keypoints.find(k => k.name === 'right_index');
    
    if (!thumb || !index) return false;
    
    // Pouce en haut, autres doigts fermés
    return thumb.y < index.y - 50;
  }
  
  handleGesture(gesture: string) {
    const handler = this.gestures.get(gesture);
    if (handler) handler();
  }
}
```

## 📦 Dépendances

```json
{
  "@tensorflow/tfjs": "^4.15.0",
  "@mediapipe/hands": "^0.4.1",
  "ml-dtw": "^1.0.0"
}
```

## ✅ Checklist

- [ ] Classification types de lancer
- [ ] Détection 15+ erreurs courantes
- [ ] LSTM pour analyse séquentielle
- [ ] Détection phases automatique
- [ ] Base de données pros
- [ ] Comparaison avec pros
- [ ] Gestes UI mains libres
- [ ] Modèle custom entraîné
- [ ] Temps réel < 50ms

---

**Difficulté** : ⭐⭐⭐⭐ Très élevée  
**Durée** : 4-6 semaines  
**Impact** : 💰💰 Moyen
