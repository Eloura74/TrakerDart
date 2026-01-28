# 📊 Phase 3 : Rapports Détaillés - Implémentation

**Date** : 28 janvier 2026 - 20h10  
**Statut** : ✅ Structure créée, prêt pour intégration

---

## ✅ Fichiers Créés (3 fichiers)

### 1. Types
- `src/types/reports.ts` - Types complets pour rapports

### 2. Service
- `src/services/reportGenerator.ts` - Génération multi-formats

### 3. Composant UI
- `src/components/reports/ReportOptionsDialog.tsx` - Configuration rapports

---

## 🎯 Fonctionnalités Implémentées

### 3 Formats Supportés
- ✅ **PDF** - Portable, impression facile
- ✅ **HTML** - Interactif, responsive, dark mode
- ✅ **DOCX** - Éditable (placeholder pour l'instant)

### 3 Templates Disponibles

#### 📊 Standard
- **Public** : Joueurs débutants/intermédiaires
- **Sections** : Résumé, Graphiques, Recommandations
- **Style** : Clair, graphiques simples

#### 🎓 Coach
- **Public** : Entraîneurs et professionnels
- **Sections** : Résumé, Analyse détaillée, Graphiques, Biomécanique, Recommandations, Exercices
- **Style** : Technique, complet

#### 🔬 Scientifique
- **Public** : Chercheurs, académiques
- **Sections** : Abstract, Méthodologie, Résultats, Graphiques, Données brutes, Conclusions
- **Style** : Format recherche, données complètes

### Options de Personnalisation
- ✅ Titre personnalisé
- ✅ Introduction personnalisée
- ✅ Sélection sections à inclure
- ✅ Langue (FR/EN)
- ✅ Logo TrakerDart (branding)

### Sections Disponibles
- ✅ Résumé général avec métriques
- ✅ Graphiques & tendances
- ✅ Recommandations
- ✅ Analyse détaillée (Coach)
- ✅ Analyse biomécanique (Coach)
- ✅ Exercices recommandés (Coach)
- ✅ Méthodologie (Scientific)
- ✅ Données brutes JSON (Scientific)

---

## 🎨 Design

### PDF
- En-tête avec titre + métadonnées
- Sections organisées
- Footer avec numérotation pages
- Watermark TrakerDart

### HTML
- **Dark mode** par défaut
- **Glassmorphism** cards
- **Gradient** cyan/bleu
- Responsive mobile
- Imprimable (media print)
- Métriques en grid
- Sections élégantes

### DOCX
- Texte simple pour l'instant
- Structure basique
- À améliorer avec lib `docx`

---

## 📦 Dépendances Nécessaires

```bash
npm install jspdf jspdf-autotable
```

Pour DOCX complet (futur) :
```bash
npm install docx
```

---

## 🚀 Utilisation

### Dans une Page (ex: HistoryPage)

```typescript
import { useState } from 'react';
import { ReportOptionsDialog } from '@/components/reports/ReportOptionsDialog';

function HistoryPage() {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<TrainingSession[]>([]);

  return (
    <>
      <Button onClick={() => setShowReportDialog(true)}>
        Générer un Rapport
      </Button>

      <ReportOptionsDialog
        open={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        sessions={selectedSessions}
      />
    </>
  );
}
```

### Génération Programmatique

```typescript
import { generateReport, downloadReport } from '@/services/reportGenerator';

const sessions = [...]; // Vos sessions

const blob = await generateReport(sessions, {
  format: 'pdf',
  template: 'coach',
  includeGraphs: true,
  includeReplay: true,
  includeRecommendations: true,
  includeRawData: false,
  language: 'fr',
  branding: true,
  customTitle: 'Rapport Mensuel Janvier 2026',
});

downloadReport(blob, 'rapport-janvier-2026.pdf');
```

---

## 🔄 Rapports Programmés (Elite - À Implémenter)

### Table Supabase

```sql
CREATE TABLE report_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  frequency TEXT CHECK (frequency IN ('weekly', 'monthly', 'custom')),
  day_of_week INTEGER,
  day_of_month INTEGER,
  time TEXT,
  format TEXT,
  template TEXT,
  email TEXT,
  filters JSONB,
  active BOOLEAN DEFAULT true,
  next_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Edge Function (Supabase)

```typescript
// supabase/functions/generate-scheduled-reports/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  // 1. Récupérer les rapports à générer (next_run <= now)
  const schedules = await getSchedulesToRun();
  
  // 2. Pour chaque schedule
  for (const schedule of schedules) {
    // Récupérer les sessions
    const sessions = await getSessions(schedule.user_id, schedule.filters);
    
    // Générer le rapport
    const blob = await generateReport(sessions, schedule);
    
    // Envoyer par email
    await sendEmail(schedule.email, blob);
    
    // Mettre à jour next_run
    await updateNextRun(schedule.id);
  }
  
  return new Response('OK', { status: 200 });
});
```

### Composant UI (À Créer)

```typescript
<ReportScheduler
  frequency="weekly"
  dayOfWeek={1} // Lundi
  time="08:00"
  template="coach"
  email="user@example.com"
  filters={{
    minConsistency: 70,
    dateRange: { start: ..., end: ... }
  }}
