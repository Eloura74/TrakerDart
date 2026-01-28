/**
 * Service de génération de rapports
 * Génère des rapports dans différents formats (PDF, HTML, DOCX)
 */

import { jsPDF } from 'jspdf';
// import 'jspdf-autotable'; // TODO: Installer package si nécessaire pour tables PDF
import type { TrainingSession } from '@/types';
import type { ReportOptions, ReportData, ReportSection, ReportTemplate } from '@/types/reports';

/**
 * Générer un rapport complet
 * @param sessions - Sessions à inclure dans le rapport
 * @param options - Options de génération
 * @returns Blob du rapport
 */
export async function generateReport(
  sessions: TrainingSession[],
  options: ReportOptions
): Promise<Blob> {
  // Préparer les données du rapport
  const reportData = prepareReportData(sessions, options);

  // Générer selon le format
  switch (options.format) {
    case 'pdf':
      return await generatePDFReport(reportData);
    case 'html':
      return await generateHTMLReport(reportData, options);
    case 'docx':
      return await generateDOCXReport(reportData);
    default:
      throw new Error(`Format non supporté: ${options.format}`);
  }
}

/**
 * Préparer les données pour le rapport
 */
function prepareReportData(
  sessions: TrainingSession[],
  options: ReportOptions
): ReportData {
  // Calculer métriques globales
  const totalThrows = sessions.reduce(
    (sum, s) => sum + (s.volleys?.reduce((vSum, v) => vSum + v.throws.length, 0) || 0),
    0
  );

  const averageScore = sessions.reduce(
    (sum, s) => sum + (s.volleys?.[0]?.comparison?.consistencyIndex || 0),
    0
  ) / sessions.length;

  const averageConsistency = sessions.reduce(
    (sum, s) => sum + (s.volleys?.[0]?.comparison?.consistencyIndex || 0),
    0
  ) / sessions.length;

  // Dates
  const dates = sessions.map(s => new Date(s.createdAt));
  const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const endDate = new Date(Math.max(...dates.map(d => d.getTime())));

  // Créer sections selon template
  const sections = createSectionsForTemplate(sessions, options.template);

  return {
    title: options.customTitle || 'Rapport d\'Analyse TrakerDart',
    subtitle: `Période: ${startDate.toLocaleDateString('fr-FR')} - ${endDate.toLocaleDateString('fr-FR')}`,
    date: new Date(),
    sections,
    metadata: {
      totalSessions: sessions.length,
      totalThrows,
      averageScore,
      averageConsistency,
      period: {
        start: startDate,
        end: endDate
      }
    }
  };
}

/**
 * Créer les sections selon le template
 */
function createSectionsForTemplate(
  sessions: TrainingSession[],
  template: ReportTemplate
): ReportSection[] {
  const sections: ReportSection[] = [];

  switch (template) {
    case 'standard':
      sections.push(
        createSummarySection(sessions),
        createGraphsSection(),
        createRecommendationsSection()
      );
      break;

    case 'coach':
      sections.push(
        createSummarySection(sessions),
        createDetailedAnalysisSection(),
        createGraphsSection(),
        createBiomechanicsSection(),
        createRecommendationsSection(),
        createExercisesSection()
      );
      break;

    case 'scientific':
      sections.push(
        createAbstractSection(),
        createMethodologySection(),
        createResultsSection(),
        createGraphsSection(),
        createRawDataSection(sessions),
        createConclusionsSection()
      );
      break;
  }

  return sections;
}

/**
 * Sections individuelles
 */
function createSummarySection(sessions: TrainingSession[]): ReportSection {
  const avgScore = sessions.reduce(
    (sum, s) => sum + (s.volleys?.[0]?.comparison?.consistencyIndex || 0),
    0
  ) / sessions.length;

  return {
    id: 'summary',
    title: 'Résumé Général',
    content: `
      <h2>Vue d'ensemble</h2>
      <p><strong>${sessions.length}</strong> sessions analysées</p>
      <p>Score moyen: <strong>${avgScore.toFixed(1)}/100</strong></p>
    `,
    order: 1,
    visible: true
  };
}

function createGraphsSection(): ReportSection {
  return {
    id: 'graphs',
    title: 'Graphiques & Tendances',
    content: '<div id="graphs-container"></div>',
    order: 2,
    visible: true
  };
}

function createRecommendationsSection(): ReportSection {
  return {
    id: 'recommendations',
    title: 'Recommandations',
    content: '<ul><li>Recommandation 1</li><li>Recommandation 2</li></ul>',
    order: 3,
    visible: true
  };
}

function createDetailedAnalysisSection(): ReportSection {
  return {
    id: 'detailed_analysis',
    title: 'Analyse Détaillée',
    content: '<p>Analyse biomécanique approfondie...</p>',
    order: 2,
    visible: true
  };
}

function createBiomechanicsSection(): ReportSection {
  return {
    id: 'biomechanics',
    title: 'Analyse Biomécanique',
    content: '<p>Angles, forces, trajectoires...</p>',
    order: 4,
    visible: true
  };
}

function createExercisesSection(): ReportSection {
  return {
    id: 'exercises',
    title: 'Exercices Recommandés',
    content: '<ul><li>Exercice 1</li><li>Exercice 2</li></ul>',
    order: 6,
    visible: true
  };
}

function createAbstractSection(): ReportSection {
  return {
    id: 'abstract',
    title: 'Résumé',
    content: '<p>Cette étude analyse...</p>',
    order: 1,
    visible: true
  };
}

function createMethodologySection(): ReportSection {
  return {
    id: 'methodology',
    title: 'Méthodologie',
    content: '<p>Protocole expérimental...</p>',
    order: 2,
    visible: true
  };
}

