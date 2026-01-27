# Guide de démarrage rapide - TrakerDart

## 🚀 Installation et lancement

### 1. Installer les dépendances

```bash
npm install
```

### 2. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

### 3. Tester sur mobile

Pour tester sur votre smartphone (même réseau Wi-Fi) :

```bash
# Le serveur Vite affichera l'URL réseau, par exemple:
# Network: http://192.168.1.X:3000
```

Ouvrez cette URL dans le navigateur mobile.

## 📱 Utilisation de l'application

### Configuration initiale

1. **Autorisations caméra** : La première fois, le navigateur demandera l'accès à la caméra
2. **Positionnement** : Placez votre appareil pour vous voir de profil pendant le lancer
3. **Distance recommandée** : 2-3 mètres pour capturer tout le corps

### Enregistrer une volée

1. Cliquez sur **"Démarrer"** depuis l'accueil
2. Activez la caméra avec le bouton **"Activer la caméra"**
3. Vérifiez que le squelette (lignes vertes) est bien détecté
4. Lancez vos 3 fléchettes consécutivement
5. Consultez l'analyse biomécanique détaillée

### Interpréter les résultats

- **Score de régularité** (0-100) : Cohérence entre vos 3 lancers
  - 80-100 : Excellent
  - 60-79 : Bon
  - 40-59 : Moyen
  - 0-39 : À améliorer

- **Score technique** (0-100) : Qualité du geste
  - 85-100 : Technique de haut niveau
  - 70-84 : Bonne technique
  - 50-69 : Technique à améliorer
  - 0-49 : Nombreux défauts

## 🏗️ Structure du projet

```
src/
├── components/          # Composants React
│   ├── ui/             # Composants UI réutilisables (Button, Card...)
│   ├── camera/         # Gestion caméra et capture
│   └── analysis/       # Affichage des analyses (à venir)
├── lib/                # Bibliothèques métier
│   ├── pose/           # Détection de pose (TensorFlow.js)
│   ├── biomechanics/   # Calculs biomécaniques
│   ├── feedback/       # Génération de recommandations
│   ├── storage/        # Stockage IndexedDB
│   └── utils.ts        # Fonctions utilitaires
├── store/              # State management (Zustand)
├── types/              # Types TypeScript
├── pages/              # Pages de l'application
└── main.tsx            # Point d'entrée
```

## 🔧 Scripts disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Prévisualisation du build
npm run preview

# Linting
npm run lint
```

## 🎯 Fonctionnalités actuelles

✅ **Détection de pose en temps réel** (TensorFlow.js + MoveNet)
✅ **Capture vidéo** avec overlay de squelette
✅ **Analyse biomécanique complète** :
  - Angles articulaires (coude, poignet, épaule)
  - Détection des phases du mouvement
  - Stabilité du tronc et ligne de visée
✅ **Comparaison des 3 lancers** d'une volée
✅ **Génération de feedback** pédagogique
✅ **Stockage local** (IndexedDB)
✅ **PWA** (installation sur mobile)

## 🚧 Fonctionnalités à venir

⏳ Page de capture complète avec enregistrement
⏳ Page d'analyse détaillée avec visualisations
⏳ Historique des sessions
⏳ Graphiques de progression
⏳ Calibration automatique
⏳ Export de données

## 🐛 Dépannage

### La caméra ne démarre pas

- Vérifiez les permissions du navigateur
- Assurez-vous d'utiliser HTTPS ou localhost
- Fermez les autres applications utilisant la caméra

### Le squelette n'est pas détecté

- Améliorez l'éclairage
- Assurez-vous d'être entièrement visible dans le cadre
- Portez des vêtements contrastés avec l'arrière-plan

### Performances faibles

- Fermez les autres onglets du navigateur
- Réduisez la résolution de la caméra (dans les paramètres)
- Utilisez Chrome ou Edge (meilleure performance WebGL)

## 📚 Technologies utilisées

- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **TensorFlow.js** - IA pour détection de pose
- **MoveNet** - Modèle de détection de pose
- **Zustand** - State management
- **IndexedDB** - Stockage local
- **Radix UI** - Composants accessibles

## 🔐 Confidentialité

- ✅ Toutes les données restent **locales** (IndexedDB)
- ✅ Aucun serveur distant
- ✅ Aucune télémétrie
- ✅ Respect du RGPD

## 📄 Licence

Projet privé - Tous droits réservés
