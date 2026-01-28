# 🎯 Plan d'Action Immédiat - TrakerDart
## Roadmap des 7 Prochains Jours

> **Objectif**: Finaliser le système premium et préparer Phase 2 (Coaching)

---

## 📅 AUJOURD'HUI - 28 Janvier 2026

### ✅ Déjà Fait
- ✅ Analyse complète des 12 fichiers de documentation
- ✅ Document ARCHITECTURE-COMPLETE.md créé
- ✅ Compréhension de l'état actuel du projet

### 🔴 À Faire Maintenant (2-3h)

#### 1. Intégrer Feature Gating - Création Sessions
**Fichier**: `src/pages/CapturePageAuto.tsx`

```typescript
// À ajouter en début de composant
import { checkAndTrackFeature } from '@/services/featureGate';
import { PaywallModal } from '@/components/subscription/PaywallModal';

const [showPaywall, setShowPaywall] = useState(false);
const [paywallFeature, setPaywallFeature] = useState<string>('');

// Avant de créer une session
const handleStartSession = async () => {
  // Vérifier limite sessions
  const access = await checkAndTrackFeature('sessions_per_month');
  
  if (!access.hasAccess) {
    setPaywallFeature('sessions_per_month');
    setShowPaywall(true);
    return;
  }
  
  // Continuer création session...
  startSession();
};

// Ajouter dans le JSX
{showPaywall && (
  <PaywallModal
    featureName="Sessions d'entraînement"
    featureDescription={`Vous avez atteint la limite de sessions pour ce mois. Passez à Pro pour sessions illimitées !`}
    featureKey={paywallFeature}
    onClose={() => setShowPaywall(false)}
  />
)}
```

#### 2. Intégrer Feature Gating - Exports
**Fichier**: `src/components/export/ExportDialog.tsx`

```typescript
// Avant export PDF
const handleExportPDF = async () => {
  const access = await checkAndTrackFeature('pdf_exports');
  
  if (!access.hasAccess) {
    setPaywallFeature('pdf_exports');
    setShowPaywall(true);
    return;
  }
  
  // Continuer export...
  await generatePDFReport(volley, options);
};

// Avant export vidéo
const handleExportVideo = async (resolution: string) => {
  let featureKey = 'video_export_720p';
  if (resolution === '1080p') featureKey = 'video_export_1080p';
  if (resolution === '4K') featureKey = 'video_export_4k';
  
  const access = await checkAndTrackFeature(featureKey);
  
  if (!access.hasAccess) {
    setPaywallFeature(featureKey);
    setShowPaywall(true);
    return;
  }
  
  // Continuer export...
  await exportAnnotatedVideo(volley, { resolution, ...options });
};
```

#### 3. Afficher Usage/Limites - Dashboard
**Fichier**: `src/pages/HomePage.tsx`

```typescript
// Nouveau composant à créer
import { UsageBanner } from '@/components/subscription/UsageBanner';

// Dans HomePage, ajouter en haut
<div className="space-y-6">
  <UsageBanner />
  
  {/* Widgets existants */}
  <DashboardLayout widgets={widgets} />
</div>
```

**Nouveau fichier**: `src/components/subscription/UsageBanner.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { getUserTier, getFeatureUsage } from '@/services/featureGate';
import { UsageProgress } from './UsageProgress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function UsageBanner() {
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [usage, setUsage] = useState<Record<string, number>>({});
  const navigate = useNavigate();
  
  useEffect(() => {
    loadUsageData();
  }, []);
  
  const loadUsageData = async () => {
    const userTier = await getUserTier();
    setTier(userTier);
    
    // Charger usage des features principales
    const sessions = await getFeatureUsage('sessions_per_month');
    const pdfExports = await getFeatureUsage('pdf_exports');
    
    setUsage({
      sessions: sessions.usage,
      pdf: pdfExports.usage
    });
  };
  
  if (tier === 'elite') return null; // Elite = illimité, pas besoin d'afficher
  
  const sessionsLimit = tier === 'free' ? 10 : Infinity;
  const pdfLimit = tier === 'free' ? 0 : 10;
  
  return (
    <Card className="p-4 border-cyan-500/20">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <h3 className="text-sm font-semibold text-white">
            Usage ce mois
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Sessions */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Sessions</span>
                <span className="text-xs text-white">
                  {usage.sessions || 0} / {tier === 'free' ? 10 : '∞'}
                </span>
              </div>
              {tier === 'free' && (
                <UsageProgress 
                  current={usage.sessions || 0} 
                  limit={10} 
                />
              )}
            </div>
            
            {/* PDF Exports */}
            {tier !== 'free' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">PDF Exports</span>
                  <span className="text-xs text-white">
                    {usage.pdf || 0} / {tier === 'pro' ? 10 : '∞'}
                  </span>
                </div>
                {tier === 'pro' && (
                  <UsageProgress 
                    current={usage.pdf || 0} 
                    limit={10} 
                  />
                )}
              </div>
            )}
          </div>
        </div>
        
        {tier === 'free' && (
          <Button 
            onClick={() => navigate('/pricing')}
            className="ml-4"
            variant="default"
          >
            Passer à Pro
          </Button>
        )}
      </div>
    </Card>
  );
}
```