/>
```

---

## 📊 Métriques Calculées

### Global
- Total sessions
- Total lancers
- Score moyen
- Régularité moyenne
- Période couverte

### Par Session
- Score technique
- Index de consistance
- Angles moyens (coude, poignet, épaule)
- Vitesse moyenne
- Erreurs détectées

### Tendances (Futur)
- Progression score
- Évolution régularité
- Amélioration biomécanique
- Temps d'entraînement

---

## 🎯 Prochaines Étapes

### Court Terme (Cette Semaine)
- [ ] Installer dépendances `jspdf`
- [ ] Intégrer ReportOptionsDialog dans HistoryPage
- [ ] Ajouter bouton "Rapport" dans les actions
- [ ] Tester génération PDF/HTML
- [ ] Améliorer sections avec vraies données

### Moyen Terme (Semaine Prochaine)
- [ ] Implémenter graphiques (Charts.js/Recharts)
- [ ] Ajouter images replay dans PDF
- [ ] DOCX complet avec lib `docx`
- [ ] Preview avant génération
- [ ] Export multi-sessions (comparaison)

### Long Terme (Q2)
- [ ] Rapports programmés (Elite)
- [ ] Envoi email automatique
- [ ] Templates personnalisables
- [ ] Marketplace de templates
- [ ] Analytics dans rapports

---

## 💡 Améliorations Possibles

### Templates
- [ ] Template "Compétition" (focus performance)
- [ ] Template "Réhabilitation" (focus corrections)
- [ ] Template "Kids" (simplifié, gamifié)

### Fonctionnalités
- [ ] Comparaison période vs période
- [ ] Benchmarking avec autres joueurs
- [ ] Prédictions futures (IA)
- [ ] Recommandations personnalisées avancées

### Export
- [ ] PowerPoint (PPTX)
- [ ] Markdown
- [ ] CSV (données brutes)
- [ ] JSON avancé avec méta

### Partage
- [ ] Upload cloud automatique
- [ ] Lien partage public
- [ ] Embed iframe
- [ ] QR code du rapport

---

## 🐛 Points d'Attention

### Performance
- Génération PDF peut être lente (>5s pour gros rapports)
- HTML est instantané
- Limiter nombre de sessions (<50)

### Graphiques
- Pour l'instant placeholders
- À implémenter avec Chart.js ou Recharts
- Conversion canvas → image pour PDF

### DOCX
- Implémentation basique actuelle
- Nécessite lib `docx` pour format complet
- Complexe à maintenir

---

## ✅ Tests à Effectuer

### Test 1: PDF Standard
- [ ] 1 session → PDF généré
- [ ] Toutes sections présentes
- [ ] Métriques correctes
- [ ] Footer avec pagination

### Test 2: HTML Coach
- [ ] 5 sessions → HTML généré
- [ ] Dark mode appliqué
- [ ] Responsive (mobile/desktop)
- [ ] Imprimable

### Test 3: Scientific avec Raw Data
- [ ] Template scientifique
- [ ] Données brutes JSON incluses
- [ ] Format académique

### Test 4: Personnalisation
- [ ] Titre personnalisé appliqué
- [ ] Introduction visible
- [ ] Sections désactivées absentes
- [ ] Branding on/off

---

## 📈 Impact Attendu

**Business** :
- Valeur ajoutée Pro/Elite
- Différenciation vs concurrence
- Partage facilité → viralité

**Utilisateur** :
- Suivi progression professionnel
- Partage avec coach
- Preuve progrès (motivation)

**Technique** :
- Réutilisation données existantes
- Pas de backend complexe
- Scalable (client-side)

---

**Temps d'implémentation** : ~3h (structure)  
**Temps d'intégration** : ~2-3h (UI + tests)  
**Temps complet Phase 3** : 1 semaine

**Status** : ✅ Prêt pour intégration 🚀
