/**
 * Page de calibration avancée avec marqueurs ArUco
 * Permet une calibration 3D précise de la caméra
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/layout/AppHeader';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Camera,
  Target,
  CheckCircle,
  Loader2,
  Save,
  Download,
} from 'lucide-react';
import { getArucoDetector } from '@/services/arucoDetector';
import { TRAKERDART_TARGET_CONFIG, getCalibrationQuality, CALIBRATION_QUALITY_MESSAGES } from '@/types/aruco';
import type { CalibrationState } from '@/types/aruco';

export function ArucoCalibrationPage() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [state, setState] = useState<CalibrationState>({
    status: 'idle',
    detectedMarkers: [],
    capturedFrames: [],
    targetConfig: TRAKERDART_TARGET_CONFIG,
  });

  // Initialiser la caméra
  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 1280, height: 720 },
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Initialiser le détecteur ArUco
        const detector = getArucoDetector();
        await detector.initialize('DICT_5X5_50');

        toast({
          title: 'Caméra prête',
          description: 'Positionnez la cible avec les marqueurs ArUco',
        });
      } catch (error) {
        toast({
          title: 'Erreur caméra',
          description: 'Impossible d\'accéder à la caméra',
          variant: 'destructive',
        });
      }
    };

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Détection en temps réel
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || state.status !== 'detecting') {
      return;
    }

    const detector = getArucoDetector();
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const detectInterval = setInterval(() => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        try {
          const markers = detector.detectMarkers(video);
          
          setState(prev => ({
            ...prev,
            detectedMarkers: markers,
          }));

          // Dessiner les marqueurs
          const ctx = canvas.getContext('2d')!;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          detector.drawMarkers(canvas, markers, { showIds: true });
        } catch (error) {
          console.error('Erreur détection:', error);
        }
      }
    }, 100);

    return () => clearInterval(detectInterval);
  }, [state.status]);

  const startDetection = () => {
    setState(prev => ({ ...prev, status: 'detecting' }));
  };

  const captureFrame = () => {
    if (!videoRef.current || state.detectedMarkers.length === 0) {
      toast({
        title: 'Aucun marqueur',
        description: 'Aucun marqueur ArUco détecté',
        variant: 'destructive',
      });
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    setState(prev => ({
      ...prev,
      capturedFrames: [
        ...prev.capturedFrames,
        {
          imageData,
          markers: prev.detectedMarkers,
          timestamp: new Date(),
        },
      ],
    }));

    toast({
      title: 'Frame capturée',
      description: `${state.capturedFrames.length + 1} frames total`,
    });
  };

  const calibrate = async () => {
    if (state.capturedFrames.length < 5) {
      toast({
        title: 'Pas assez de frames',
        description: 'Capturez au moins 5 frames différentes',
        variant: 'destructive',
      });
      return;
    }

    setState(prev => ({ ...prev, status: 'calibrating' }));

    try {
      const detector = getArucoDetector();
      const result = await detector.calibrateCamera(
        state.capturedFrames,
        state.targetConfig,
        {
          width: videoRef.current!.videoWidth,
          height: videoRef.current!.videoHeight,
        }
      );

      setState(prev => ({
        ...prev,
        status: 'complete',
        result,
      }));

      const quality = getCalibrationQuality(result);
      const qualityMsg = CALIBRATION_QUALITY_MESSAGES[quality];

      toast({
        title: qualityMsg.title,
        description: `Erreur: ${result.reprojectionError.toFixed(2)} pixels`,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error.message,
      }));

      toast({
        title: 'Erreur calibration',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <AppHeader />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold mt-4 mb-2">Calibration ArUco Avancée</h1>
          <p className="text-muted-foreground">
            Calibration précise 3D avec marqueurs fiduciaires
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Vidéo */}
          <div className="space-y-4">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Vue Caméra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                  />
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={startDetection}
                    disabled={state.status === 'detecting'}
                    className="flex-1"
                  >
                    {state.status === 'detecting' ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Target className="h-4 w-4 mr-2" />
                    )}
                    {state.status === 'detecting' ? 'Détection...' : 'Démarrer Détection'}
                  </Button>

                  <Button
                    onClick={captureFrame}
                    disabled={state.status !== 'detecting' || state.detectedMarkers.length === 0}
                    variant="outline"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Capturer
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* État */}
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Marqueurs détectés</span>
                    <Badge variant={state.detectedMarkers.length > 0 ? 'default' : 'secondary'}>
                      {state.detectedMarkers.length} / 4
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Frames capturées</span>
                    <Badge variant={state.capturedFrames.length >= 5 ? 'default' : 'secondary'}>
                      {state.capturedFrames.length} / 5 min
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Résultats */}
          <div className="space-y-4">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Calibration</CardTitle>
                <CardDescription>
                  Capturez 5-10 frames avec la cible visible
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={calibrate}
                  disabled={state.capturedFrames.length < 5 || state.status === 'calibrating'}
                  className="w-full"
                >
                  {state.status === 'calibrating' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Calibrer
                </Button>

                {state.result && (
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Qualité</p>
                      <Badge className="mt-1">
                        {getCalibrationQuality(state.result)}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Erreur reprojection</p>
                      <p className="text-2xl font-bold">
                        {state.result.reprojectionError.toFixed(2)} px
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Frames</p>
                        <p className="font-medium">{state.result.framesUsed}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Focale X</p>
                        <p className="font-medium">{state.result.focalLength.x.toFixed(1)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>1. Imprimez la cible avec marqueurs ArUco</p>
                <p>2. Cliquez "Démarrer Détection"</p>
                <p>3. Positionnez la cible devant la caméra</p>
                <p>4. Capturez 5-10 frames sous différents angles</p>
                <p>5. Cliquez "Calibrer"</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
