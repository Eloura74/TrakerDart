import { TrainingSession } from "@/types";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
);

interface ComparisonChartsProps {
  session1: TrainingSession;
  session2: TrainingSession;
}

export function ComparisonCharts({
  session1,
  session2,
}: ComparisonChartsProps) {
  const session1Label = format(new Date(session1.createdAt), "d MMM HH:mm", {
    locale: fr,
  });
  const session2Label = format(new Date(session2.createdAt), "d MMM HH:mm", {
    locale: fr,
  });

  // Préparer les données pour le graphique de régularité (comparaison volée par volée)
  // On prend le nombre maximum de volées
  const maxVolleys = Math.max(session1.volleys.length, session2.volleys.length);
  const labels = Array.from({ length: maxVolleys }, (_, i) => `Volée ${i + 1}`);

  const consistencyData = {
    labels,
    datasets: [
      {
        label: `${session1Label} (Régularité)`,
        data: session1.volleys.map((v) => v.comparison.consistencyIndex),
        borderColor: "rgba(34, 211, 238, 1)", // cyan-400
        backgroundColor: "rgba(34, 211, 238, 0.5)",
        tension: 0.3,
      },
      {
        label: `${session2Label} (Régularité)`,
        data: session2.volleys.map((v) => v.comparison.consistencyIndex),
        borderColor: "rgba(248, 113, 113, 1)", // red-400
        backgroundColor: "rgba(248, 113, 113, 0.5)",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
      title: {
        display: true,
        text: "Évolution de la Régularité par Volée",
        color: "white",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.5)",
        },
      },
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.5)",
        },
      },
    },
  };

  // Comparaison globale (Bar Chart)
  const globalComparisonData = {
    labels: ["Régularité Moyenne", "Score Technique Moyen", "Meilleure Volée"],
    datasets: [
      {
        label: session1Label,
        data: [
          session1.stats.averageConsistency,
          session1.stats.averageTechnicalScore * 10, // Mettre à l'échelle 0-100
          session1.stats.bestVolley?.consistencyIndex || 0,
        ],
        backgroundColor: "rgba(34, 211, 238, 0.7)",
      },
      {
        label: session2Label,
        data: [
          session2.stats.averageConsistency,
          session2.stats.averageTechnicalScore * 10,
          session2.stats.bestVolley?.consistencyIndex || 0,
        ],
        backgroundColor: "rgba(248, 113, 113, 0.7)",
      },
    ],
  };

  const globalOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
      title: {
        display: true,
        text: "Comparaison Globale",
        color: "white",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.5)",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.5)",
        },
      },
    },
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-md border border-white/10 bg-card/40 p-4 backdrop-blur-md">
        <Line data={consistencyData} options={options} />
      </div>
      <div className="rounded-md border border-white/10 bg-card/40 p-4 backdrop-blur-md">
        <Bar data={globalComparisonData} options={globalOptions} />
      </div>
    </div>
  );
}
