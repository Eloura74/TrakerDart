/**
 * Service IA Générative avec support multi-modèles OpenAI
 * Architecture flexible pour ajouter facilement d'autres providers
 */

import type {
  AIModel,
  AIModelConfig,
  AIRecommendation,
  AITrainingPlan,
  AIChatMessage,
  AIAnalysisContext,
  AIUsageStats,
} from '@/types/ai';
import { AI_MODELS, AI_SYSTEM_PROMPTS } from '@/types/ai';
import type { TrainingSession } from '@/types';

/**
 * Configuration OpenAI
 */
interface OpenAIConfig {
  apiKey: string;
  organization?: string;
}

/**
 * Message OpenAI
 */
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Réponse OpenAI
 */
interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: OpenAIMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Service IA principal
 */
export class AIService {
  private config: OpenAIConfig;
  private modelConfig: AIModelConfig;
  private baseURL = 'https://api.openai.com/v1';
  private usageStats: AIUsageStats;

  constructor(apiKey: string, modelConfig: AIModelConfig) {
    this.config = { apiKey };
    this.modelConfig = modelConfig;
    this.usageStats = this.loadUsageStats();
  }

  /**
   * Changer le modèle utilisé
   */
  setModel(model: AIModel): void {
    this.modelConfig.model = model;
    this.saveModelConfig();
  }

  /**
   * Mettre à jour la configuration complète
   */
  updateConfig(config: Partial<AIModelConfig>): void {
    this.modelConfig = { ...this.modelConfig, ...config };
    this.saveModelConfig();
  }

  /**
   * Obtenir les métadonnées du modèle actuel
   */
  getCurrentModelMetadata() {
    return AI_MODELS[this.modelConfig.model];
  }

  /**
   * Générer des recommandations à partir des sessions
   */
  async generateRecommendations(
    sessions: TrainingSession[],
    context?: AIAnalysisContext
  ): Promise<AIRecommendation[]> {
    if (!this.modelConfig.enabled) {
      throw new Error('IA désactivée dans les paramètres');
    }

    // Préparer le contexte d'analyse
    const analysis = this.analyzeSessionsData(sessions);
    
    const prompt = `Analyse les données de performance suivantes et génère 3-5 recommandations concrètes pour améliorer le jeu :

${analysis}

${context?.customPrompt ? `\nConsidérations spécifiques : ${context.customPrompt}` : ''}

Format de réponse (JSON) :
{
  "recommendations": [
    {
      "type": "technique|training|mental|equipment|strategy",
      "title": "Titre court",
      "description": "Description détaillée",
      "priority": "low|medium|high",
      "actionItems": ["Action 1", "Action 2"],
      "reasoning": "Pourquoi cette recommandation",
      "estimatedImpact": 75
    }
  ]
}`;

    const response = await this.chat([
      { role: 'system', content: AI_SYSTEM_PROMPTS.coach },
      { role: 'user', content: prompt }
    ]);

    // Parser la réponse JSON
    try {
      const data = JSON.parse(response.content);
      return data.recommendations.map((rec: any) => ({
        ...rec,
        id: crypto.randomUUID(),
        generatedAt: new Date(),
        modelUsed: this.modelConfig.model,
      }));
    } catch (error) {
      console.error('Erreur parsing recommandations:', error);
      throw new Error('Impossible de parser les recommandations IA');
    }
  }

  /**
   * Générer un plan d'entraînement personnalisé
   */
  async generateTrainingPlan(
    sessions: TrainingSession[],
    goal: string,
    duration: number = 30
  ): Promise<AITrainingPlan> {
    if (!this.modelConfig.enabled) {
      throw new Error('IA désactivée dans les paramètres');
    }

    const analysis = this.analyzeSessionsData(sessions);

    const prompt = `Crée un plan d'entraînement personnalisé de ${duration} jours pour atteindre cet objectif : "${goal}"

Données actuelles du joueur :
${analysis}

Format de réponse (JSON) :
{
  "duration": ${duration},
  "goal": "${goal}",
  "currentLevel": "Description du niveau actuel",
  "targetLevel": "Description du niveau visé",
  "weeks": [
    {
      "weekNumber": 1,
      "focus": "Focus de la semaine",
      "sessions": [
        {
          "day": 1,
          "duration": 60,
          "exercises": [
            {
              "name": "Nom exercice",
              "description": "Description",
              "sets": 3,
              "reps": 10,
              "restSeconds": 60,
              "focusArea": "Zone ciblée"
            }
          ],
          "notes": "Notes importantes"
        }
      ]
    }
  ]
}`;

    const response = await this.chat([
      { role: 'system', content: AI_SYSTEM_PROMPTS.trainer },
      { role: 'user', content: prompt }
    ]);

    try {
      const data = JSON.parse(response.content);
      return {
        ...data,
        id: crypto.randomUUID(),
        generatedAt: new Date(),
        modelUsed: this.modelConfig.model,
      };
    } catch (error) {
      console.error('Erreur parsing plan d\'entraînement:', error);
      throw new Error('Impossible de parser le plan d\'entraînement');
    }
  }

