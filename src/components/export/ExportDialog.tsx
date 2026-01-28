import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrainingSession } from "@/types";
import { ExportService } from "@/services/ExportService";
import { Loader2, FileText, FileJson, Download, Lock, Video } from "lucide-react";
import { checkAndTrackFeature } from "@/services/featureGate";
import { getUserTier } from "@/services/subscription";
import { PaywallModal } from "@/components/subscription/PaywallModal";
import { VideoExportOptionsComponent } from "./VideoExportOptions";
import { VideoExportProgress } from "./VideoExportProgress";
import { exportAnnotatedVideo, downloadVideo } from "@/services/videoExport";
import { VIDEO_RESOLUTIONS } from "@/types/video";
import type { VideoExportOptions, VideoExportProgress as VideoExportProgressType } from "@/types/video";

interface ExportDialogProps {
  session: TrainingSession;
  open: boolean;
  onClose: () => void;
}

export function ExportDialog({ session, open, onClose }: ExportDialogProps) {
  const [format, setFormat] = useState<"pdf" | "json" | "video">("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'elite'>('free');
  const [videoOptions, setVideoOptions] = useState<VideoExportOptions>({
    resolution: '720p',
    fps: 30,
    codec: 'h264',
    overlays: [
      { type: 'skeleton', enabled: true },
      { type: 'angles', enabled: true },
      { type: 'scores', enabled: true },
      { type: 'trajectory', enabled: false },
      { type: 'text', enabled: false }
    ],
    slowMotion: false,
    watermark: true
  });
  const [videoProgress, setVideoProgress] = useState<VideoExportProgressType | null>(null);

  // Charger le tier utilisateur au montage
  useEffect(() => {
    getUserTier().then(setUserTier);
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    setVideoProgress(null);
    
    try {
      if (format === "video") {
        // === EXPORT VIDÉO ===
        // Vérifier l'accès vidéo selon résolution
        const featureKey = VIDEO_RESOLUTIONS[videoOptions.resolution].featureKey;
        const access = await checkAndTrackFeature(featureKey as keyof typeof import('@/config/features').FEATURE_LIMITS);
        
        if (!access.hasAccess) {
          setIsExporting(false);
          setShowPaywall(true);
          return;
        }
        
        // Vérifier qu'il y a au moins une volée
        if (!session.volleys || session.volleys.length === 0) {
          throw new Error('Aucune volée à exporter');
        }
        
        // Exporter la vidéo avec progression
        const videoBlob = await exportAnnotatedVideo(
          session.volleys[0],
          videoOptions,
          (progress) => {
            setVideoProgress(progress);
          }
        );
        
        const videoFilename = `trakerdart-${session.id.slice(0, 8)}.mp4`;
        
        // Télécharger
        downloadVideo(videoBlob, videoFilename);
        onClose();
        return;
      } 
      
      // === EXPORT PDF/JSON ===
      let blob: Blob;
      let filename: string;
      
      if (format === "pdf") {
        // Vérifier l'accès aux exports PDF (premium)
        const access = await checkAndTrackFeature('pdf_exports');
        if (!access.hasAccess) {
          setIsExporting(false);
          setShowPaywall(true);
          return;
        }
        
        blob = await ExportService.generatePDF(session);
        filename = `trakerdart-session-${session.id.slice(0, 8)}.pdf`;
      } else {
        // JSON est gratuit
        const jsonStr = JSON.stringify(session, null, 2);
        blob = new Blob([jsonStr], { type: "application/json" });
        filename = `trakerdart-session-${session.id.slice(0, 8)}.json`;
      }

      // Télécharger le fichier PDF/JSON
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error("Erreur export:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={format === 'video' ? "sm:max-w-[600px]" : "sm:max-w-[425px]"}>
        <DialogHeader>
          <DialogTitle>Exporter la session</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="format">Format d'export</Label>
            <Select
              value={format}
              onValueChange={(v) => setFormat(v as "pdf" | "json" | "video")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Rapport PDF</span>
                    <Lock className="h-3 w-3 text-yellow-500 ml-1" />
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    <span>Données JSON</span>
                  </div>
                </SelectItem>
                <SelectItem value="video">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    <span>Vidéo Annotée</span>
                    <Lock className="h-3 w-3 text-yellow-500 ml-1" />
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options vidéo si format vidéo sélectionné */}
          {format === 'video' && (
            <VideoExportOptionsComponent
              options={videoOptions}
              onChange={setVideoOptions}
              tier={userTier}
            />
          )}

          {/* Progression export vidéo */}
          {videoProgress && (
            <VideoExportProgress progress={videoProgress} />
          )}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </>
            )}
          </Button>
        </div>
      </DialogContent>
      
      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        featureName="Export PDF"
        featureDescription={`Les exports PDF sont réservés aux abonnés Pro et Elite. Passez à Pro pour exporter jusqu'à 10 rapports PDF par mois !`}
        recommendedTier="pro"
        onClose={() => setShowPaywall(false)}
      />
    </Dialog>
  );
}
