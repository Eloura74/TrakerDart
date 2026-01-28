import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, LayoutGrid, Save, X } from "lucide-react";
import { DashboardWidget, WidgetType } from "./DashboardWidget";

interface DashboardEditorProps {
  onAddWidget: (widget: Omit<DashboardWidget, "id">) => void;
  onSaveLayout: () => void;
  isEditable: boolean;
  onToggleEdit: () => void;
}

export function DashboardEditor({
  onAddWidget,
  onSaveLayout,
  isEditable,
  onToggleEdit,
}: DashboardEditorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWidget, setNewWidget] = useState<{
    title: string;
    type: WidgetType;
    w: number;
    h: number;
  }>({
    title: "",
    type: "stat",
    w: 2,
    h: 1,
  });

  const handleAdd = () => {
    onAddWidget({
      title: newWidget.title,
      type: newWidget.type,
      position: { x: 0, y: 0, w: newWidget.w, h: newWidget.h },
      config: {},
      data: {},
    });
    setIsDialogOpen(false);
    setNewWidget({ title: "", type: "stat", w: 2, h: 1 });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isEditable ? "destructive" : "outline"}
        onClick={onToggleEdit}
        className="gap-2"
        size="sm"
      >
        {isEditable ? (
          <>
            <X className="h-4 w-4" /> Terminer
          </>
        ) : (
          <>
            <LayoutGrid className="h-4 w-4" /> Personnaliser
          </>
        )}
      </Button>

      {isEditable && (
        <>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Ajouter Widget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau widget</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    value={newWidget.title}
                    onChange={(e) =>
                      setNewWidget({ ...newWidget, title: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newWidget.type}
                    onValueChange={(v) =>
                      setNewWidget({ ...newWidget, type: v as WidgetType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stat">Statistique</SelectItem>
                      <SelectItem value="chart">Graphique</SelectItem>
                      <SelectItem value="calendar">Calendrier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="width">Largeur (colonnes)</Label>
                    <Input
                      id="width"
                      type="number"
                      min="1"
                      max="12"
                      value={newWidget.w}
                      onChange={(e) =>
                        setNewWidget({
                          ...newWidget,
                          w: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="height">Hauteur (lignes)</Label>
                    <Input
                      id="height"
                      type="number"
                      min="1"
                      max="12"
                      value={newWidget.h}
                      onChange={(e) =>
                        setNewWidget({
                          ...newWidget,
                          h: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <Button onClick={handleAdd}>Ajouter</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="secondary" onClick={onSaveLayout} className="gap-2">
            <Save className="h-4 w-4" /> Sauvegarder
          </Button>
        </>
      )}
    </div>
  );
}
