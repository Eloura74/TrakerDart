/**
 * Types pour le système d'IA générative
 * Support multi-modèles avec configuration flexible
 */

/**
 * Modèles IA disponibles
 */
export type AIModel = 
  | 'gpt-3.5-turbo'      // Le moins cher (~0.002$/1K tokens)
  | 'gpt-4'              // Plus précis (~0.03$/1K tokens)
  | 'gpt-4-turbo'        // Rapide + précis (~0.01$/1K tokens)
  | 'gpt-4o'             // Multimodal (~0.005$/1K tokens)
  | 'gpt-4o-mini';       // Mini version (~0.0015$/1K tokens)

/**
 * Configuration du modèle IA
 */
export interface AIModelConfig {
  model: AIModel;
  temperature: number;        // 0-2, créativité des réponses
  maxTokens: number;          // Limite de tokens par réponse
  enabled: boolean;           // Activer/désactiver l'IA
}

/**
 * Métadonnées des modèles
 */
export interface AIModelMetadata {
  id: AIModel;
  name: string;
  description: string;
  costPer1KTokens: number;    // En USD
  speed: 'slow' | 'medium' | 'fast';
  quality: 'good' | 'better' | 'best';
  maxContextTokens: number;
  recommended: boolean;
}

/**
 * Types de recommandations IA
 */
export type RecommendationType = 
  | 'technique'       // Amélioration technique
  | 'training'        // Plan d'entraînement
  | 'mental'          // Préparation mentale
  | 'equipment'       // Équipement recommandé
  | 'strategy';       // Stratégie de jeu

/**
 * Recommandation IA générée
 */
export interface AIRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionItems: string[];      // Liste d'actions concrètes
  reasoning: string;          // Pourquoi cette recommandation
  estimatedImpact: number;    // 0-100, impact estimé
  generatedAt: Date;
  modelUsed: AIModel;
}

/**
 * Plan d'entraînement IA
 */
export interface AITrainingPlan {
  id: string;
  duration: number;           // Durée en jours
  goal: string;               // Objectif principal
  currentLevel: string;       // Niveau actuel
  targetLevel: string;        // Niveau visé
  weeks: AITrainingWeek[];
  generatedAt: Date;
  modelUsed: AIModel;
}

/**
 * Semaine d'entraînement
 */
export interface AITrainingWeek {
  weekNumber: number;
  focus: string;              // Focus de la semaine
  sessions: AITrainingSession[];
}

/**
 * Session d'entraînement
 */
export interface AITrainingSession {
  day: number;
  duration: number;           // Minutes
  exercises: AIExercise[];
  notes: string;
}

/**
 * Exercice recommandé
 */
export interface AIExercise {
  name: string;
  description: string;
  sets: number;
  reps: number;
  restSeconds: number;
  focusArea: string;
}

/**
 * Contexte pour génération IA
 */
export interface AIAnalysisContext {
  userId: string;
  sessionIds: string[];       // Sessions à analyser
  timeRange?: {
    start: Date;
    end: Date;
  };
  focusAreas?: string[];      // Zones spécifiques à analyser
  customPrompt?: string;      // Prompt custom de l'utilisateur
}

/**
 * Réponse du chat IA
 */
export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  modelUsed?: AIModel;
  tokensUsed?: number;
}

/**
 * Historique de conversation
 */
export interface AIChatConversation {
  id: string;
  title: string;
  messages: AIChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  totalTokensUsed: number;
}

/**
 * Statistiques d'utilisation IA
 */
export interface AIUsageStats {
  totalRequests: number;
  totalTokensUsed: number;
  totalCostUSD: number;
  requestsByModel: Record<AIModel, number>;
  averageResponseTime: number;
  lastUsed: Date;
}

/**
 * Configuration complète IA
 */
export interface AISettings {
  modelConfig: AIModelConfig;
  autoGenerateRecommendations: boolean;
  chatEnabled: boolean;
  trainingPlanEnabled: boolean;
  monthlyBudgetUSD?: number;  // Budget mensuel optionnel
}

/**
 * Métadonnées des modèles disponibles
 */
export const AI_MODELS: Record<AIModel, AIModelMetadata> = {
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Rapide et économique, idéal pour la plupart des usages',
    costPer1KTokens: 0.002,
    speed: 'fast',
    quality: 'good',
    maxContextTokens: 16385,
    recommended: true,
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Version compacte de GPT-4o, excellent rapport qualité/prix',
    costPer1KTokens: 0.0015,
    speed: 'fast',
    quality: 'better',
    maxContextTokens: 128000,
    recommended: true,
  },
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Multimodal, très rapide et précis',
    costPer1KTokens: 0.005,
    speed: 'fast',
    quality: 'best',
    maxContextTokens: 128000,
    recommended: false,
  },
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Très précis avec contexte étendu',
    costPer1KTokens: 0.01,
    speed: 'medium',
    quality: 'best',
    maxContextTokens: 128000,
    recommended: false,
  },
  'gpt-4': {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Le plus précis, analyse approfondie',
    costPer1KTokens: 0.03,
    speed: 'slow',
    quality: 'best',
    maxContextTokens: 8192,
    recommended: false,
  },
};

/**
 * Configuration par défaut
 */
export const DEFAULT_AI_SETTINGS: AISettings = {
  modelConfig: {
    model: 'gpt-3.5-turbo',   // Par défaut : le moins cher
    temperature: 0.7,          // Équilibre créativité/précision
    maxTokens: 1000,           // Limite raisonnable
    enabled: true,
  },
  autoGenerateRecommendations: false,
  chatEnabled: true,
  trainingPlanEnabled: true,
};

/**
 * Templates de prompts système
 */
export const AI_SYSTEM_PROMPTS = {
  coach: `Tu es un coach professionnel de fléchettes avec 20 ans d'expérience.
Tu analyses les performances biomécaniques et donnes des conseils précis, actionnables et bienveillants.
Utilise des termes techniques mais reste accessible.`,

  analyst: `Tu es un analyste biomécanique spécialisé dans les sports de précision.
Tu fournis des analyses détaillées basées sur des données métriques.
Sois précis, quantitatif et objectif.`,

  trainer: `Tu es un préparateur physique et mental pour joueurs de fléchettes de haut niveau.
Tu conçois des plans d'entraînement personnalisés, progressifs et motivants.
Prends en compte le niveau actuel et les objectifs à long terme.`,
} as const;
