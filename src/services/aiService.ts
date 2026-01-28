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
} from "@/types/ai";
import { AI_MODELS, AI_SYSTEM_PROMPTS } from "@/types/ai";
import type { TrainingSession } from "@/types";

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
  role: "system" | "user" | "assistant";
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
  private baseURL = "https://api.openai.com/v1";
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
      throw new Error("IA désactivée dans les paramètres");
    }

    // Préparer le contexte d'analyse
    const analysis = this.analyzeSessionsData(sessions);

    const prompt = `Données: ${analysis}

${context?.customPrompt ? `Focus: ${context.customPrompt}` : ""}

Génère EXACTEMENT 2 recommandations ULTRA COURTES en JSON strict:

{
  "recommendations": [
    {
      "type": "technique",
      "title": "Améliorer la régularité",
      "description": "Travailler la constance du geste.",
      "priority": "high",
      "actionItems": ["Exercices répétitifs", "Analyse vidéo"],
      "reasoning": "Plus de régularité = plus de précision",
      "estimatedImpact": 75
    },
    {
      "type": "training",
      "title": "Entraînement intensif",
      "description": "Sessions plus fréquentes.",
      "priority": "medium",
      "actionItems": ["3x par semaine", "Focus technique"],
      "reasoning": "Pratique régulière = progression",
      "estimatedImpact": 65
    }
  ]
}

Réponds UNIQUEMENT le JSON, rien d'autre.`;

    const response = await this.chat([
      { role: "system", content: AI_SYSTEM_PROMPTS.coach },
      { role: "user", content: prompt },
    ]);

    // Parser la réponse JSON (avec extraction robuste)
    try {
      const jsonContent = this.extractJSON(response.content);
      const data = JSON.parse(jsonContent);

      if (!data.recommendations || !Array.isArray(data.recommendations)) {
        throw new Error("Format de réponse invalide");
      }

      return data.recommendations.map(
        (rec: Partial<AIRecommendation>) =>
          ({
            ...rec,
            id: crypto.randomUUID(),
            generatedAt: new Date(),
            modelUsed: this.modelConfig.model,
          } as AIRecommendation)
      );
    } catch (error) {
      console.error("Erreur parsing recommandations:", error);
      console.error("Contenu reçu:", response.content);
      throw new Error(
        "Impossible de parser les recommandations IA. Essayez de réduire la température ou changez de modèle."
      );
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
      throw new Error("IA désactivée dans les paramètres");
    }

    const analysis = this.analyzeSessionsData(sessions);

    // Calculer nombre de semaines (max 4 pour plan complet)
    const weeksCount = Math.min(Math.ceil(duration / 7), 4);

    const prompt = `Tu es un COACH PROFESSIONNEL DE FLÉCHETTES (darts). Crée un plan d'entraînement de ${duration} jours.

OBJECTIF: ${goal}

DONNÉES JOUEUR:
${analysis}

⚠️ CONTEXTE IMPORTANT:
- TrakerDart analyse la BIOMÉCANIQUE du geste de lancer de fléchettes
- On mesure: régularité du geste, angles articulaires (épaule, coude, poignet), fluidité du mouvement
- Les exercices doivent améliorer le GESTE TECHNIQUE, pas la précision de la cible

⚠️ RÈGLES ABSOLUES:
1. Génère EXACTEMENT ${weeksCount} semaines (weekNumber: 1 à ${weeksCount})
2. Chaque semaine: 3 sessions (day: 1, 2, 4)
3. Chaque session: 2 exercices spécifiques fléchettes
4. Format JSON strict uniquement

⚠️ TYPES D'EXERCICES RÉALISTES POUR FLÉCHETTES:
- Répétition geste à vide (sans fléchette)
- Lancers au ralenti pour sentir le mouvement
- Travail de l'alignement coude-épaule
- Exercices de stabilité du poignet
- Lancers avec feedback vidéo/miroir
- Séries de lancers avec focus sur une articulation
- Routines de concentration et respiration
- Exercices d'équilibre et posture

🚫 NE JAMAIS PROPOSER:
- "Posture Drill" ou noms génériques
- Exercices sans rapport avec fléchettes (musculation, cardio, etc.)
- Exercices irréalisables (visualisation technique abstraite)

✅ EXEMPLES BONS EXERCICES:
- "Alignement coude-épaule au ralenti" → Faire le geste 30x au ralenti, focus alignement
- "Stabilité du poignet" → 50 lancers en gardant poignet fixe
- "Routine de préparation mentale" → 5min respiration + visualisation avant session
- "Répétition du mouvement à vide" → 100 répétitions sans fléchette, focus fluidité

Réponds UNIQUEMENT JSON (${weeksCount} semaines complètes):
{
  "duration": ${duration},
  "goal": "${goal}",
  "currentLevel": "Régularité moyenne X%, Score technique Y%",
  "targetLevel": "Régularité visée A%, Score technique B%",
  "weeks": [
    {
      "weekNumber": 1,
      "focus": "Focus clair (ex: Alignement et stabilité)",
      "sessions": [
        {
          "day": 1,
          "duration": 30,
          "exercises": [
            {
              "name": "Nom exercice spécifique fléchettes",
              "description": "Description concrète et actionnable",
              "sets": 3,
              "reps": 20,
              "restSeconds": 60,
              "focusArea": "Technique | Posture | Mental | Précision"
            }
          ],
          "notes": "Conseil concret pour la session"
        }
      ]
    }
  ]
}`;

    // maxTokens pour plans d'entraînement (limite modèle : 4096)
    const response = await this.chat(
      [
        { role: "system", content: AI_SYSTEM_PROMPTS.trainer },
        { role: "user", content: prompt },
      ],
      {
        maxTokens: 3500, // Sécurité : en dessous de la limite 4096
      }
    );

    try {
      const jsonContent = this.extractJSON(response.content);
      const data = JSON.parse(jsonContent);

      if (!data.weeks || !Array.isArray(data.weeks)) {
        throw new Error("Format de plan invalide");
      }

      return {
        ...data,
        id: crypto.randomUUID(),
        generatedAt: new Date(),
        modelUsed: this.modelConfig.model,
      };
    } catch (error) {
      console.error("Erreur parsing plan d'entraînement:", error);
      console.error("Contenu reçu:", response.content);
      throw new Error(
        "Impossible de parser le plan d'entraînement. Essayez de simplifier votre objectif."
      );
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
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
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
      throw new Error(
        `OpenAI API error: ${error.error?.message || "Unknown error"}`
      );
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
   * Extraire JSON d'une réponse qui peut contenir du texte autour
   * Tente de réparer le JSON tronqué si possible
   */
  private extractJSON(content: string): string {
    // Cas 1: JSON dans un code block markdown
    const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }

    // Cas 2: JSON direct
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const rawJson = jsonMatch[0].trim();

      // Tenter de réparer le JSON tronqué
      const repairedJson = this.repairTruncatedJSON(rawJson);

      return repairedJson;
    }

    // Cas 3: Retourner tel quel
    return content.trim();
  }

  /**
   * Réparer un JSON tronqué (ajouter les fermetures manquantes)
   */
  private repairTruncatedJSON(json: string): string {
    try {
      // Tester si le JSON est déjà valide
      JSON.parse(json);
      return json;
    } catch (error) {
      console.log("🔧 Tentative réparation JSON tronqué...");

      // Supprimer la dernière propriété incomplète (souvent la cause du problème)
      // Chercher le dernier ":" ou "," pour trouver le début de la propriété incomplète
      const lastColon = json.lastIndexOf(":");
      const lastComma = json.lastIndexOf(",");
      const lastBrace = json.lastIndexOf("{");
      const lastBracket = json.lastIndexOf("[");

      // Si on a un ":" après la dernière virgule, on a probablement une propriété incomplète
      if (
        lastColon > lastComma &&
        lastColon > json.lastIndexOf("}") &&
        lastColon > json.lastIndexOf("]")
      ) {
        // Trouver le début de cette propriété (le dernier "," ou "{" avant le ":")
        const cutPoint = Math.max(lastComma, lastBrace, lastBracket);
        json = json.substring(0, cutPoint);

        // Si on a coupé après une virgule, la supprimer aussi
        if (json.endsWith(",")) {
          json = json.substring(0, json.length - 1);
        }

        console.log("🔧 Propriété incomplète supprimée");
      }

      // Compter les accolades et crochets ouverts/fermés
      const openBraces = (json.match(/\{/g) || []).length;
      const closeBraces = (json.match(/\}/g) || []).length;
      const openBrackets = (json.match(/\[/g) || []).length;
      const closeBrackets = (json.match(/\]/g) || []).length;

      // Fermer les strings ouvertes
      const quotes = (json.match(/"/g) || []).length;
      if (quotes % 2 !== 0) {
        json += '"';
        console.log("🔧 Quote fermé");
      }

      // Fermer les crochets manquants
      for (let i = 0; i < openBrackets - closeBrackets; i++) {
        json += "]";
        console.log("🔧 ] ajouté");
      }

      // Fermer les accolades manquantes
      for (let i = 0; i < openBraces - closeBraces; i++) {
        json += "}";
        console.log("🔧 } ajouté");
      }

      // Vérifier si maintenant le JSON est valide
      try {
        JSON.parse(json);
        console.log("✅ JSON réparé avec succès !");
        return json;
      } catch (e) {
        console.error("❌ Impossible de réparer le JSON");
        throw new Error("JSON irréparable");
      }
    }
  }

  /**
   * Analyser les données de sessions
   */
  private analyzeSessionsData(sessions: TrainingSession[]): string {
    if (sessions.length === 0) {
      return "Aucune session disponible pour l'analyse.";
    }

    const totalThrows = sessions.reduce(
      (sum, s) => sum + (s.stats?.totalThrows || 0),
      0
    );
    const avgConsistency =
      sessions.reduce((sum, s) => sum + (s.stats?.averageConsistency || 0), 0) /
      sessions.length;
    const avgTechnical =
      sessions.reduce(
        (sum, s) => sum + (s.stats?.averageTechnicalScore || 0),
        0
      ) / sessions.length;

    // Calculer les tendances
    const scores = sessions.map((s) => s.stats?.averageConsistency || 0);
    const trend =
      scores.length > 1
        ? (((scores[scores.length - 1] - scores[0]) / scores[0]) * 100).toFixed(
            1
          )
        : "0";

    return `Sessions analysées : ${sessions.length}
Lancers totaux : ${totalThrows}
Régularité moyenne : ${avgConsistency.toFixed(1)}%
Score technique moyen : ${avgTechnical.toFixed(1)}%
Tendance : ${trend}% ${parseFloat(trend) > 0 ? "📈" : "📉"}

Dernière session : ${new Date(
      sessions[sessions.length - 1].createdAt
    ).toLocaleDateString()}
Temps de pratique total : ${sessions.reduce(
      (sum, s) => sum + (s.duration || 0),
      0
    )} min`;
  }

  /**
   * Mettre à jour les statistiques d'utilisation
   */
  private updateUsageStats(tokensUsed: number, model: AIModel): void {
    const cost = (tokensUsed / 1000) * AI_MODELS[model].costPer1KTokens;

    this.usageStats.totalRequests++;
    this.usageStats.totalTokensUsed += tokensUsed;
    this.usageStats.totalCostUSD += cost;
    this.usageStats.requestsByModel[model] =
      (this.usageStats.requestsByModel[model] || 0) + 1;
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
    localStorage.setItem("ai_model_config", JSON.stringify(this.modelConfig));
  }

  /**
   * Charger les stats depuis localStorage
   */
  private loadUsageStats(): AIUsageStats {
    const saved = localStorage.getItem("ai_usage_stats");
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
    localStorage.setItem("ai_usage_stats", JSON.stringify(this.usageStats));
  }
}

/**
 * Hook React pour utiliser le service IA
 */
export function useAIService(apiKey: string, modelConfig: AIModelConfig) {
  return new AIService(apiKey, modelConfig);
}
