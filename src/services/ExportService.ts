import { jsPDF } from "jspdf";
import { TrainingSession } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export class ExportService {
  static async generatePDF(session: TrainingSession): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // En-tête
    doc.setFontSize(24);
    doc.setTextColor(34, 211, 238); // Cyan
    doc.text("TrakerDart", 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Rapport d'analyse de session", 20, 30);

    // Info Session
    doc.setFontSize(10);
    doc.setTextColor(0);
    const dateStr = format(
      new Date(session.createdAt),
      "d MMMM yyyy 'à' HH:mm",
      {
        locale: fr,
      },
    );
    doc.text(`Date: ${dateStr}`, 20, 45);
    doc.text(`Durée: ${Math.round(session.duration / 60000)} min`, 20, 50);

    // Stats Principales
    doc.setFillColor(245, 245, 245);
    doc.rect(20, 60, pageWidth - 40, 40, "F");

    doc.setFontSize(14);
    doc.text("Statistiques Clés", 30, 70);

    doc.setFontSize(10);
    doc.text(
      `Régularité Moyenne: ${session.stats.averageConsistency.toFixed(0)}%`,
      30,
      80,
    );
    doc.text(
      `Score Technique: ${session.stats.averageTechnicalScore.toFixed(1)}/10`,
      30,
      85,
    );
    doc.text(`Total Lancers: ${session.stats.totalThrows}`, 100, 80);
    doc.text(`Meilleure Série: ${session.stats.bestStreak || 0}`, 100, 85);

    // Détail par volée
    let y = 110;
    doc.setFontSize(14);
    doc.text("Détail par Volée", 20, y);
    y += 10;

    // En-têtes tableau
    doc.setFontSize(10);
    doc.setFillColor(34, 211, 238);
    doc.setTextColor(255);
    doc.rect(20, y, pageWidth - 40, 8, "F");
    doc.text("Volée", 25, y + 5);
    doc.text("Régularité", 60, y + 5);
    doc.text("Score Tech", 100, y + 5);
    doc.text("Lancers", 140, y + 5);
    y += 10;

    // Lignes tableau
    doc.setTextColor(0);
    session.volleys.forEach((volley, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.text(`#${index + 1}`, 25, y);
      doc.text(`${volley.comparison.consistencyIndex.toFixed(0)}%`, 60, y);
      doc.text(
        `${volley.throws[0]?.analysis.technicalScore.toFixed(1) || "-"}`,
        100,
        y,
      );
      doc.text(`${volley.throws.length}`, 140, y);

      y += 8;
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Généré par TrakerDart - Page ${i}/${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" },
      );
    }

    return doc.output("blob");
  }
}
