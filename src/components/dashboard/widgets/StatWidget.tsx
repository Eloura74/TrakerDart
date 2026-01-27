import React from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatWidgetProps {
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  color?: string;
}

export function StatWidget({
  value,
  trend,
  trendLabel,
  icon,
  color = "cyan",
}: StatWidgetProps) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  const colorClasses: Record<string, string> = {
    cyan: "text-cyan-400",
    green: "text-green-400",
    orange: "text-orange-400",
    purple: "text-purple-400",
    red: "text-red-400",
  };

  const selectedColor = colorClasses[color] || colorClasses.cyan;

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "p-2 rounded-lg backdrop-blur-md bg-white/10 shadow-inner border border-white/5",
            selectedColor,
          )}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm",
              isPositive
                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                : isNegative
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : "bg-gray-500/20 text-gray-300 border border-gray-500/30",
            )}
          >
            {isPositive ? (
              <ArrowUp className="h-3 w-3 mr-1" />
            ) : isNegative ? (
              <ArrowDown className="h-3 w-3 mr-1" />
            ) : (
              <Minus className="h-3 w-3 mr-1" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-4xl font-black text-white tracking-tight drop-shadow-lg">
          {value}
        </div>
        {trendLabel && (
          <p className="text-sm font-medium text-gray-300 mt-1 drop-shadow-md">
            {trendLabel}
          </p>
        )}
      </div>
    </div>
  );
}
