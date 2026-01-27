# 📤 Export et Partage

## 🎯 Objectif

Permettre aux utilisateurs d'exporter leurs analyses et de partager leurs performances sur différents supports.

## 🎨 Fonctionnalités

### 1. Export PDF
```typescript
interface PDFExportOptions {
  includeGraphs: boolean;
  includeReplay: boolean;        // Images du replay
  includeRecommendations: boolean;
  includeRawData: boolean;
  language: 'fr' | 'en';
  branding: boolean;             // Logo TrakerDart
}

// Génération PDF
async function generatePDFReport(
  volley: Volley, 
  options: PDFExportOptions
): Promise<Blob> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Page 1: Résumé
  addHeader(pdf, volley.createdAt);
  addScoreSummary(pdf, volley.comparison);
  
  // Page 2: Graphiques
  if (options.includeGraphs) {
    pdf.addPage();
    await addBiomechanicsRadar(pdf, volley.comparison);
    await addAngleCharts(pdf, volley.throws);
  }
  
  // Page 3: Replay (captures)
  if (options.includeReplay) {
    pdf.addPage();
    await addReplayFrames(pdf, volley.throws);
  }
  
  // Page 4: Recommandations
  if (options.includeRecommendations) {
    pdf.addPage();
    addFeedbackList(pdf, volley.throws[0].analysis.feedback);
  }
  
  return pdf.output('blob');
}
```

### 2. Export Vidéo Annotée
```typescript
interface VideoExportOptions {
  resolution: '720p' | '1080p' | '4K';
  fps: 30 | 60;
  codec: 'h264' | 'h265';
  overlays: VideoOverlay[];
  slowMotion: boolean;
  soundtrack: boolean;
}

interface VideoOverlay {
  type: 'angles' | 'skeleton' | 'scores' | 'text';
  position: { x: number; y: number };
  duration: number;
  style: OverlayStyle;
}

// Génération vidéo avec FFmpeg.wasm
async function exportAnnotatedVideo(
  volley: Volley,
  options: VideoExportOptions
): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  
  // Générer frames du replay
  const frames = await generateReplayFrames(volley.throws);
  
  // Ajouter overlays
  const annotatedFrames = await Promise.all(
    frames.map(frame => addOverlays(frame, options.overlays))
  );
  
  // Encoder vidéo
  const videoBlob = await ffmpeg.encode({
    frames: annotatedFrames,
    fps: options.fps,
    codec: options.codec
  });
  
  return videoBlob;
}
```

### 3. Export CSV/JSON
```typescript
// Export données brutes
function exportToCSV(sessions: TrainingSession[]): string {
  const headers = [
    'Date', 'Session ID', 'Volley', 'Lancer',
    'Score Technique', 'Régularité', 
    'Angle Coude', 'Angle Poignet', 'Angle Épaule',
    'Durée (ms)', 'Frames'
  ];
  
  const rows = sessions.flatMap(session =>
    session.volleys.flatMap(volley =>
      volley.throws.map((throwData, idx) => [
        new Date(session.createdAt).toISOString(),
        session.id,
        volley.id,
        idx + 1,
        throwData.analysis.technicalScore,
        volley.comparison.consistencyIndex,
        throwData.analysis.elbow.averageAngle,
        throwData.analysis.wrist.averageAngle,
        throwData.analysis.shoulder.averageAngle,
        throwData.duration,
        throwData.poses.length
      ])
    )
  );
  
  return [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
}

// Export JSON structuré
function exportToJSON(sessions: TrainingSession[]): string {
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    app: 'TrakerDart',
    sessions: sessions.map(session => ({
      id: session.id,
      date: new Date(session.createdAt).toISOString(),
      duration: session.duration,
      stats: session.stats,
      volleys: session.volleys.map(volley => ({
        id: volley.id,
        comparison: volley.comparison,
        throws: volley.throws.map(t => ({
          id: t.id,
          analysis: t.analysis,
          duration: t.duration,
          poseCount: t.poses.length
        }))
      }))
    }))
  };
  
  return JSON.stringify(exportData, null, 2);
}
```

