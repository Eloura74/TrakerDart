import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrainingSession } from "@/types";
import { ExportService } from "@/services/ExportService";
import { Loader2, FileText, FileJson, Download } from "lucide-react";

interface ExportDialogProps {
  session: TrainingSession;
  open: boolean;
  onClose: () => void;
}

export function ExportDialog({ session, open, onClose }: ExportDialogProps) {
  const [format, setFormat] = useState<"pdf" | "json">("pdf");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let blob: Blob;
      let filename: string;

      if (format === "pdf") {
        blob = await ExportService.generatePDF(session);
        filename = `trakerdart-session-${session.id.slice(0, 8)}.pdf`;
      } else {
        const jsonStr = JSON.stringify(session, null, 2);
        blob = new Blob([jsonStr], { type: "application/json" });
        filename = `trakerdart-session-${session.id.slice(0, 8)}.json`;
      }

      // Télécharger le fichier
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error("Erreur export:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Exporter la session</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="format">Format d'export</Label>
            <Select
              value={format}
              onValueChange={(v) => setFormat(v as "pdf" | "json")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Rapport PDF</span>
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    <span>Données JSON</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
