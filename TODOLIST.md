# TODO List - TrakerDart

## ✅ Terminé (MVP v0.1)

### Infrastructure
- [x] Configuration Vite + React + TypeScript
- [x] Configuration TailwindCSS + shadcn/ui
- [x] Configuration PWA (vite-plugin-pwa)
- [x] Store Zustand avec persistance
- [x] IndexedDB pour stockage local
- [x] Types TypeScript complets

### Détection de pose
- [x] Intégration TensorFlow.js + MoveNet
- [x] Module de détection de pose
- [x] Dessin du squelette sur canvas
- [x] Hook personnalisé `usePoseDetection`

### Analyse biomécanique
- [x] Calcul des angles articulaires
- [x] Détection des phases du mouvement
- [x] Analyse du coude
- [x] Analyse du poignet
- [x] Analyse de l'épaule
- [x] Analyse du tronc
- [x] Analyse de la ligne de visée
- [x] Score technique global

### Comparaison et feedback
- [x] Comparaison des 3 lancers d'une volée
- [x] Calcul de l'indice de régularité
- [x] Détection des dérives progressives
- [x] Générateur de feedback pédagogique
- [x] Priorisation des recommandations

### Interface utilisateur
- [x] Composants UI de base (Button, Card, Progress, Badge)
- [x] Page d'accueil avec statistiques
- [x] Composant CameraCapture
- [x] Hook useCamera
- [x] Composant FeedbackCard
- [x] Composant ScoreDisplay
- [x] Design mobile-first

### Documentation
- [x] README.md
- [x] QUICKSTART.md
- [x] ARCHITECTURE.md
- [x] Commentaires détaillés dans tout le code

---

## 🚧 À faire (Prochaines étapes)

### Page de capture complète
- [ ] Créer `CapturePage.tsx`
- [ ] Interface d'enregistrement des 3 lancers
- [ ] Compteur de lancers
- [ ] Timer/chronomètre
- [ ] Boutons démarrer/stop/reset
- [ ] Stockage des Poses[] pendant l'enregistrement
- [ ] Progression visuelle (1/3, 2/3, 3/3)

### Page d'analyse détaillée
- [ ] Créer `AnalysisPage.tsx`
- [ ] Affichage des scores (régularité + technique)
- [ ] Grille des indicateurs biomécaniques
- [ ] Liste des feedbacks priorisés
- [ ] Points forts et axes d'amélioration
- [ ] Graphiques de comparaison des 3 lancers
- [ ] Replay vidéo (si enregistré)

### Enregistrement vidéo
- [ ] Intégrer MediaRecorder API
- [ ] Enregistrement synchronisé avec la détection
- [ ] Compression vidéo
- [ ] Stockage dans IndexedDB
- [ ] Lecteur vidéo avec contrôles
- [ ] Overlay du squelette sur la vidéo

### Calibration
- [ ] Page de calibration initiale
- [ ] Détection du côté dominant (gauche/droite)
- [ ] Vérification du cadrage
- [ ] Recommandations de positionnement
- [ ] Sauvegarde de la calibration

### Historique
- [ ] Page `HistoryPage.tsx`
- [ ] Liste des sessions passées
- [ ] Filtres (date, score, etc.)
- [ ] Détail d'une session
- [ ] Suppression de sessions
- [ ] Export de données

### Graphiques de progression
- [ ] Intégrer une bibliothèque de graphiques (recharts ou chart.js)
- [ ] Graphique d'évolution de la régularité
- [ ] Graphique d'évolution du score technique
- [ ] Graphique par indicateur (coude, poignet, etc.)
- [ ] Comparaison de sessions

### Visualisations avancées
- [ ] Tracé de la trajectoire du bras
- [ ] Heatmap des positions
- [ ] Comparaison visuelle côte-à-côte des 3 lancers
- [ ] Animation du mouvement
- [ ] Superposition de plusieurs lancers

### Navigation
- [ ] Intégrer React Router proprement
- [ ] Menu de navigation
- [ ] Breadcrumbs
- [ ] Transitions entre pages

### Améliorations UX
- [ ] Animations de transition
- [ ] Feedback sonore optionnel
- [ ] Vibrations (mobile)
- [ ] Mode tutoriel pour débutants
- [ ] Tooltips d'aide
- [ ] Messages de succès/erreur améliorés

### Performances
- [ ] Optimisation du rendu canvas
- [ ] Throttling intelligent de la détection
- [ ] Lazy loading des composants lourds
- [ ] Optimisation du stockage (compression)
- [ ] Nettoyage automatique des anciennes vidéos

### Paramètres
- [ ] Page de paramètres complète
- [ ] Choix de la caméra (si plusieurs)
- [ ] Résolution et FPS
- [ ] Niveau de détail des analyses
- [ ] Gestion du stockage
- [ ] Export/Import de données
- [ ] Reset complet

### Tests
- [ ] Tests unitaires (Vitest)
  - [ ] Tests des calculs biomécaniques
  - [ ] Tests des utilitaires
  - [ ] Tests du store
- [ ] Tests de composants (React Testing Library)
- [ ] Tests E2E (Playwright)
- [ ] Tests de performance

### Accessibilité
- [ ] Audit WCAG 2.1
- [ ] Navigation au clavier complète
- [ ] Annonces ARIA pour screen readers
- [ ] Contraste des couleurs validé
- [ ] Support mode high-contrast

### Internationalisation
- [ ] Extraction des strings
- [ ] Traduction en anglais
- [ ] Sélection de langue
- [ ] Formatage dates/nombres selon locale

---

## 🎯 Backlog (Futures versions)

### Mode coach
- [ ] Comparaison joueur vs joueur
- [ ] Analyse de groupe
- [ ] Tableau de bord coach

### Mode compétition
- [ ] Scoring automatique (si détection cible)
- [ ] Calcul du score de match
- [ ] Historique des parties

### IA avancée
- [ ] Prédiction de trajectoire
- [ ] Recommandations personnalisées basées sur l'historique
- [ ] Détection automatique de la fatigue
- [ ] Coach virtuel avec suggestions contextuelles

### Partage social
- [ ] Export en image des résultats
- [ ] Partage sur réseaux sociaux
- [ ] Comparaison avec la communauté (anonyme)

### Intégrations
- [ ] Connexion avec tableaux de score électroniques
- [ ] Export vers Excel/CSV
- [ ] API publique (pour développeurs tiers)

### Multi-sports
- [ ] Adaptation pour autres sports de lancer
  - [ ] Pétanque
  - [ ] Bowling
  - [ ] Lancer de poids
  - [ ] Baseball (pitching)

---

## 🐛 Bugs connus

Aucun bug connu pour le moment.

---

## 💡 Idées en vrac

- Mode sombre/clair (actuellement dark uniquement)
- Gamification (badges, achievements)
- Défis quotidiens/hebdomadaires
- Entraînement guidé (séances structurées)
- Comparaison avec des pros (overlay de référence)
- Détection automatique du moment du lancer
- Support de plusieurs joueurs dans une session
- Mode miroir pour la caméra frontale
- Ralenti automatique sur les phases clés
- Annotation manuelle sur les vidéos
- Notes vocales sur les sessions