  /**
   * Chat interactif avec l'IA
   */
  async chat(
    messages: OpenAIMessage[],
    options?: Partial<AIModelConfig>
  ): Promise<AIChatMessage> {
    const config = { ...this.modelConfig, ...options };

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data: OpenAIResponse = await response.json();
    const message = data.choices[0].message;

    // Mettre à jour les stats d'utilisation
    this.updateUsageStats(data.usage.total_tokens, config.model);

    return {
      id: data.id,
      role: message.role,
      content: message.content,
      timestamp: new Date(),
      modelUsed: config.model,
      tokensUsed: data.usage.total_tokens,
    };
  }

  /**
   * Analyser les données de sessions
   */
  private analyzeSessionsData(sessions: TrainingSession[]): string {
    if (sessions.length === 0) {
      return 'Aucune session disponible pour l\'analyse.';
    }

    const totalThrows = sessions.reduce((sum, s) => sum + (s.stats?.totalThrows || 0), 0);
    const avgConsistency = sessions.reduce((sum, s) => sum + (s.stats?.averageConsistency || 0), 0) / sessions.length;
    const avgTechnical = sessions.reduce((sum, s) => sum + (s.stats?.averageTechnicalScore || 0), 0) / sessions.length;
    
    // Calculer les tendances
    const scores = sessions.map(s => s.stats?.averageConsistency || 0);
    const trend = scores.length > 1 
      ? ((scores[scores.length - 1] - scores[0]) / scores[0] * 100).toFixed(1)
      : '0';

    return `Sessions analysées : ${sessions.length}
Lancers totaux : ${totalThrows}
Régularité moyenne : ${avgConsistency.toFixed(1)}%
Score technique moyen : ${avgTechnical.toFixed(1)}%
Tendance : ${trend}% ${parseFloat(trend) > 0 ? '📈' : '📉'}

Dernière session : ${new Date(sessions[sessions.length - 1].createdAt).toLocaleDateString()}
Temps de pratique total : ${sessions.reduce((sum, s) => sum + (s.duration || 0), 0)} min`;
  }

  /**
   * Mettre à jour les statistiques d'utilisation
   */
  private updateUsageStats(tokensUsed: number, model: AIModel): void {
    const cost = (tokensUsed / 1000) * AI_MODELS[model].costPer1KTokens;

    this.usageStats.totalRequests++;
    this.usageStats.totalTokensUsed += tokensUsed;
    this.usageStats.totalCostUSD += cost;
    this.usageStats.requestsByModel[model] = (this.usageStats.requestsByModel[model] || 0) + 1;
    this.usageStats.lastUsed = new Date();

    this.saveUsageStats();
  }

  /**
   * Obtenir les statistiques d'utilisation
   */
  getUsageStats(): AIUsageStats {
    return { ...this.usageStats };
  }

  /**
   * Réinitialiser les stats (nouveau mois par exemple)
   */
  resetUsageStats(): void {
    this.usageStats = {
      totalRequests: 0,
      totalTokensUsed: 0,
      totalCostUSD: 0,
      requestsByModel: {} as Record<AIModel, number>,
      averageResponseTime: 0,
      lastUsed: new Date(),
    };
    this.saveUsageStats();
  }

  /**
   * Sauvegarder la config du modèle
   */
  private saveModelConfig(): void {
    localStorage.setItem('ai_model_config', JSON.stringify(this.modelConfig));
  }

  /**
   * Charger les stats depuis localStorage
   */
  private loadUsageStats(): AIUsageStats {
    const saved = localStorage.getItem('ai_usage_stats');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      totalRequests: 0,
      totalTokensUsed: 0,
      totalCostUSD: 0,
      requestsByModel: {} as Record<AIModel, number>,
      averageResponseTime: 0,
      lastUsed: new Date(),
    };
  }

  /**
   * Sauvegarder les stats
   */
  private saveUsageStats(): void {
    localStorage.setItem('ai_usage_stats', JSON.stringify(this.usageStats));
  }
}

/**
 * Hook React pour utiliser le service IA
 */
export function useAIService(apiKey: string, modelConfig: AIModelConfig) {
  return new AIService(apiKey, modelConfig);
}
