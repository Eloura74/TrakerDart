import { useEffect, useRef, useState } from "react";
import { Responsive, Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { DashboardWidget, WidgetRenderer } from "./DashboardWidget";
import { StatWidget } from "./widgets/StatWidget";
import { ChartWidget } from "./widgets/ChartWidget";
import { HeatmapWidget } from "./widgets/HeatmapWidget";

// Implémentation personnalisée de WidthProvider car elle est manquante dans les exports
const WidthProvider = (WrappedComponent: any) => {
  return (props: any) => {
    const [width, setWidth] = useState(1200);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setWidth(entry.contentRect.width);
        }
      });

      resizeObserver.observe(element);

      // Largeur initiale
      setWidth(element.getBoundingClientRect().width);

      return () => resizeObserver.disconnect();
    }, []);

    return (
      <div ref={elementRef} className="w-full">
        <WrappedComponent {...props} width={width} />
      </div>
    );
  };
};

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardLayoutProps {
  widgets: DashboardWidget[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onLayoutChange: (layout: any) => void;
  onWidgetRemove: (id: string) => void;
  onWidgetEdit: (id: string) => void;
  onWidgetClick?: (id: string) => void;
  isEditable: boolean;
}

export function DashboardLayout({
  widgets,
  onLayoutChange,
  onWidgetRemove,
  onWidgetEdit,
  onWidgetClick,
  isEditable,
}: DashboardLayoutProps) {
  // BLOQUER drag sur mobile COMPLÈTEMENT
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  const renderWidgetContent = (widget: DashboardWidget) => {
    switch (widget.type) {
      case "stat":
        return (
          <StatWidget
            value={widget.data?.value}
            trend={widget.data?.trend}
            trendLabel={widget.data?.trendLabel}
            icon={widget.config?.icon}
            color={widget.config?.color}
          />
        );
      case "chart":
        return (
          <ChartWidget
            type={widget.config?.chartType || "line"}
            data={widget.data}
            options={widget.config?.options}
          />
        );
      case "calendar":
        return (
          <HeatmapWidget data={widget.data || []} days={widget.config?.days} />
        );
      default:
        return <div>Widget type not supported: {widget.type}</div>;
    }
  };

  // SUR MOBILE : Grille CSS simple (SANS react-grid-layout)
  if (isMobile) {
    return (
      <div className="w-full space-y-4" style={{ touchAction: 'pan-y' }}>
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className="w-full"
            onClick={() => onWidgetClick?.(widget.id)}
          >
            <WidgetRenderer
              widget={widget}
              editMode={false}
              onRemove={onWidgetRemove}
              onEdit={onWidgetEdit}
              onClick={onWidgetClick}
            >
              {renderWidgetContent(widget)}
            </WidgetRenderer>
          </div>
        ))}
      </div>
    );
  }

  // DESKTOP : react-grid-layout normal
  const layout = widgets.map((w) => ({
    i: w.id,
    x: w.position.x,
    y: w.position.y,
    w: w.position.w,
    h: w.position.h,
  }));

  return (
    <div className="w-full">
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout, md: layout, sm: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        onLayoutChange={(layout: Layout[]) => onLayoutChange(layout)}
        isDraggable={!isMobile && isEditable}
        isResizable={!isMobile && isEditable}
        static={isMobile}
        margin={[16, 16]}
        containerPadding={[0, 0]}
      >
        {widgets.map((widget) => (
          <div key={widget.id}>
            <WidgetRenderer
              widget={widget}
              editMode={isEditable}
              onRemove={onWidgetRemove}
              onEdit={onWidgetEdit}
              onClick={onWidgetClick}
            >
              {renderWidgetContent(widget)}
            </WidgetRenderer>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
