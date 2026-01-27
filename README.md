# TrakerDart

**Application d'analyse biomécanique du lancer de fléchettes par webcam**

## 🎯 Vue d'ensemble

TrakerDart est une Progressive Web App (PWA) mobile-first qui utilise l'intelligence artificielle pour analyser et améliorer la technique de lancer de fléchettes. L'application capture les mouvements via une simple webcam et fournit un feedback biomécanique précis et pédagogique.

## 🚀 Fonctionnalités principales

- **Capture vidéo** via webcam (smartphone, tablette, PC)
- **Détection de pose** en temps réel (TensorFlow.js + MoveNet)
- **Analyse biomécanique** complète :
  - Angles articulaires (coude, poignet, épaule)
  - Stabilité du tronc et ligne de visée
  - Découpage en phases du mouvement
- **Comparaison intra-volée** des 3 lancers
- **Feedback pédagogique** visuel et textuel
- **Historique** et suivi de progression
- **Mode offline** (PWA)

## 🛠️ Stack technique

- **Frontend** : React 18 + TypeScript
- **UI** : TailwindCSS + shadcn/ui + Lucide Icons
- **IA** : TensorFlow.js + MoveNet (détection de pose)
- **Build** : Vite
- **State** : Zustand
- **Stockage** : IndexedDB + LocalStorage
- **PWA** : vite-plugin-pwa

## 📦 Installation

```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement
npm run dev

# Build de production
npm run build

# Prévisualisation du build
npm run preview
```

## 🏗️ Structure du projet

```
src/
├── components/       # Composants React réutilisables
│   ├── ui/          # Composants UI (shadcn/ui)
│   ├── camera/      # Gestion caméra et capture vidéo
│   ├── analysis/    # Composants d'analyse et visualisation
│   └── layout/      # Composants de mise en page
├── lib/             # Bibliothèques et utilitaires
│   ├── pose/        # Détection de pose (TensorFlow.js)
│   ├── biomechanics/# Calculs biomécaniques
│   ├── storage/     # Gestion du stockage (IndexedDB)
│   └── utils/       # Fonctions utilitaires
├── hooks/           # React hooks personnalisés
├── store/           # State management (Zustand)
├── types/           # Types TypeScript
├── pages/           # Pages de l'application
└── main.tsx         # Point d'entrée
```

## 🎨 Design

- **Mobile-first** : optimisé pour smartphone et tablette
- **Thème sombre** : réduit la fatigue visuelle
- **Minimaliste** : focus sur l'analyse, pas sur le décor
- **Accessible** : contrastes élevés, zones tactiles larges (44x44px minimum)

## 📱 PWA

L'application peut être installée sur mobile comme une app native :
- Mode offline complet
- Icônes d'application
- Splash screen
- Orientation portrait verrouillée

## 🔐 Confidentialité

- Toutes les données restent locales (IndexedDB)
- Aucun serveur distant obligatoire
- Respect du RGPD
- Suppression complète possible

## 📊 Analyse biomécanique

### Points détectés
- Tête
- Épaule dominante
- Coude
- Poignet
- Main
- Tronc (axe vertical)

### Indicateurs calculés
- **Coude** : angle, stabilité, déplacement latéral
- **Poignet** : angle de cassure, timing de relâchement
- **Épaule** : rotation, stabilité verticale
- **Tronc** : inclinaison, balancement
- **Ligne de visée** : stabilité, orientation

### Phases du lancer
1. Préparation
2. Armement
3. Accélération
4. Relâchement
5. Follow-through

## 🎯 Objectifs utilisateurs

- **Débutant** : comprendre les bases du geste
- **Amateur** : gagner en régularité
- **Compétiteur** : réduire les micro-écarts
- **Coach** : outil d'analyse objective

## 🔄 Roadmap

### MVP (v0.1)
- [x] Configuration projet
- [ ] Capture vidéo
- [ ] Détection de pose
- [ ] Analyse basique d'un lancer
- [ ] Interface mobile-first
- [ ] Comparaison 3 lancers
- [ ] Feedback visuel

### Future (v0.2+)
- [ ] Historique et graphiques de progression
- [ ] Mode coach (comparaison joueurs)
- [ ] Export de session
- [ ] IA prédictive de trajectoire
- [ ] Mode multi-joueurs

## 📄 Licence

Projet privé - Tous droits réservés

## 👤 Auteur

Quentin - Développement et conception