---

## 📅 DEMAIN - 29 Janvier 2026

### 🟡 Tests & Validation (3-4h)

#### 1. Tester Flow Complet Premium
- [ ] Test tier Free: Créer 10 sessions → Paywall apparaît ✅
- [ ] Test tier Pro (dev): Créer 20+ sessions → Pas de limite ✅
- [ ] Test export PDF Free: Bouton "🔒 Premium" ✅
- [ ] Test export PDF Pro: Fonctionne + compteur ✅
- [ ] Test PaywallModal: Design + bouton "Upgrade" → /pricing ✅

#### 2. Améliorer UX Paywall
- [ ] Ajouter icônes dans PaywallModal (Lucide)
- [ ] Animation entrée/sortie (Framer Motion)
- [ ] Afficher preview feature (screenshot)
- [ ] Bouton "Voir toutes les features" → /pricing

#### 3. Analytics Basiques
**Créer**: `src/services/analytics.ts`

```typescript
// Tracker événements importants
export async function trackEvent(
  eventName: string, 
  properties?: Record<string, any>
) {
  // Pour l'instant: console.log
  // Plus tard: Intégrer Plausible/Posthog
  console.log('[Analytics]', eventName, properties);
  
  // Optionnel: Stocker dans Supabase
  await supabase.from('analytics_events').insert({
    event_name: eventName,
    properties,
    user_id: (await supabase.auth.getUser()).data.user?.id,
    created_at: new Date().toISOString()
  });
}

// Événements à tracker:
// - paywall_shown (feature)
// - upgrade_clicked (from, to)
// - feature_used (feature_key, success)
// - session_created
// - export_pdf
// - export_video
```

---

## 📅 JEUDI 30 - VENDREDI 31 Janvier

### 🟢 Préparation Phase 2 - Coaching (4-5h)

#### 1. Créer Structure Dossiers
```bash
mkdir src/components/coaching
mkdir src/services/coaching
mkdir src/hooks/coaching
mkdir public/audio/coaching
```

#### 2. Types & Interfaces
**Créer**: `src/types/coaching.ts`

```typescript
export type CoachingMode = 'visual' | 'audio' | 'haptic' | 'all';
export type CoachingSensitivity = 'relaxed' | 'normal' | 'strict';
export type FeedbackType = 'error' | 'warning' | 'success' | 'info';
export type JointName = 'elbow' | 'wrist' | 'shoulder' | 'hip' | 'knee';

export interface RealtimeCoaching {
  enabled: boolean;
  mode: CoachingMode;
  sensitivity: CoachingSensitivity;
  focusAreas: CoachingFocusArea[];
}

export interface CoachingFocusArea {
  joint: JointName;
  threshold: number;
  priority: 'low' | 'medium' | 'high';
}

export interface CoachingFeedback {
  type: FeedbackType;
  joint: JointName;
  message: string;
  visualCue?: {
    highlight: JointName;
    color: string;
  };
  audioFile?: string;
  vibrationPattern?: number[];
  direction?: 'up' | 'down' | 'left' | 'right';
}

export interface ThrowPhase {
  type: 'preparation' | 'acceleration' | 'release' | 'follow_through';
  startFrame: number;
  endFrame: number;
  duration: number;
  quality: number;
}
```

#### 3. Classe RealtimeCoach - Version 1
**Créer**: `src/services/coaching/realtimeCoach.ts`

