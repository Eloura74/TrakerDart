import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeatmapDataPoint {
  date: Date;
  value: number; // 0-100
  count: number;
  details?: string;
}

interface HeatmapWidgetProps {
  data: HeatmapDataPoint[];
  days?: number;
}

export function HeatmapWidget({ data, days = 60 }: HeatmapWidgetProps) {
  // Générer les N derniers jours
  const today = new Date();
  const calendarDays = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    return d;
  });

  const getColor = (value: number, count: number) => {
    if (count === 0) return "bg-white/5";
    if (value < 50) return "bg-cyan-900/40";
    if (value < 70) return "bg-cyan-700/60";
    if (value < 85) return "bg-cyan-500/80";
    return "bg-cyan-400";
  };

  const getDataForDate = (date: Date) => {
    return data.find(
      (d) =>
        d.date.getDate() === date.getDate() &&
        d.date.getMonth() === date.getMonth() &&
        d.date.getFullYear() === date.getFullYear(),
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 grid grid-cols-[repeat(auto-fit,minmax(12px,1fr))] gap-1 content-center">
        {calendarDays.map((date, i) => {
          const dayData = getDataForDate(date);
          const value = dayData?.value || 0;
          const count = dayData?.count || 0;

          return (
            <TooltipProvider key={i}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "aspect-square rounded-sm transition-all hover:ring-1 hover:ring-white/50 cursor-default",
                      getColor(value, count),
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    <p className="font-semibold">
                      {format(date, "d MMMM yyyy", { locale: fr })}
                    </p>
                    {count > 0 ? (
                      <>
                        <p>
                          {count} session{count > 1 ? "s" : ""}
                        </p>
                        <p>Score moyen: {value}%</p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">Aucune activité</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
        <span>Moins</span>
        <div className="flex gap-0.5">
          <div className="w-2 h-2 rounded-sm bg-white/5" />
          <div className="w-2 h-2 rounded-sm bg-cyan-900/40" />
          <div className="w-2 h-2 rounded-sm bg-cyan-700/60" />
          <div className="w-2 h-2 rounded-sm bg-cyan-500/80" />
          <div className="w-2 h-2 rounded-sm bg-cyan-400" />
        </div>
        <span>Plus</span>
      </div>
    </div>
  );
}
