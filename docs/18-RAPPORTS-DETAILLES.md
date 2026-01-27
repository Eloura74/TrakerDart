# 📋 Rapports Détaillés

## 🎯 Objectif

Générer des rapports d'analyse complets et professionnels pour suivre progression et partager avec coachs.

## 🎨 Fonctionnalités

### 1. Rapport de Session

```typescript
interface SessionReport {
  summary: SessionSummary;
  biomechanics: BiomechanicsSection;
  progress: ProgressSection;
  recommendations: RecommendationSection;
  charts: ChartSection[];
  metadata: ReportMetadata;
}

async function generateSessionReport(session: TrainingSession): Promise<SessionReport> {
  return {
    summary: {
      date: new Date(session.createdAt),
      duration: session.duration,
      volleys: session.volleys.length,
      totalThrows: session.stats.totalThrows,
      avgConsistency: session.stats.averageConsistency,
      avgTechnique: session.stats.averageTechnicalScore,
      rating: calculateSessionRating(session)
    },
    biomechanics: await analyzeBiomechanics(session),
    progress: await analyzeProgress(session),
    recommendations: await generateRecommendations(session),
    charts: await generateCharts(session),
    metadata: {
      version: '1.0',
      generatedAt: Date.now(),
      generator: 'TrakerDart AI'
    }
  };
}
```

### 2. Rapport Comparatif

```typescript
interface ComparisonReport {
  period: DateRange;
  sessions: TrainingSession[];
  evolution: EvolutionMetrics;
  bestSession: TrainingSession;
  worstSession: TrainingSession;
  insights: Insight[];
}

function generateComparisonReport(
  startDate: Date,
  endDate: Date
): ComparisonReport {
  const sessions = getSessionsInRange(startDate, endDate);
  
  return {
    period: { start: startDate, end: endDate },
    sessions,
    evolution: {
      consistencyChange: calculateChange(sessions, 'consistency'),
      techniqueChange: calculateChange(sessions, 'technique'),
      trend: determineTrend(sessions)
    },
    bestSession: sessions.reduce((best, s) => 
      s.stats.averageConsistency > best.stats.averageConsistency ? s : best
    ),
    worstSession: sessions.reduce((worst, s) => 
      s.stats.averageConsistency < worst.stats.averageConsistency ? s : worst
    ),
    insights: generateInsights(sessions)
  };
}
```

### 3. Rapport Biomécanique Détaillé

```typescript
interface BiomechanicsReport {
  joints: JointAnalysis[];
  movement: MovementAnalysis;
  symmetry: SymmetryAnalysis;
  efficiency: EfficiencyMetrics;
  visualization: BiomechanicsVisualization;
}

class BiomechanicsReporter {
  generateReport(volley: Volley): BiomechanicsReport {
    return {
      joints: this.analyzeAllJoints(volley),
      movement: this.analyzeMovementPattern(volley),
      symmetry: this.analyzeSymmetry(volley),
      efficiency: this.calculateEfficiency(volley),
      visualization: this.generateVisualization(volley)
    };
  }
  
  private analyzeAllJoints(volley: Volley): JointAnalysis[] {
    const joints = ['elbow', 'wrist', 'shoulder', 'hip', 'knee'];
    
    return joints.map(joint => ({
      name: joint,
      angleRange: this.calculateAngleRange(volley, joint),
      velocity: this.calculateJointVelocity(volley, joint),
      acceleration: this.calculateJointAcceleration(volley, joint),
      consistency: this.calculateJointConsistency(volley, joint),
      recommendations: this.getJointRecommendations(joint, volley)
    }));
  }
}
```

### 4. Export Multi-formats

```typescript
interface ExportOptions {
  format: 'pdf' | 'html' | 'docx' | 'json';
  template: 'standard' | 'detailed' | 'coach' | 'scientific';
  language: 'fr' | 'en';
  includeImages: boolean;
  includeRawData: boolean;
}

class ReportExporter {
  async export(
    report: SessionReport,
    options: ExportOptions
  ): Promise<Blob> {
    switch (options.format) {
      case 'pdf':
        return this.exportPDF(report, options);
      case 'html':
        return this.exportHTML(report, options);
      case 'docx':
        return this.exportDOCX(report, options);
      case 'json':
        return this.exportJSON(report);
    }
  }
  
  private async exportPDF(
    report: SessionReport,
    options: ExportOptions
  ): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Sélectionner template
    const template = this.getTemplate(options.template);
    
    // Page de garde
    await template.renderCover(pdf, report);
    
    // Résumé exécutif
    pdf.addPage();
    await template.renderSummary(pdf, report.summary);
    
    // Analyse biomécanique
    pdf.addPage();
    await template.renderBiomechanics(pdf, report.biomechanics);
    
    // Graphiques
    if (options.includeImages) {
      for (const chart of report.charts) {
        pdf.addPage();
        await template.renderChart(pdf, chart);
      }
    }
    
    // Recommandations
    pdf.addPage();
    await template.renderRecommendations(pdf, report.recommendations);
    
    return pdf.output('blob');
  }
}
```