```typescript
import { Pose, Keypoint } from '@/types';
import { CoachingFeedback, CoachingSensitivity } from '@/types/coaching';
import { Calibration } from '@/types/calibration';

export class RealtimeCoach {
  private lastFeedback: number = 0;
  private feedbackCooldown: number = 2000; // 2s entre feedbacks
  private sensitivity: CoachingSensitivity = 'normal';
  
  constructor(sensitivity: CoachingSensitivity = 'normal') {
    this.sensitivity = sensitivity;
    
    // Ajuster cooldown selon sensibilité
    if (sensitivity === 'relaxed') this.feedbackCooldown = 3000;
    if (sensitivity === 'strict') this.feedbackCooldown = 1500;
  }
  
  /**
   * Analyse une pose en temps réel et retourne un feedback si erreur détectée
   * @param pose - Pose détectée par MediaPipe
   * @param calibration - Données de calibration utilisateur
   * @returns CoachingFeedback si erreur, null sinon
   */
  analyzePose(pose: Pose, calibration: Calibration): CoachingFeedback | null {
    const now = Date.now();
    
    // Éviter spam: respecter le cooldown
    if (now - this.lastFeedback < this.feedbackCooldown) {
      return null;
    }
    
    // 1. Vérifier angle du coude
    const elbowAngle = this.calculateElbowAngle(pose.keypoints, calibration.dominantHand);
    if (elbowAngle < 70 || elbowAngle > 150) {
      this.lastFeedback = now;
      return {
        type: 'error',
        joint: 'elbow',
        message: elbowAngle < 70 
          ? 'Coude trop fermé! Ouvrez l\'angle' 
          : 'Coude trop ouvert! Fléchissez légèrement',
        visualCue: { highlight: 'elbow', color: '#ff0055' },
        audioFile: 'coude_incorrect.mp3'
      };
    }
    
    // 2. Vérifier alignement des épaules
    const shoulderAlignment = this.calculateShoulderAlignment(pose.keypoints);
    if (Math.abs(shoulderAlignment) > 15) {
      this.lastFeedback = now;
      return {
        type: 'warning',
        joint: 'shoulder',
        message: 'Épaules non alignées! Redressez-vous',
        visualCue: { highlight: 'shoulder', color: '#ffaa00' }
      };
    }
    
    // 3. Vérifier stabilité du regard
    const gazeStability = this.calculateGazeStability(pose.keypoints);
    if (!gazeStability) {
      this.lastFeedback = now;
      return {
        type: 'info',
        joint: 'shoulder', // Utiliser shoulder comme proxy pour tête
        message: 'Fixez la cible du regard',
        visualCue: { highlight: 'shoulder', color: '#00f2ff' }
      };
    }
    
    return null;
  }
  
  /**
   * Calcule l'angle du coude en degrés
   */
  private calculateElbowAngle(keypoints: Keypoint[], hand: 'left' | 'right'): number {
    const shoulder = keypoints.find(k => k.name === `${hand}_shoulder`);
    const elbow = keypoints.find(k => k.name === `${hand}_elbow`);
    const wrist = keypoints.find(k => k.name === `${hand}_wrist`);
    
    if (!shoulder || !elbow || !wrist) return 90; // Valeur par défaut
    
    // Vecteur épaule → coude
    const v1 = {
      x: shoulder.x - elbow.x,
      y: shoulder.y - elbow.y
    };
    
    // Vecteur coude → poignet
    const v2 = {
      x: wrist.x - elbow.x,
      y: wrist.y - elbow.y
    };
    
    // Calcul angle via produit scalaire
    const dotProduct = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2);
    const mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2);
    
    const angleRad = Math.acos(dotProduct / (mag1 * mag2));
    return (angleRad * 180) / Math.PI;
  }
  
  /**
   * Calcule l'alignement des épaules (doit être proche de 0° = horizontal)
   */
  private calculateShoulderAlignment(keypoints: Keypoint[]): number {
    const leftShoulder = keypoints.find(k => k.name === 'left_shoulder');
    const rightShoulder = keypoints.find(k => k.name === 'right_shoulder');
    
    if (!leftShoulder || !rightShoulder) return 0;
    
    // Calcul angle par rapport à l'horizontale
    const deltaY = rightShoulder.y - leftShoulder.y;
    const deltaX = rightShoulder.x - leftShoulder.x;
    
    const angleRad = Math.atan2(deltaY, deltaX);
    return (angleRad * 180) / Math.PI;
  }
  
  /**
   * Vérifie si le regard est stable (tête peu mobile)
   */
  private calculateGazeStability(keypoints: Keypoint[]): boolean {
    // Pour l'instant, toujours retourner true
    // TODO: Implémenter détection mouvement tête avec historique positions
    return true;
  }
}
```

#### 4. Composant CoachingOverlay - Version 1
**Créer**: `src/components/coaching/CoachingOverlay.tsx`

