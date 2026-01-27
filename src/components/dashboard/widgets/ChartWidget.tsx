import { useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Line, Bar, Radar } from "react-chartjs-2";
import zoomPlugin from "chartjs-plugin-zoom";

// Enregistrement des composants ChartJS
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
  Filler,
  zoomPlugin,
);

// Options par défaut du thème sombre
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultOptions: ChartOptions<any> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
      labels: {
        color: "#9ca3af",
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "#fff",
      bodyColor: "#fff",
      borderColor: "rgba(255, 255, 255, 0.1)",
      borderWidth: 1,
      padding: 10,
      displayColors: true,
      usePointStyle: true,
    },
    zoom: {
      zoom: {
        wheel: { enabled: true },
        pinch: { enabled: true },
        mode: "x",
      },
      pan: {
        enabled: true,
        mode: "x",
      },
    },
  },
  scales: {
    x: {
      grid: {
        color: "rgba(255, 255, 255, 0.05)",
        drawBorder: false,
      },
      ticks: {
        color: "#6b7280",
      },
    },
    y: {
      grid: {
        color: "rgba(255, 255, 255, 0.05)",
        drawBorder: false,
      },
      ticks: {
        color: "#6b7280",
      },
    },
    r: {
      // Pour les graphiques Radar
      grid: {
        color: "rgba(255, 255, 255, 0.1)",
      },
      angleLines: {
        color: "rgba(255, 255, 255, 0.1)",
      },
      pointLabels: {
        color: "#9ca3af",
      },
      ticks: {
        display: false,
        backdropColor: "transparent",
      },
    },
  },
  interaction: {
    mode: "index",
    intersect: false,
  },
};

interface ChartWidgetProps {
  type: "line" | "bar" | "radar";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: ChartData<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: ChartOptions<any>;
}

export function ChartWidget({ type, data, options = {} }: ChartWidgetProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options.plugins,
    },
    scales:
      type === "radar"
        ? { r: defaultOptions.scales?.r }
        : defaultOptions.scales,
  };

  const renderChart = () => {
    switch (type) {
      case "line":
        return <Line ref={chartRef} data={data} options={mergedOptions} />;
      case "bar":
        return <Bar ref={chartRef} data={data} options={mergedOptions} />;
      case "radar":
        return <Radar ref={chartRef} data={data} options={mergedOptions} />;
      default:
        return null;
    }
  };

  return <div className="w-full h-full min-h-[200px]">{renderChart()}</div>;
}
