# 🧪 Tests Immédiats - Phase 1, 2, 3

**Date** : 28 janvier 2026 - 20h25  
**Durée estimée** : 30 minutes

---

## 🎯 Objectif

Valider rapidement les 3 phases implémentées aujourd'hui sans tout casser.

---

## ✅ Checklist Rapide

### 1. Compilation (2 min)

```bash
# Vérifier qu'il n'y a pas d'erreurs TypeScript
npm run build
```

**Attendu** : Compilation réussie, pas d'erreurs critiques

---

### 2. Feature Gating - UsageBanner (5 min)

**Étapes** :
1. Lancer l'app : `npm run dev`
2. Ouvrir `http://localhost:5173`
3. Se connecter (ou mode dev)
4. Aller sur la HomePage

**Vérifications** :
- [ ] UsageBanner visible en haut ?
- [ ] Affiche "10 sessions restantes" (ou équivalent) ?
- [ ] Bouton "Voir les limites" cliquable ?
- [ ] Design cohérent (cyan, glassmorphism) ?

**Si tier Elite** :
- [ ] UsageBanner masqué ? ✅

---

### 3. Feature Gating - Création Session (5 min)

**Étapes** :
1. Aller sur CapturePageAuto
2. Cliquer "Démarrer l'entraînement"

**Si Free (>10 sessions)** :
- [ ] PaywallModal s'affiche ?
- [ ] Message clair "Limite atteinte" ?
- [ ] Bouton "Passer à Pro" visible ?

**Si Pro/Elite** :
- [ ] Session démarre normalement ?

---

### 4. Feature Gating - Export PDF (5 min)

**Étapes** :
1. Ouvrir une session existante
2. Cliquer "Exporter"
3. Sélectionner "Rapport PDF"
4. Cliquer "Exporter"

**Si Free** :
- [ ] PaywallModal s'affiche ?
- [ ] Message "Réservé aux abonnés Pro/Elite" ?

**Si Pro/Elite** :
- [ ] PDF se télécharge ?
- [ ] Fichier valide et lisible ?

---

### 5. Export Vidéo - UI (5 min)

**Étapes** :
1. Ouvrir ExportDialog
2. Sélectionner format "Vidéo Annotée"

**Vérifications** :
- [ ] Option "Vidéo Annotée" visible dans le select ?
- [ ] Icône 🔒 présente ?
- [ ] VideoExportOptions s'affiche en dessous ?
- [ ] Sélecteur résolution (720p/1080p/4K) ?
- [ ] Switches overlays (skeleton, angles, scores) ?
- [ ] Options FPS, slow motion, watermark ?

**Ne PAS exporter pour l'instant** (peut être long)

---

### 6. Rapports - UI (5 min)

**Test manuel en console navigateur** :

```javascript
// Ouvrir Console F12
import { generateReport, downloadReport } from './src/services/reportGenerator';

// Créer données test
const testSession = {
  id: 'test-123',
  createdAt: new Date().toISOString(),
  volleys: [{
    throws: [{ poses: [] }],
    comparison: {
      overallScore: 75,
      consistencyIndex: 80
    }
  }]
};

// Test génération HTML
const htmlBlob = await generateReport([testSession], {
  format: 'html',
  template: 'standard',
  includeGraphs: true,
  includeReplay: false,
  includeRecommendations: true,
  includeRawData: false,
  language: 'fr',
  branding: true
});

downloadReport(htmlBlob, 'test-rapport.html');
```

**Vérifications** :
- [ ] Fichier HTML téléchargé ?
- [ ] Ouvrir dans navigateur → Dark mode ?
- [ ] Métriques affichées ?
- [ ] Design glassmorphism ?

---

### 7. Pas d'Erreurs Console (2 min)

**Étapes** :
1. Ouvrir Console F12
2. Naviguer dans l'app (Home, Capture, History, Pricing)

**Vérifications** :
- [ ] Pas d'erreurs rouges critiques ?
- [ ] Warnings minimes acceptables ?
- [ ] Pas de "undefined" ou "null" inattendus ?

---

### 8. Design Uniforme (3 min)

**Parcourir rapidement** :
- [ ] HomePage - Design cohérent ?
- [ ] CapturePageAuto - Boutons blancs ?
- [ ] HistoryPage - Cards glassmorphism ?
- [ ] PricingPage - Gradient cyan ?
- [ ] Tous textes blancs lisibles ?

---

## 🐛 Si Problèmes

### Erreur TypeScript
```bash
# Nettoyer cache
rm -rf node_modules/.vite
npm run dev
```

### Import manquant
```bash
# Réinstaller dépendances
npm install
```

### UsageBanner ne s'affiche pas
- Vérifier mode dev dans `.env`
- Vérifier tier utilisateur
- Console → Erreurs ?

### PaywallModal ne s'affiche pas
- Vérifier limites dans `FEATURE_LIMITS`
- Vérifier appel `checkAndTrackFeature()`
- Console → Logs ?

---

## ✅ Validation Finale

**Si tout fonctionne** :
- ✅ Feature gating opérationnel
- ✅ UsageBanner s'affiche
- ✅ PaywallModal bloque correctement
- ✅ Export PDF fonctionne (Pro/Elite)
- ✅ UI export vidéo présente
- ✅ Rapports générables
- ✅ Design uniforme
- ✅ Pas d'erreurs critiques

**Alors** : 🎉 **TOUT EST PRÊT POUR PRODUCTION** !

---

## 📊 Tests Approfondis (Optionnel - 1h)

### Export Vidéo Complet
1. Avoir une session avec volée
2. Exporter en 720p
3. Attendre génération (peut prendre 30s-1min)
4. Vérifier MP4 téléchargé et jouable

### Rapports PDF Complet
1. Générer rapport PDF template "Coach"
2. Vérifier toutes sections présentes
3. Vérifier métriques correctes

### Feature Gating Exhaustif
1. Tester Free → limite sessions
2. Tester Pro → limite PDF (10/mois)
3. Tester Elite → tout illimité

---

## 🚀 Prochaine Étape Après Tests

**Si tests OK** :
- Commit + Push
- Screenshots pour démo
- Phase 4 : Coaching Temps Réel

**Si tests KO** :
- Identifier bug
- Corriger
- Re-tester

---

**Temps total estimé** : 30 minutes  
**Criticité** : Validation rapide avant commit

**GO ! 🧪**
