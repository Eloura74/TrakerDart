/**
 * Overlay de coaching temps réel
 * Affiche les feedbacks visuels pendant la capture
 */

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import type { CoachingFeedback, Direction } from '@/types/coaching';
import { cn } from '@/lib/utils';

interface CoachingOverlayProps {
  feedback: CoachingFeedback | null;
  show: boolean;
}

export function CoachingOverlay({ feedback, show }: CoachingOverlayProps) {
  if (!show || !feedback) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Message de feedback */}
      <AnimatePresence mode="wait">
        <motion.div
          key={feedback.message}
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20 }}
          className={cn(
            "absolute top-6 left-1/2 -translate-x-1/2",
            "px-6 py-4 rounded-2xl backdrop-blur-xl shadow-2xl",
            "border-2 flex items-center gap-3 max-w-md",
            feedback.type === 'error' && "bg-red-500/20 border-red-500",
            feedback.type === 'warning' && "bg-yellow-500/20 border-yellow-500",
            feedback.type === 'success' && "bg-green-500/20 border-green-500",
            feedback.type === 'tip' && "bg-blue-500/20 border-blue-500"
          )}
        >
          {/* Icône selon le type */}
          <FeedbackIcon type={feedback.type} />

          {/* Message */}
          <p className="text-white font-bold text-base text-center flex-1">
            {feedback.message}
          </p>

          {/* Pulse effect pour erreurs */}
          {feedback.visualCue?.pulse && feedback.type === 'error' && (
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-red-500"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Flèche directionnelle */}
      {feedback.direction && (
        <DirectionalArrow direction={feedback.direction} />
      )}

      {/* Indicateur de sévérité */}
      {feedback.severity > 70 && (
        <SeverityIndicator severity={feedback.severity} />
      )}
    </div>
  );
}

/**
 * Icône selon le type de feedback
 */
function FeedbackIcon({ type }: { type: CoachingFeedback['type'] }) {
  const iconProps = { className: 'h-6 w-6' };

  switch (type) {
    case 'error':
      return <AlertCircle {...iconProps} className="h-6 w-6 text-red-400 animate-pulse" />;
    case 'warning':
      return <AlertTriangle {...iconProps} className="h-6 w-6 text-yellow-400" />;
    case 'success':
      return <CheckCircle {...iconProps} className="h-6 w-6 text-green-400" />;
    case 'tip':
      return <Lightbulb {...iconProps} className="h-6 w-6 text-blue-400" />;
  }
}

/**
 * Flèche directionnelle animée
 */
function DirectionalArrow({ direction }: { direction: Direction }) {
  const arrows = {
    up: '⬆️',
    down: '⬇️',
    left: '⬅️',
    right: '➡️'
  };

  const animations = {
    up: { y: [-15, -5, -15] },
    down: { y: [5, 15, 5] },
    left: { x: [-15, -5, -15] },
    right: { x: [5, 15, 5] }
  };

  return (
    <motion.div
      animate={animations[direction]}
      transition={{
        repeat: Infinity,
        duration: 1,
        ease: 'easeInOut'
      }}
      className="absolute bottom-24 left-1/2 -translate-x-1/2 text-7xl drop-shadow-2xl"
    >
      {arrows[direction]}
    </motion.div>
  );
}

/**
 * Indicateur visuel de sévérité
 */
function SeverityIndicator({ severity }: { severity: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute top-24 right-6 flex flex-col items-center gap-2"
    >
      <div className="text-xs text-white/60 uppercase tracking-wider font-bold">
        Urgence
      </div>
      <div className="relative w-16 h-16">
        {/* Cercle de fond */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="#ffffff20"
            strokeWidth="4"
            fill="none"
          />
          {/* Cercle de progression */}
          <motion.circle
            cx="32"
            cy="32"
            r="28"
            stroke={severity > 80 ? '#ff0055' : '#ffaa00'}
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 28}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
            animate={{
              strokeDashoffset: 2 * Math.PI * 28 * (1 - severity / 100)
            }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        {/* Pourcentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {severity}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