### 5. Templates Professionnels

```typescript
interface ReportTemplate {
  name: string;
  style: TemplateStyle;
  sections: TemplateSection[];
}

const TEMPLATES: Record<string, ReportTemplate> = {
  standard: {
    name: 'Standard',
    style: {
      colors: { primary: '#00f2ff', secondary: '#ff0055' },
      fonts: { body: 'Inter', headings: 'Montserrat' },
      spacing: 'normal'
    },
    sections: [
      'cover', 'summary', 'biomechanics', 'charts', 'recommendations'
    ]
  },
  
  coach: {
    name: 'Coach Professional',
    style: {
      colors: { primary: '#2563eb', secondary: '#dc2626' },
      fonts: { body: 'Roboto', headings: 'Roboto Condensed' },
      spacing: 'compact'
    },
    sections: [
      'cover', 'executive-summary', 'detailed-analysis',
      'progress-tracking', 'training-plan', 'notes'
    ]
  },
  
  scientific: {
    name: 'Scientific',
    style: {
      colors: { primary: '#000000', secondary: '#666666' },
      fonts: { body: 'Times New Roman', headings: 'Arial' },
      spacing: 'academic'
    },
    sections: [
      'abstract', 'introduction', 'methodology', 'results',
      'discussion', 'conclusion', 'references', 'appendix'
    ]
  }
};
```

### 6. Rapports Automatiques Programmés

```typescript
interface ScheduledReport {
  id: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  format: ExportOptions;
  filters: ReportFilters;
  nextRun: Date;
}

class ReportScheduler {
  private scheduler: NodeCron.ScheduledTask;
  
  scheduleReport(config: ScheduledReport) {
    const cronPattern = this.getCronPattern(config.frequency);
    
    this.scheduler = cron.schedule(cronPattern, async () => {
      const report = await this.generateScheduledReport(config);
      await this.sendReport(report, config.recipients);
    });
  }
  
  private getCronPattern(frequency: string): string {
    switch (frequency) {
      case 'daily': return '0 8 * * *';    // 8h chaque jour
      case 'weekly': return '0 8 * * 1';   // 8h chaque lundi
      case 'monthly': return '0 8 1 * *';  // 8h le 1er du mois
    }
  }
  
  private async sendReport(blob: Blob, recipients: string[]) {
    // Email avec Resend/SendGrid
    await sendEmail({
      to: recipients,
      subject: `Rapport TrakerDart - ${new Date().toLocaleDateString()}`,
      attachments: [{ filename: 'rapport.pdf', content: blob }]
    });
  }
}
```

### 7. Insights Automatiques

```typescript
interface ReportInsight {
  type: 'improvement' | 'decline' | 'plateau' | 'breakthrough';
  title: string;
  description: string;
  data: number[];
  significance: 'low' | 'medium' | 'high';
}

function generateInsights(sessions: TrainingSession[]): ReportInsight[] {
  const insights: ReportInsight[] = [];
  
  // Détecter amélioration significative
  const improvement = calculateImprovement(sessions);
  if (improvement > 10) {
    insights.push({
      type: 'improvement',
      title: 'Amélioration Notable',
      description: `Votre régularité a augmenté de ${improvement.toFixed(1)}% ce mois`,
      data: sessions.map(s => s.stats.averageConsistency),
      significance: 'high'
    });
  }
  
  // Détecter plateau
  if (isPlateauDetected(sessions)) {
    insights.push({
      type: 'plateau',
      title: 'Plateau de Progression',
      description: 'Performances stables depuis 2 semaines. Variez votre entraînement.',
      data: sessions.map(s => s.stats.averageConsistency),
      significance: 'medium'
    });
  }
  
  return insights;
}
```

## 📦 Dépendances

```json
{
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.8.0",
  "docx": "^8.5.0",
  "node-cron": "^3.0.3",
  "resend": "^3.0.0"
}
```

## ✅ Checklist

- [ ] Rapport session complet
- [ ] Rapport comparatif multi-sessions
- [ ] Rapport biomécanique détaillé
- [ ] Export PDF/HTML/DOCX/JSON
- [ ] 3+ templates professionnels
- [ ] Rapports programmés automatiques
- [ ] Insights automatiques IA
- [ ] Email delivery
- [ ] Personnalisation templates

---

**Difficulté** : ⭐⭐ Moyenne  
**Durée** : 2-3 semaines  
**Impact** : 💰💰 Moyen
