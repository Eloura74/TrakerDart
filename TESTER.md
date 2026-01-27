# Checklist de test - TrakerDart

## ✅ À tester maintenant

### 1. Lancer l'application
```bash
npm run dev
```
Ouvrir http://localhost:3000

### 2. Page d'accueil
- [ ] Bouton "Démarrer une nouvelle session" visible
- [ ] Statistiques affichées (même si 0)
- [ ] Navigation historique fonctionne

### 3. Calibration (optionnel)
- [ ] Choix droitier/gaucher
- [ ] Bouton "Passer cette étape" fonctionne
- [ ] Redirection vers capture

### 4. Page de capture automatique
- [ ] Caméra s'active correctement
- [ ] Squelette s'affiche (lignes vertes)
- [ ] FPS affiché en haut à droite
- [ ] Bouton "Activer détection automatique" visible

### 5. Détection automatique
- [ ] Message "En attente..." affiché
- [ ] Faire un mouvement de bras
- [ ] Message change en "Mouvement détecté..."
- [ ] Message change en "Lancer en cours !"
- [ ] Retour à "En attente..." après stabilisation
- [ ] Lancer 1 enregistré et affiché
- [ ] Compteur passe à "Lancer 2/3"

### 6. Les 3 lancers
- [ ] Lancer 1 OK
- [ ] Lancer 2 OK  
- [ ] Lancer 3 OK
- [ ] Message "Volée terminée !"
- [ ] Redirection automatique vers analyse

### 7. Page d'analyse
**Onglet Résumé**
- [ ] Score de régularité affiché
- [ ] Score technique affiché
- [ ] Points forts listés
- [ ] Recommandations affichées

**Onglet Graphiques**
- [ ] Graphique angle coude visible
- [ ] Graphique angle poignet visible
- [ ] Phases colorées
- [ ] 3 lancers affichés

**Onglet Données**
- [ ] Tableau des valeurs
- [ ] Badges de qualité (vert/jaune/rouge)
- [ ] Confiance de détection affichée

### 8. Historique
- [ ] Session créée visible
- [ ] Statistiques de la session
- [ ] Clic sur session ouvre détail
- [ ] Liste des vollées
- [ ] Clic sur volée ouvre analyse

## 🐛 Problèmes connus à vérifier

### Critique
- [ ] Calibration ne bloque plus le navigateur
- [ ] Détection automatique fonctionne
- [ ] Analyse se génère sans erreur

### Mineur
- [ ] Navigation fluide
- [ ] Pas d'erreurs console
- [ ] Design responsive

## 📝 Notes de test

### Test 1 (Date: _______)
**Fonctionnel :**
- ...

**Problèmes :**
- ...

### Test 2 (Date: _______)
**Fonctionnel :**
- ...

**Problèmes :**
- ...
