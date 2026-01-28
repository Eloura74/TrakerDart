# 🎬 Export Vidéo - Implémentation Terminée

**Date** : 28 janvier 2026 - 13h50  
**Statut** : ✅ Code créé, prêt à tester

---

## ✅ Fichiers Créés (8 fichiers)

### 1. Types
- `src/types/video.ts` - Types TypeScript pour export vidéo

### 2. Lib FFmpeg
- `src/lib/ffmpeg/loader.ts` - Chargement FFmpeg.wasm (singleton)
- `src/lib/ffmpeg/encoder.ts` - Encoding vidéo MP4

### 3. Services
- `src/services/videoExport.ts` - Service principal export
- `src/services/videoFrames.ts` - Génération frames canvas
- `src/services/videoOverlays.ts` - Overlays biomécaniques

### 4. Composants
- `src/components/export/VideoExportOptions.tsx` - UI options export

### 5. Documentation
- `EXPORT-VIDEO-IMPLEMENTATION.md` - Ce fichier

---

## 🎯 Fonctionnalités Implémentées

### Résolutions Supportées
- **720p** (1280x720) - Pro tier (5/mois)
- **1080p** (1920x1080) - Elite tier
- **4K** (3840x2160) - Elite tier

### Overlays Disponibles
✅ **Skeleton** - Squelette 3D cyan  
✅ **Angles** - Coude, poignet, épaule (temps réel)  
✅ **Scores** - Score technique + régularité  
✅ **Trajectoire** - Trace du mouvement  
✅ **Texte** - Personnalisable  
✅ **Watermark** - Logo TrakerDart

### Options
- FPS : 30 ou 60
- Codec : H.264
- Slow motion : 2x plus lent
- Qualité : CRF 23 (balance qualité/taille)

---

## 📦 Dépendances à Installer

```bash
npm install @ffmpeg/ffmpeg @ffmpeg/util
```

---

## 🚀 Prochaines Étapes

### 1. Installer les Dépendances
```bash
npm install @ffmpeg/ffmpeg@^0.12.10 @ffmpeg/util@^0.12.1
```

### 2. Intégrer dans ExportDialog

Modifier `src/components/export/ExportDialog.tsx` pour ajouter l'option vidéo :

```typescript
import { VideoExportOptionsComponent } from './VideoExportOptions';
import { exportAnnotatedVideo, getExportEstimations, downloadVideo } from '@/services/videoExport';
import { VIDEO_RESOLUTIONS } from '@/types/video';
import type { VideoExportOptions } from '@/types/video';

// Dans le composant
const [format, setFormat] = useState<"pdf" | "json" | "video">("pdf");
const [videoOptions, setVideoOptions] = useState<VideoExportOptions>({
  resolution: '720p',
  fps: 30,
  codec: 'h264',
  overlays: [
    { type: 'skeleton', enabled: true },
    { type: 'angles', enabled: true },
    { type: 'scores', enabled: true },
    { type: 'trajectory', enabled: false }
  ],
  slowMotion: false,
  watermark: true
});

// Ajouter option vidéo dans le Select
<SelectItem value="video">
  <div className="flex items-center gap-2">
    <Video className="h-4 w-4" />
    <span>Vidéo Annotée</span>
    <Lock className="h-3 w-3 text-yellow-500 ml-1" />
  </div>
</SelectItem>

// Afficher options vidéo si format === 'video'
{format === 'video' && (
  <VideoExportOptionsComponent
    options={videoOptions}
    onChange={setVideoOptions}
    tier={userTier}
  />
)}

// Dans handleExport, ajouter cas vidéo
if (format === 'video') {
  const featureKey = VIDEO_RESOLUTIONS[videoOptions.resolution].featureKey;
  const access = await checkAndTrackFeature(featureKey);
  
  if (!access.hasAccess) {
    setIsExporting(false);
    setShowPaywall(true);
    return;
  }
  
  // Exporter avec progression
  const blob = await exportAnnotatedVideo(
    session.volleys[0], // Première volée
    videoOptions,
    (progress) => {
      console.log(progress.message, progress.percent);
      // TODO: Afficher progression dans UI
    }
  );
  
  downloadVideo(blob, `trakerdart-${session.id.slice(0, 8)}.mp4`);
}
```

### 3. Ajouter Composant de Progression

Créer `src/components/export/VideoExportProgress.tsx` :