```typescript
import { motion, AnimatePresence } from 'framer-motion';
import { CoachingFeedback } from '@/types/coaching';
import { cn } from '@/lib/utils';

interface CoachingOverlayProps {
  feedback: CoachingFeedback | null;
}

/**
 * Overlay visuel qui affiche les feedbacks de coaching en temps réel
 * Apparaît par-dessus le flux vidéo pendant la capture
 */
export function CoachingOverlay({ feedback }: CoachingOverlayProps) {
  if (!feedback) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Message de feedback */}
      <AnimatePresence>
        <motion.div
          key={feedback.message}
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "absolute top-4 left-1/2 -translate-x-1/2",
            "px-6 py-3 rounded-full backdrop-blur-xl",
            "border-2 shadow-2xl max-w-md text-center",
            feedback.type === 'error' && "bg-red-500/20 border-red-500",
            feedback.type === 'warning' && "bg-yellow-500/20 border-yellow-500",
            feedback.type === 'success' && "bg-green-500/20 border-green-500",
            feedback.type === 'info' && "bg-cyan-500/20 border-cyan-500"
          )}
        >
          <p className="text-white font-bold text-lg">
            {feedback.message}
          </p>
        </motion.div>
      </AnimatePresence>
      
      {/* Flèche directionnelle (si présente) */}
      {feedback.direction && (
        <DirectionalArrow direction={feedback.direction} />
      )}
    </div>
  );
}

/**
 * Flèche animée indiquant la direction de correction
 */
function DirectionalArrow({ direction }: { direction: 'up' | 'down' | 'left' | 'right' }) {
  const arrows = {
    up: '⬆️',
    down: '⬇️',
    left: '⬅️',
    right: '➡️'
  };
  
  const animations = {
    up: { y: [-10, 0, -10] },
    down: { y: [10, 0, 10] },
    left: { x: [-10, 0, -10] },
    right: { x: [10, 0, 10] }
  };
  
  return (
    <motion.div
      animate={animations[direction]}
      transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
      className="absolute bottom-20 left-1/2 -translate-x-1/2 text-7xl filter drop-shadow-2xl"
    >
      {arrows[direction]}
    </motion.div>
  );
}
```

---

## 📅 WEEKEND - 1-2 Février

### 🎨 Polish UI & Documentation (3-4h)

#### 1. Créer README pour Développeurs
**Créer**: `docs/DEV-GUIDE.md`

```markdown
# Guide Développeur TrakerDart

## Setup Initial
\`\`\`bash
npm install
cp .env.example .env
# Éditer .env avec vos clés Supabase
npm run dev
\`\`\`

## Mode Développement Premium
- VITE_DEV_MODE=true → Bypass auth + PayPal
- VITE_DEV_DEFAULT_TIER=elite → Toutes features débloquées

## Ajouter une Feature Premium
1. Config: \`src/config/features.ts\`
2. DB: Ajouter ligne \`feature_gates\`
3. Code: \`checkAndTrackFeature('ma_feature')\`
4. UI: Afficher paywall si !hasAccess

## Architecture
Voir \`docs/ARCHITECTURE-COMPLETE.md\`
```

#### 2. Améliorer SubscriptionPage
- [ ] Ajouter graphique usage mensuel (Chart.js)
- [ ] Bouton "Gérer abonnement" (PayPal)
- [ ] Historique des transactions
- [ ] Section "Prochaine facturation"

#### 3. Tests Manuels Complets
- [ ] Test tous les flows premium
- [ ] Test responsive mobile
- [ ] Test performance (DevTools)
- [ ] Screenshots pour documentation

---

## 📅 SEMAINE PROCHAINE - 3-7 Février

### 🚀 Lancement Phase 2 - Coaching (20h)

#### Lundi-Mardi: Core Coaching
- [ ] Finaliser RealtimeCoach class
- [ ] Hook useRealtimeCoaching
- [ ] Intégration dans CapturePageAuto
- [ ] Tests erreurs coude/épaules

#### Mercredi-Jeudi: Audio Feedback
- [ ] Classe AudioCoach (Web Audio API)
- [ ] Enregistrer 10 fichiers audio coaching
- [ ] Intégration TTS (Web Speech API)
- [ ] Tests audio sur différents navigateurs

#### Vendredi: Tests & Optimisation
- [ ] Tests performance 60 FPS
- [ ] Optimisation détection (throttle)
- [ ] Tests UX avec utilisateurs
- [ ] Documentation coaching

---

## 🎯 OBJECTIFS DE LA SEMAINE

### Critères de Succès
- ✅ Feature gating opérationnel sur 4 features principales
- ✅ UsageBanner affiché sur toutes les pages
- ✅ PaywallModal design parfait
- ✅ Analytics basiques en place
- ✅ Structure coaching créée
- ✅ RealtimeCoach v1 fonctionnel

### Métriques
- 0 bugs bloquants
- 100% features premium testées
- Documentation à jour
- Prêt pour Phase 2

---

## 📝 NOTES

### Commandes Utiles
```bash
# Dev
npm run dev

# Test build
npm run build
npm run preview

# Pages à tester
http://localhost:5173/#/
http://localhost:5173/#/pricing
http://localhost:5173/#/subscription
http://localhost:5173/#/dev
```

### Fichiers Critiques
- `.env` - Variables d'environnement
- `src/config/features.ts` - Config features premium
- `src/services/featureGate.ts` - Logic feature gating
- `supabase/migrations/` - Schéma DB

---

**Créé le**: 28 janvier 2026  
**Auteur**: Cascade AI pour @Eloura74  
**Statut**: 🔴 EN COURS
