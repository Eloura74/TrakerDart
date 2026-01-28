# ✅ Tests Phase 1 - Feature Gating
## Guide de Tests Rapide (30 minutes)

**Objectif** : Valider que le feature gating fonctionne parfaitement sur les 3 tiers

---

## 🧪 Test 1: Tier FREE (10 min)

### Setup
Éditer `.env` :
```env
VITE_DEV_MODE=true
VITE_DEV_DEFAULT_TIER=free
```

Redémarrer :
```bash
npm run dev
```

### Tests à Effectuer

#### ✅ Homepage
- [ ] UsageBanner visible en haut
- [ ] Affiche "Sessions: 0 / 10"
- [ ] Affiche "🔒 Exports PDF désactivés"
- [ ] Bouton "Passer à Pro" visible
- [ ] Cliquer bouton → Redirige vers `#/pricing`

#### ✅ Création Sessions (Limite 10)
- [ ] Créer 5 sessions successives → OK
- [ ] Créer 5 autres sessions → OK (total 10)
- [ ] UsageBanner montre "10 / 10"
- [ ] Couleur devient jaune/orange (>80%)
- [ ] Créer 11ème session → **PAYWALL s'affiche**
- [ ] Paywall affiche message "Limite atteinte"
- [ ] Bouton "Upgrade" redirige vers pricing

#### ✅ Export PDF (Bloqué)
- [ ] Aller dans Historique
- [ ] Ouvrir une session
- [ ] Cliquer "Exporter"
- [ ] Sélectionner "Rapport PDF" → Icône 🔒 visible
- [ ] Cliquer "Exporter" → **PAYWALL s'affiche**
- [ ] Message : "Réservé aux abonnés Pro et Elite"

#### ✅ Export JSON (Gratuit)
- [ ] Même session, exporter
- [ ] Sélectionner "Données JSON"
- [ ] Cliquer "Exporter" → **Fonctionne**
- [ ] Fichier `.json` téléchargé

---

## 🧪 Test 2: Tier PRO (10 min)

### Setup
Éditer `.env` :
```env
VITE_DEV_MODE=true
VITE_DEV_DEFAULT_TIER=pro
```

Redémarrer :
```bash
npm run dev
```

### Tests à Effectuer

#### ✅ Homepage
- [ ] UsageBanner visible
- [ ] Affiche "Usage ce mois (Pro)"
- [ ] Sessions: "0 / ∞"
- [ ] Exports PDF: "0 / 10"
- [ ] Bouton "Voir détails" → Redirige vers `#/subscription`

#### ✅ Sessions Illimitées
- [ ] Créer 15 sessions → **Aucun blocage**
- [ ] UsageBanner ne montre pas de limite sessions
- [ ] Pas de paywall

#### ✅ Export PDF (10/mois)
- [ ] Exporter 5 PDF → Fonctionne
- [ ] UsageBanner montre "5 / 10"
- [ ] Exporter 5 autres PDF → Fonctionne
- [ ] UsageBanner montre "10 / 10" (orange)
- [ ] Tenter 11ème PDF → **PAYWALL**
- [ ] Message suggère Elite pour illimité

#### ✅ Export JSON
- [ ] Toujours gratuit
- [ ] Pas de limite

---

## 🧪 Test 3: Tier ELITE (5 min)

### Setup
Éditer `.env` :
```env
VITE_DEV_MODE=true
VITE_DEV_DEFAULT_TIER=elite
```

Redémarrer :
```bash
npm run dev
```

### Tests à Effectuer

#### ✅ Homepage
- [ ] **UsageBanner CACHÉE** (tout illimité)
- [ ] Pas de limites affichées

#### ✅ Tout Illimité
- [ ] Créer 20+ sessions → Aucun blocage
- [ ] Exporter 15+ PDF → Aucun blocage
- [ ] Exporter JSON → Fonctionne
- [ ] **Aucun paywall n'apparaît jamais**

---

## 🎨 Test 4: Responsive Mobile (5 min)

### Chrome DevTools
- Ouvrir DevTools (F12)
- Mode responsive (Ctrl+Shift+M)

### Tests Devices

#### iPhone 12 Pro (390x844)
- [ ] UsageBanner lisible (texte pas coupé)
- [ ] Bouton "Passer à Pro" visible
- [ ] PaywallModal s'affiche bien (centrée)
- [ ] PricingCards empilées verticalement
- [ ] Navigation fonctionne

#### iPad Pro (1024x1366)
- [ ] Layout tablette adapté
- [ ] UsageBanner en 2 colonnes
- [ ] PaywallModal 3 colonnes OK

---

## 🐛 Checklist Bugs Potentiels

### Console
- [ ] Pas d'erreur 406 Supabase
- [ ] Pas de warning React
- [ ] Pas d'erreur TypeScript
- [ ] Log "🔧 Mode DEV : Tier forcé à X" visible

### UI
- [ ] Texte blanc partout (pas gris invisible)
- [ ] Animations fluides (pas de lag)
- [ ] PaywallModal ferme avec X
- [ ] Navigation hash (#/pricing) fonctionne
- [ ] Images de fond chargées

### Feature Gating
- [ ] Limites respectées exactement
- [ ] Compteurs s'incrémentent correctement
- [ ] Paywall ne s'affiche qu'au bon moment
- [ ] Elite ne voit JAMAIS de paywall

---

## 📸 Screenshots à Capturer

1. **UsageBanner Free** (10/10 sessions, alerte orange)
2. **PaywallModal Sessions** (limite atteinte)
3. **PaywallModal PDF** (feature premium)
4. **PricingPage** (3 cartes)
5. **UsageBanner Pro** (compteurs PDF)
6. **Export Dialog** (icône 🔒 sur PDF)

Sauvegarder dans : `docs/screenshots/`

---

## ✅ Validation Finale

Si tous les tests passent :
- [x] ✅ Feature gating 100% opérationnel
- [x] ✅ UX parfaite (pas de bugs)
- [x] ✅ Design cohérent (glassmorphism partout)
- [x] ✅ Responsive (mobile + desktop)
- [x] ✅ Messages clairs (français impeccable)

**→ Passer à Phase 2 (Export Vidéo) !**

---

## 🚀 Si Bugs Détectés

### Bug Console
- Vérifier `.env` bien chargé
- Redémarrer serveur après modif `.env`
- Vider cache navigateur (Ctrl+Shift+R)

### Bug UI
- Vérifier `src/index.css` (variables CSS dark mode)
- Vérifier imports composants
- Vérifier typos dans feature keys

### Bug Feature Gating
- Vérifier `VITE_DEV_MODE=true` dans `.env`
- Vérifier `getUserTier()` retourne bon tier
- Console doit logger "🔧 Mode DEV : Tier forcé à X"

---

**Durée estimée** : 30 minutes  
**Pré-requis** : Serveur dev lancé (`npm run dev`)  
**Prochaine étape** : Phase 2 - Export Vidéo

---

**Créé le** : 28 janvier 2026 - 13h42  
**Version** : 1.0