function createResultsSection(): ReportSection {
  return {
    id: 'results',
    title: 'Résultats',
    content: '<p>Les résultats montrent...</p>',
    order: 3,
    visible: true
  };
}

function createRawDataSection(sessions: TrainingSession[]): ReportSection {
  return {
    id: 'raw_data',
    title: 'Données Brutes',
    content: '<pre>' + JSON.stringify(sessions, null, 2) + '</pre>',
    order: 5,
    visible: true
  };
}

function createConclusionsSection(): ReportSection {
  return {
    id: 'conclusions',
    title: 'Conclusions',
    content: '<p>En conclusion...</p>',
    order: 6,
    visible: true
  };
}

/**
 * Générer rapport PDF
 */
async function generatePDFReport(
  data: ReportData
): Promise<Blob> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  let yPosition = 20;

  // En-tête
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.title, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  if (data.subtitle) {
    pdf.text(data.subtitle, pageWidth / 2, yPosition, { align: 'center' });
  }
  
  yPosition += 15;

  // Métadonnées
  pdf.setFontSize(10);
  pdf.text(`Sessions: ${data.metadata.totalSessions}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Lancers: ${data.metadata.totalThrows}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Score moyen: ${data.metadata.averageScore.toFixed(1)}/100`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Régularité: ${data.metadata.averageConsistency.toFixed(1)}%`, 20, yPosition);
  
  yPosition += 15;

  // Sections
  for (const section of data.sections.filter(s => s.visible)) {
    // Vérifier si nouvelle page nécessaire
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(section.title, 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Convertir HTML en texte simple pour PDF
    const textContent = section.content.toString().replace(/<[^>]*>/g, ' ').trim();
    const lines = pdf.splitTextToSize(textContent, pageWidth - 40);
    
    for (const line of lines) {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(line, 20, yPosition);
      yPosition += 5;
    }
    
    yPosition += 10;
  }

  // Footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(
      `TrakerDart - Page ${i}/${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return pdf.output('blob');
}

/**
 * Générer rapport HTML
 */
async function generateHTMLReport(
  data: ReportData,
  options: ReportOptions
): Promise<Blob> {
  const html = `
<!DOCTYPE html>
<html lang="${options.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
      color: #ffffff;
      padding: 40px 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: rgba(20, 20, 30, 0.8);
      border-radius: 20px;
      padding: 40px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 242, 255, 0.2);
    }
    h1 {
      font-size: 2.5rem;
      background: linear-gradient(90deg, #00f2ff, #0066ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #aaa;
      margin-bottom: 30px;
    }
    .metadata {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .metric {
      background: rgba(0, 242, 255, 0.1);
      padding: 20px;
      border-radius: 10px;
      border: 1px solid rgba(0, 242, 255, 0.3);
    }
    .metric-label {
      color: #aaa;
      font-size: 0.9rem;
      margin-bottom: 5px;
    }
    .metric-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #00f2ff;
    }
    .section {
      margin-bottom: 40px;
      padding: 30px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 15px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .section h2 {
      color: #00f2ff;
      margin-bottom: 20px;
      font-size: 1.8rem;
    }
    .section-content {
      line-height: 1.8;
      color: #ddd;
    }
    ul {
      list-style: none;
      padding-left: 0;
    }
    li {
      padding: 10px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    li:before {
      content: "→";
      color: #00f2ff;
      margin-right: 10px;
    }
    @media print {
      body { background: white; color: black; }
      .container { border: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${data.title}</h1>
    ${data.subtitle ? `<p class="subtitle">${data.subtitle}</p>` : ''}
    
    <div class="metadata">
      <div class="metric">
        <div class="metric-label">Sessions Analysées</div>
        <div class="metric-value">${data.metadata.totalSessions}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Total Lancers</div>
        <div class="metric-value">${data.metadata.totalThrows}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Score Moyen</div>
        <div class="metric-value">${data.metadata.averageScore.toFixed(1)}/100</div>
      </div>
      <div class="metric">
        <div class="metric-label">Régularité</div>
        <div class="metric-value">${data.metadata.averageConsistency.toFixed(1)}%</div>
      </div>
    </div>

    ${data.sections
      .filter(s => s.visible)
      .map(section => `
        <div class="section">
          <h2>${section.title}</h2>
          <div class="section-content">${section.content}</div>
        </div>
      `).join('')}

    <footer style="text-align: center; margin-top: 60px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.1); color: #666;">
      <p>Généré par TrakerDart le ${new Date().toLocaleDateString('fr-FR')}</p>
      ${options.branding ? '<p style="margin-top: 10px;"><strong>TrakerDart</strong> - Analyse Biomécanique Intelligente</p>' : ''}
    </footer>
  </div>
</body>
</html>
  `;

  return new Blob([html], { type: 'text/html;charset=utf-8' });
}

/**
 * Générer rapport DOCX
 */
async function generateDOCXReport(
  data: ReportData
): Promise<Blob> {
  // Pour l'instant, on retourne un placeholder
  // L'implémentation complète nécessite la librairie 'docx'
  const placeholder = `
Rapport TrakerDart
==================

${data.title}
${data.subtitle || ''}

Sessions: ${data.metadata.totalSessions}
Lancers: ${data.metadata.totalThrows}
Score moyen: ${data.metadata.averageScore.toFixed(1)}/100

${data.sections.map(s => `
${s.title}
${'-'.repeat(s.title.length)}
${s.content.toString().replace(/<[^>]*>/g, '')}
`).join('\n')}

Généré par TrakerDart
  `;

  return new Blob([placeholder], { 
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
  });
}

/**
 * Télécharger le rapport
 */
export function downloadReport(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
