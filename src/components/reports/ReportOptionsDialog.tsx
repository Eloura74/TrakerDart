/**
 * Dialog de configuration des options de rapport
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Globe, FileCode, Loader2, Download, Sparkles } from 'lucide-react';
import type { ReportOptions, ReportFormat, ReportTemplate } from '@/types/reports';
import { REPORT_TEMPLATES } from '@/types/reports';
import type { TrainingSession } from '@/types';
import { generateReport, downloadReport } from '@/services/reportGenerator';

interface ReportOptionsDialogProps {
  open: boolean;
  onClose: () => void;
  sessions: TrainingSession[];
}

export function ReportOptionsDialog({ open, onClose, sessions }: ReportOptionsDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState<ReportOptions>({
    format: 'pdf',
    template: 'standard',
    includeGraphs: true,
    includeReplay: true,
    includeRecommendations: true,
    includeRawData: false,
    language: 'fr',
    branding: true,
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateReport(sessions, options);
      
      // Déterminer extension
      const ext = options.format === 'pdf' ? 'pdf' : options.format === 'html' ? 'html' : 'docx';
      const filename = `rapport-trakerdart-${new Date().toISOString().split('T')[0]}.${ext}`;
      
      downloadReport(blob, filename);
      onClose();
    } catch (error) {
      console.error('Erreur génération rapport:', error);
      alert('Erreur lors de la génération du rapport');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedTemplate = REPORT_TEMPLATES[options.template];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            Générer un Rapport Détaillé
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Format */}
          <div className="space-y-2">
            <Label>Format d'Export</Label>
            <Select
              value={options.format}
              onValueChange={(v) => setOptions({ ...options, format: v as ReportFormat })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>PDF (Portable)</span>
                  </div>
                </SelectItem>
                <SelectItem value="html">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>HTML (Interactif)</span>
                  </div>
                </SelectItem>
                <SelectItem value="docx">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4" />
                    <span>DOCX (Éditable)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Template */}
          <div className="space-y-2">
            <Label>Template de Rapport</Label>
            <Select
              value={options.template}
              onValueChange={(v) => setOptions({ ...options, template: v as ReportTemplate })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">
                  <div>
                    <div className="font-medium">📊 Standard</div>
                    <div className="text-xs text-gray-400">Grand public, graphiques clairs</div>
                  </div>
                </SelectItem>
                <SelectItem value="coach">
                  <div>
                    <div className="font-medium">🎓 Coach</div>
                    <div className="text-xs text-gray-400">Analyse détaillée pour pros</div>
                  </div>
                </SelectItem>
                <SelectItem value="scientific">
                  <div>
                    <div className="font-medium">🔬 Scientifique</div>
                    <div className="text-xs text-gray-400">Format académique</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Info template */}
            <Card className="border-cyan-500/20 bg-cyan-500/5">
              <CardContent className="pt-4 space-y-2">
                <p className="text-sm text-white">
                  <strong>{selectedTemplate.name}</strong>
                </p>
                <p className="text-xs text-gray-400">{selectedTemplate.description}</p>
                <p className="text-xs text-gray-500">
                  Public cible: {selectedTemplate.audience}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Options personnalisation */}
          <div className="space-y-3">
            <Label>Personnalisation</Label>
            
            <div>
              <Label className="text-xs text-gray-400">Titre personnalisé (optionnel)</Label>
              <Input
                placeholder="Mon Rapport d'Analyse"
                value={options.customTitle || ''}
                onChange={(e) => setOptions({ ...options, customTitle: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-400">Introduction personnalisée (optionnel)</Label>
              <Textarea
                placeholder="Contexte du rapport..."
                value={options.customIntro || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOptions({ ...options, customIntro: e.target.value })}
                className="mt-1 min-h-[60px]"
              />
            </div>
          </div>

          {/* Sections à inclure */}
          <div className="space-y-3">
            <Label>Sections à Inclure</Label>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Graphiques & Tendances</Label>
                <p className="text-xs text-gray-400">Graphiques de progression</p>
              </div>
              <Switch
                checked={options.includeGraphs}
                onCheckedChange={(checked) => setOptions({ ...options, includeGraphs: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Images du Replay</Label>
                <p className="text-xs text-gray-400">Captures de mouvements</p>
              </div>
              <Switch
                checked={options.includeReplay}
                onCheckedChange={(checked) => setOptions({ ...options, includeReplay: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Recommandations</Label>
                <p className="text-xs text-gray-400">Conseils d'amélioration</p>
              </div>
              <Switch
                checked={options.includeRecommendations}
                onCheckedChange={(checked) => setOptions({ ...options, includeRecommendations: checked })}
              />
            </div>

            {options.template === 'scientific' && (
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Données Brutes</Label>
                  <p className="text-xs text-gray-400">JSON complet</p>
                </div>
                <Switch
                  checked={options.includeRawData}
                  onCheckedChange={(checked) => setOptions({ ...options, includeRawData: checked })}
                />
              </div>
            )}
          </div>

          {/* Options avancées */}
          <div className="space-y-3">
            <Label>Options Avancées</Label>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Logo TrakerDart</Label>
                <p className="text-xs text-gray-400">Branding en footer</p>
              </div>
              <Switch
                checked={options.branding}
                onCheckedChange={(checked) => setOptions({ ...options, branding: checked })}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-400">Langue</Label>
              <Select
                value={options.language}
                onValueChange={(v) => setOptions({ ...options, language: v as 'fr' | 'en' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Info sessions */}
          <Card className="border-gray-700 bg-black/20">
            <CardContent className="pt-4">
              <p className="text-sm text-gray-400">
                Ce rapport inclura <strong className="text-white">{sessions.length}</strong> session(s)
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Annuler
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Générer le Rapport
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
