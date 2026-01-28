import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, X } from "lucide-react";

export type WidgetType = "stat" | "chart" | "calendar" | "radar" | "list";

export interface WidgetConfig {
  color?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  backgroundImage?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: WidgetConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

interface WidgetRendererProps {
  widget: DashboardWidget;
  editMode: boolean;
  onRemove?: (id: string) => void;
  onEdit?: (id: string) => void;
  onClick?: (id: string) => void;
  children?: React.ReactNode;
}

export function WidgetRenderer({
  widget,
  editMode,
  onRemove,
  onEdit,
  onClick,
  children,
}: WidgetRendererProps) {
  const hasBackground = !!widget.config.backgroundImage;

  return (
    <Card
      onClick={() => !editMode && onClick?.(widget.id)}
      className={`
        h-full w-full overflow-hidden flex flex-col 
        bg-card/40 backdrop-blur-md border-white/10 
        transition-all duration-300
        ${
          !editMode && onClick
            ? "cursor-pointer hover:scale-[1.02] hover:border-white/30 hover:shadow-lg hover:shadow-cyan-500/10"
            : ""
        }
        ${hasBackground ? "relative" : ""}
      `}
    >
      {hasBackground && (
        <>
          <div
            className="absolute inset-0 z-0 bg-cover bg-center opacity-110 transition-transform duration-500 group-hover:scale-110"
            style={{ backgroundImage: `url(${widget.config.backgroundImage})` }}
          />
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        </>
      )}

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 z-10 relative">
        <CardTitle className="text-sm font-medium text-gray-200 truncate drop-shadow-md">
          {widget.title}
        </CardTitle>
        {editMode && (
          <div className="flex items-center gap-1 bg-black/50 rounded-md p-1 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(widget.id);
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.(widget.id);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-4 pt-0 min-h-0 overflow-auto z-10 relative">
        {children}
      </CardContent>
    </Card>
  );
}