### 4. Partage Social
```typescript
interface SocialShareOptions {
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin';
  content: ShareContent;
  privacy: 'public' | 'friends' | 'private';
}

interface ShareContent {
  image?: Blob;              // Image générée
  video?: Blob;              // Vidéo générée
  text: string;              // Texte accompagnement
  stats: StatsSummary;       // Stats clés
  link?: string;             // Lien vers analyse
}

// Génération image de partage
async function generateShareImage(volley: Volley): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630; // Format OpenGraph
  const ctx = canvas.getContext('2d')!;
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, '#0a0a0a');
  gradient.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);
  
  // Logo TrakerDart
  await drawLogo(ctx, 50, 50);
  
  // Score principal
  ctx.font = 'bold 120px Inter';
  ctx.fillStyle = '#00f2ff';
  ctx.textAlign = 'center';
  ctx.fillText(
    `${volley.comparison.consistencyIndex}%`,
    600, 300
  );
  
  // Label
  ctx.font = '36px Inter';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Régularité', 600, 360);
  
  // Stats secondaires
  drawSecondaryStats(ctx, volley);
  
  // Watermark
  ctx.font = '24px Inter';
  ctx.fillStyle = '#666';
  ctx.textAlign = 'right';
  ctx.fillText('TrakerDart.app', 1150, 600);
  
  return canvasToBlob(canvas);
}

// Partage sur plateforme
async function shareOnPlatform(
  options: SocialShareOptions
): Promise<void> {
  const { platform, content } = options;
  
  switch (platform) {
    case 'twitter':
      const twitterUrl = new URL('https://twitter.com/intent/tweet');
      twitterUrl.searchParams.set('text', content.text);
      if (content.link) {
        twitterUrl.searchParams.set('url', content.link);
      }
      window.open(twitterUrl.toString(), '_blank');
      break;
      
    case 'facebook':
      // Utiliser Facebook Share Dialog
      FB.ui({
        method: 'share',
        href: content.link,
        quote: content.text
      });
      break;
      
    // ... autres plateformes
  }
}
```

### 5. Partage Direct (QR Code)
```typescript
import QRCode from 'qrcode';

async function generateShareLink(volleyId: string): Promise<string> {
  // Créer lien public temporaire (24h)
  const { data, error } = await supabase
    .from('shared_volleys')
    .insert({
      volley_id: volleyId,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      views_remaining: 50
    })
    .select('share_token')
    .single();
    
  if (error) throw error;
  
  const shareUrl = `${window.location.origin}/share/${data.share_token}`;
  
  // Générer QR Code
  const qrCode = await QRCode.toDataURL(shareUrl, {
    width: 300,
    color: {
      dark: '#00f2ff',
      light: '#0a0a0a'
    }
  });
  
  return qrCode;
}
```

## 💻 Implémentation

### Composant d'Export

```typescript
// src/components/export/ExportDialog.tsx
export function ExportDialog({ volley, open, onClose }: ExportDialogProps) {
  const [exportType, setExportType] = useState<'pdf' | 'video' | 'csv' | 'image'>('pdf');
  const [options, setOptions] = useState<ExportOptions>({});
  const [exporting, setExporting] = useState(false);
  
  const handleExport = async () => {
    setExporting(true);
    try {
      let blob: Blob;
      
      switch (exportType) {
        case 'pdf':
          blob = await generatePDFReport(volley, options as PDFExportOptions);
          downloadFile(blob, `trakerdart-${volley.id}.pdf`);
          break;
        case 'video':
          blob = await exportAnnotatedVideo(volley, options as VideoExportOptions);
          downloadFile(blob, `trakerdart-${volley.id}.mp4`);
          break;
        case 'csv':
          const csv = exportToCSV([currentSession!]);
          downloadFile(new Blob([csv], { type: 'text/csv' }), 'data.csv');
          break;
        case 'image':
          blob = await generateShareImage(volley);
          downloadFile(blob, `trakerdart-${volley.id}.png`);
          break;
      }
      
      toast.success('Export réussi !');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
      console.error(error);
    } finally {
      setExporting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Exporter l'analyse</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <ExportTypeSelector value={exportType} onChange={setExportType} />
          <ExportOptions type={exportType} value={options} onChange={setOptions} />
          
          <Button 
            onClick={handleExport} 
            disabled={exporting}
            className="w-full"
          >
            {exporting ? <Loader2 className="animate-spin" /> : 'Exporter'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## 📦 Dépendances

```json
{
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1",
  "@ffmpeg/ffmpeg": "^0.12.10",
  "@ffmpeg/util": "^0.12.1",
  "qrcode": "^1.5.3",
  "canvas": "^2.11.2"
}
```

## ✅ Checklist

- [ ] Export PDF avec graphiques
- [ ] Export vidéo annotée (FFmpeg.wasm)
- [ ] Export CSV/JSON
- [ ] Génération image de partage
- [ ] Intégration réseaux sociaux
- [ ] QR Code de partage
- [ ] Lien de partage temporaire
- [ ] Système de tracking des partages
- [ ] Tests navigateurs
- [ ] Documentation utilisateur

## 🎯 Métriques de Succès

- ✅ 40%+ utilisateurs exportent
- ✅ 15%+ partages sociaux
- ✅ Temps génération PDF < 5s
- ✅ Taille vidéo < 50MB

---

**Difficulté** : ⭐ Faible  
**Durée estimée** : 1-2 semaines  
**Impact** : 💰💰 Moyen (Viralité)
