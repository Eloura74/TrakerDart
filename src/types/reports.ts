/**
 * Types pour les rapports détaillés
 */

export type ReportFormat = 'pdf' | 'html' | 'docx';
export type ReportTemplate = 'standard' | 'coach' | 'scientific';
export type ReportFrequency = 'weekly' | 'monthly' | 'custom';

export interface ReportOptions {
  format: ReportFormat;
  template: ReportTemplate;
  includeGraphs: boolean;
  includeReplay: boolean;
  includeRecommendations: boolean;
  includeRawData: boolean;
  language: 'fr' | 'en';
  branding: boolean;
  customTitle?: string;
  customIntro?: string;
}

export interface ReportSchedule {
  id: string;
  userId: string;
  frequency: ReportFrequency;
  dayOfWeek?: number; // 0-6 pour hebdomadaire
  dayOfMonth?: number; // 1-31 pour mensuel
  time: string; // HH:MM
  format: ReportFormat;
  template: ReportTemplate;
  email: string;
  filters?: ReportFilters;
  active: boolean;
  nextRun: Date;
  createdAt: Date;
}

export interface ReportFilters {
  minConsistency?: number;
  minScore?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
  throwTypes?: string[];
}

export interface ReportSection {
  id: string;
  title: string;
  content: string | HTMLElement;
  order: number;
  visible: boolean;
}

export interface ReportData {
  title: string;
  subtitle?: string;
  date: Date;
  author?: string;
  sections: ReportSection[];
  metadata: {
    totalSessions: number;
    totalThrows: number;
    averageScore: number;
    averageConsistency: number;
    period: {
      start: Date;
      end: Date;
    };
  };
}

/**
 * Configuration des templates
 */
export const REPORT_TEMPLATES: Record<ReportTemplate, {
  name: string;
  description: string;
  audience: string;
  sections: string[];
}> = {
  standard: {
    name: 'Rapport Standard',
    description: 'Rapport grand public avec graphiques clairs',
    audience: 'Joueurs débutants et intermédiaires',
    sections: ['summary', 'graphs', 'recommendations']
  },
  coach: {
    name: 'Rapport Coach',
    description: 'Analyse détaillée pour professionnels',
    audience: 'Entraîneurs et coachs',
    sections: ['summary', 'detailed_analysis', 'graphs', 'biomechanics', 'recommendations', 'exercises']
  },
  scientific: {
    name: 'Rapport Scientifique',
    description: 'Format académique avec métriques avancées',
    audience: 'Chercheurs et scientifiques',
    sections: ['abstract', 'methodology', 'results', 'graphs', 'raw_data', 'conclusions']
  }
};