```typescript
export function VideoExportProgress({ progress }: { progress: VideoExportProgress }) {
  const getStageLabel = () => {
    switch (progress.stage) {
      case 'frames': return '🎬 Génération des frames...';
      case 'overlays': return '✨ Ajout des overlays...';
      case 'encoding': return '🎥 Création de la vidéo...';
      case 'done': return '✅ Terminé !';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{getStageLabel()}</span>
        <span className="text-sm text-muted-foreground">{progress.percent}%</span>
      </div>
      <Progress value={progress.percent} />
      <p className="text-xs text-muted-foreground">{progress.message}</p>
    </div>
  );
}
```

### 4. Tester

```typescript
// Test simple (dans console navigateur ou dans un composant)
import { exportAnnotatedVideo } from '@/services/videoExport';

const testExport = async () => {
  const volley = currentSession.volleys[0];
  
  const blob = await exportAnnotatedVideo(volley, {
    resolution: '720p',
    fps: 30,
    codec: 'h264',
    overlays: [
      { type: 'skeleton', enabled: true },
      { type: 'angles', enabled: true },
      { type: 'scores', enabled: true }
    ],
    slowMotion: false,
    watermark: true
  }, (progress) => {
    console.log(progress.message, progress.percent + '%');
  });
  
  // Télécharger
  downloadVideo(blob, 'test.mp4');
};
```

---

## 🎯 Feature Gating Vidéo

### Limites par Tier

| Tier    | 720p   | 1080p  | 4K     |
| ------- | ------ | ------ | ------ |
| Free    | ❌     | ❌     | ❌     |
| Pro     | 5/mois | ❌     | ❌     |
| Elite   | 20/mois| 10/mois| 3/mois |

### Vérification Accès

```typescript
// Avant export
const featureKey = VIDEO_RESOLUTIONS[videoOptions.resolution].featureKey;
const access = await checkAndTrackFeature(featureKey);

if (!access.hasAccess) {
  // Afficher paywall
  setShowPaywall(true);
  return;
}

// Procéder export...
```

---

## 📊 Performance Estimée

### Temps d'Encoding (estimations)

| Résolution | Frames | Temps     |
| ---------- | ------ | --------- |
| 720p       | 100    | ~5s       |
| 1080p      | 100    | ~12s      |
| 4K         | 100    | ~50s      |

### Taille Fichiers (estimations)

| Résolution | 5s     | 10s    | 30s    |
| ---------- | ------ | ------ | ------ |
| 720p       | ~1.2MB | ~2.5MB | ~7.5MB |
| 1080p      | ~3MB   | ~6MB   | ~18MB  |
| 4K         | ~12MB  | ~25MB  | ~75MB  |

---

## 🐛 Dépannage

### Erreur "Failed to load FFmpeg"
- Vérifier connexion internet (charge depuis CDN)
- Vérifier CORS si self-hosted
- Console → Voir logs FFmpeg

### Vidéo vide ou noire
- Vérifier que `throws[].poses` contient des données
- Vérifier dimensions keypoints valides
- Console → Logs génération frames

### Encoding échoue
- Vérifier nombre de frames > 0
- Vérifier format frames (PNG valid)
- Console → Erreurs FFmpeg

---

## ✅ Checklist Intégration

- [ ] Installer dépendances FFmpeg
- [ ] Modifier ExportDialog (ajouter option vidéo)
- [ ] Créer VideoExportProgress component
- [ ] Tester export 720p simple
- [ ] Tester feature gating (Free → Paywall)
- [ ] Tester toutes résolutions (Pro/Elite)
- [ ] Tester tous overlays
- [ ] Tester slow motion
- [ ] Optimiser performance (lazy load FFmpeg)
- [ ] Documentation utilisateur

---

## 🎉 Résultat Attendu

**Utilisateur Free** :
- Sélectionne "Vidéo Annotée" → Paywall immédiat
- Message : "Réservé aux abonnés Pro et Elite"

**Utilisateur Pro** :
- Peut exporter en 720p (5/mois)
- Options complètes (overlays, FPS, etc.)
- Progression visible pendant export
- Téléchargement automatique du .mp4

**Utilisateur Elite** :
- Toutes résolutions disponibles
- Limites généreuses (20/10/3)
- Expérience premium complète

---

## 💡 Améliorations Futures

- [ ] Prévisualisation avant export
- [ ] Édition timeline (couper début/fin)
- [ ] Multiple volleys dans 1 vidéo
- [ ] Comparaison côte-à-côte (2 vidéos)
- [ ] Export GIF animé
- [ ] Partage direct (YouTube, etc.)
- [ ] Templates de montage prédéfinis
- [ ] Audio (musique de fond optionnelle)

---

**Temps d'implémentation** : ~2h (code structure)  
**Temps d'intégration** : ~1-2h (UI + tests)  
**Temps total Phase 2** : Semaine 1 complétée !

**Status** : ✅ Prêt à intégrer et tester 🚀
