# ⚙️ Calibration Avancée

## 🎯 Objectif

Améliorer la précision de l'analyse en calibrant automatiquement distance, angles, et environnement.

## 🎨 Fonctionnalités

### 1. Détection Automatique Distance

```typescript
interface DistanceCalibration {
  detectedDistance: number;       // cm
  confidence: number;
  method: 'aruco' | 'facesize' | 'manual';
  recommendations: string[];
}

// Détection par taille du visage
function calibrateDistance(pose: Pose): DistanceCalibration {
  const leftEye = pose.keypoints.find(k => k.name === 'left_eye');
  const rightEye = pose.keypoints.find(k => k.name === 'right_eye');
  
  if (!leftEye || !rightEye) {
    return { detectedDistance: 0, confidence: 0, method: 'manual', recommendations: [] };
  }
  
  // Distance moyenne inter-pupillaire: 63mm
  const IPD_MM = 63;
  const eyeDistancePixels = Math.hypot(
    rightEye.x - leftEye.x,
    rightEye.y - leftEye.y
  );
  
  // Formule: distance = (IPD_réelle * focale) / IPD_pixels
  const FOCAL_LENGTH = 500; // Approximation webcam standard
  const distanceCm = (IPD_MM * FOCAL_LENGTH) / eyeDistancePixels / 10;
  
  const isOptimal = distanceCm >= 150 && distanceCm <= 250;
  const confidence = isOptimal ? 0.9 : 0.6;
  
  const recommendations = [];
  if (distanceCm < 150) recommendations.push('Reculez de ' + (150 - distanceCm).toFixed(0) + 'cm');
  if (distanceCm > 250) recommendations.push('Avancez de ' + (distanceCm - 250).toFixed(0) + 'cm');
  
  return {
    detectedDistance: distanceCm,
    confidence,
    method: 'facesize',
    recommendations
  };
}
```

### 2. Marqueurs ArUco

```typescript
import * as cv from '@techstark/opencv-js';

interface ArucoCalibration {
  markers: ArucoMarker[];
  cameraMatrix: number[][];
  distortionCoeffs: number[];
  realWorldScale: number;
}

// Détection marqueurs ArUco
async function detectArucoMarkers(imageData: ImageData): Promise<ArucoMarker[]> {
  const mat = cv.matFromImageData(imageData);
  const gray = new cv.Mat();
  cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);
  
  const dictionary = cv.aruco.getPredefinedDictionary(cv.aruco.DICT_4X4_50);
  const parameters = new cv.aruco.DetectorParameters();
  
  const corners = new cv.MatVector();
  const ids = new cv.Mat();
  
  cv.aruco.detectMarkers(gray, dictionary, corners, ids, parameters);
  
  const markers: ArucoMarker[] = [];
  for (let i = 0; i < ids.rows; i++) {
    const id = ids.data32S[i];
    const corner = corners.get(i);
    markers.push({
      id,
      corners: Array.from(corner.data32F),
      center: calculateMarkerCenter(corner)
    });
  }
  
  mat.delete();
  gray.delete();
  corners.delete();
  ids.delete();
  
  return markers;
}
```

### 3. Calibration Multi-Caméras

```typescript
interface MultiCameraSetup {
  cameras: CameraStream[];
  synchronization: SyncConfig;
  spatialMapping: SpatialMap;
}

class MultiCameraCalibrator {
  async calibrateCameras(streams: MediaStream[]): Promise<MultiCameraSetup> {
    const cameras = await Promise.all(
      streams.map((stream, idx) => this.calibrateCamera(stream, idx))
    );
    
    // Synchroniser les timestamps
    const sync = await this.synchronizeCameras(cameras);
    
    // Mapper l'espace 3D
    const spatialMap = await this.createSpatialMap(cameras);
    
    return { cameras, synchronization: sync, spatialMapping: spatialMap };
  }
  
  private async synchronizeCameras(cameras: CameraStream[]): Promise<SyncConfig> {
    // Utiliser pattern de synchronisation (flashs LED)
    const syncPoints = await this.detectSyncFlashes(cameras);
    
    return {
      baseCamera: 0,
      timeOffsets: syncPoints.map(p => p.timestamp - syncPoints[0].timestamp),
      framerate: 30
    };
  }
}
```

### 4. Calibration Environnementale

```typescript
interface EnvironmentCalibration {
  lighting: LightingConditions;
  background: BackgroundAnalysis;
  acoustics: AcousticProfile;
}

// Analyse des conditions d'éclairage
function analyzeLighting(imageData: ImageData): LightingConditions {
  const pixels = imageData.data;
  let sum = 0;
  
  for (let i = 0; i < pixels.length; i += 4) {
    const brightness = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
    sum += brightness;
  }
  
  const avgBrightness = sum / (pixels.length / 4);
  
  return {
    brightness: avgBrightness,
    isOptimal: avgBrightness >= 100 && avgBrightness <= 200,
    recommendations: avgBrightness < 100 
      ? ['Augmentez l\'éclairage'] 
      : avgBrightness > 200 
        ? ['Réduisez l\'éclairage'] 
        : ['Éclairage optimal']
  };
}
```

### 5. Assistant de Calibration Guidé

```typescript
export function CalibrationWizard({ onComplete }: CalibrationWizardProps) {
  const [step, setStep] = useState(0);
  const [calibrationData, setCalibrationData] = useState<Partial<Calibration>>({});
  
  const steps = [
    { 
      title: 'Positionnement', 
      component: <DistanceCalibrationStep />,
      validator: validateDistance
    },
    { 
      title: 'Éclairage', 
      component: <LightingCalibrationStep />,
      validator: validateLighting
    },
    { 
      title: 'Détection', 
      component: <PoseDetectionTest />,
      validator: validatePoseDetection
    },
    { 
      title: 'Main dominante', 
      component: <DominantHandSelector />,
      validator: () => true
    }
  ];
  
  const currentStep = steps[step];
  
  return (
    <div className="max-w-2xl mx-auto">
      <Stepper steps={steps.map(s => s.title)} current={step} />
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{currentStep.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep.component}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
          >
            Précédent
          </Button>
          <Button onClick={handleNext}>
            {step === steps.length - 1 ? 'Terminer' : 'Suivant'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
```

## 📦 Dépendances

```json
{
  "@techstark/opencv-js": "^4.9.0",
  "three": "^0.160.0"
}
```

## ✅ Checklist

- [ ] Détection auto distance
- [ ] Support marqueurs ArUco
- [ ] Multi-caméras
- [ ] Analyse environnement
- [ ] Assistant guidé
- [ ] Profils de calibration sauvegardés
- [ ] Tests de précision

---

**Difficulté** : ⭐⭐⭐ Élevée  
**Durée** : 3-4 semaines  
**Impact** : 💰💰 Moyen
