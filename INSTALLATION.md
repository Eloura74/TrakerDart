# Guide d'installation détaillé - TrakerDart

## 📋 Prérequis

### Logiciels requis

1. **Node.js** (version 18 ou supérieure)
   - Télécharger : https://nodejs.org/
   - Vérifier l'installation : `node --version`

2. **npm** (inclus avec Node.js)
   - Vérifier : `npm --version`

3. **Git** (optionnel, pour cloner le projet)
   - Télécharger : https://git-scm.com/

### Configuration système

**Navigateurs supportés :**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Système d'exploitation :**
- Windows 10/11
- macOS 10.15+
- Linux (Ubuntu 20.04+)
- iOS 14+ (Safari)
- Android 10+ (Chrome)

**Matériel recommandé :**
- Processeur : Dual-core 2.0 GHz minimum
- RAM : 4 GB minimum (8 GB recommandé)
- Webcam : 720p minimum (1080p recommandé)
- Connexion : Non requise après installation

---

## 🚀 Installation

### Méthode 1 : Installation locale (développement)

#### Étape 1 : Obtenir le code source

**Option A : Cloner avec Git**
```bash
git clone [URL_DU_REPO]
cd TrakerDart
```

**Option B : Télécharger le ZIP**
- Télécharger le projet
- Extraire dans un dossier
- Ouvrir un terminal dans ce dossier

#### Étape 2 : Installer les dépendances

```bash
npm install
```

Cette commande va télécharger et installer tous les packages nécessaires (~200 MB).

**Temps estimé :** 2-5 minutes selon votre connexion.

#### Étape 3 : Lancer le serveur de développement

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

**Console devrait afficher :**
```
VITE v5.0.8  ready in 1234 ms

➜  Local:   http://localhost:3000/
➜  Network: http://192.168.1.X:3000/
```

#### Étape 4 : Ouvrir dans le navigateur

- Ouvrir `http://localhost:3000` dans votre navigateur
- Autoriser l'accès à la caméra quand demandé

---

### Méthode 2 : Build de production

Pour créer une version optimisée et déployable :

```bash
# 1. Build
npm run build

# 2. Prévisualiser le build
npm run preview
```

Les fichiers optimisés seront dans `/dist`.

**Pour déployer :**
- Héberger le contenu de `/dist` sur n'importe quel serveur web
- Ou utiliser des services gratuits : Netlify, Vercel, GitHub Pages

---

## 📱 Installation sur mobile (PWA)

### iOS (Safari)

1. Ouvrir l'application dans Safari
2. Appuyer sur le bouton "Partager" 
3. Sélectionner "Sur l'écran d'accueil"
4. Nommer l'app et confirmer

### Android (Chrome)

1. Ouvrir l'application dans Chrome
2. Appuyer sur le menu (⋮)
3. Sélectionner "Installer l'application"
4. Confirmer l'installation

**Avantages de l'installation PWA :**
- ✅ Fonctionne offline
- ✅ Icône sur l'écran d'accueil
- ✅ Pas de barre d'adresse
- ✅ Performances optimisées

---

## 🔧 Configuration avancée

### Variables d'environnement (optionnel)

Créer un fichier `.env` à la racine :

```env
# Port du serveur de dev (défaut: 3000)
VITE_PORT=3000

# Niveau de log TensorFlow
VITE_TF_LOG_LEVEL=error
```

### Personnalisation du modèle de détection

Dans `src/lib/pose/detector.ts`, modifier la configuration :

```typescript
export const DEFAULT_CONFIG: DetectorConfig = {
  modelType: 'lightning',  // 'lightning' (rapide) ou 'thunder' (précis)
  enableSmoothing: true,
  minPoseScore: 0.25,
  minKeypointScore: 0.3
}
```

**Recommandations :**
- **Mobile** : `lightning` + `minPoseScore: 0.25`
- **Desktop** : `thunder` + `minPoseScore: 0.3`
- **Connexion lente** : `lightning` + cache activé

---

## 🐛 Dépannage

### Erreur : "Cannot find module"

**Cause :** Dépendances non installées

**Solution :**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erreur : "Port 3000 already in use"

**Cause :** Un autre processus utilise le port 3000

**Solution :**
```bash
# Option 1 : Utiliser un autre port
npm run dev -- --port 3001

# Option 2 : Tuer le processus sur le port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Option 2 : Tuer le processus (Linux/Mac)
lsof -ti:3000 | xargs kill -9
```

### La caméra ne fonctionne pas

**Causes possibles :**

1. **Permissions refusées**
   - Vérifier les paramètres du navigateur
   - Réautoriser l'accès à la caméra

2. **HTTPS requis** (hors localhost)
   - Utiliser localhost pour le dev
   - Utiliser HTTPS en production

3. **Caméra utilisée par une autre app**
   - Fermer les autres applications (Zoom, Teams, etc.)

4. **Pilotes obsolètes**
   - Mettre à jour les pilotes de la webcam

### Le squelette n'est pas détecté

**Solutions :**

1. **Améliorer l'éclairage**
   - Éviter le contre-jour
   - Éclairer uniformément

2. **Ajuster le cadrage**
   - Être entièrement visible
   - Distance recommandée : 2-3 mètres

3. **Contraste**
   - Porter des vêtements contrastés avec l'arrière-plan
   - Éviter les arrière-plans chargés

4. **Réduire le seuil de détection**
   ```typescript
   // Dans detector.ts
   minPoseScore: 0.15  // Plus permissif
   ```

### Performances faibles / lag

**Optimisations :**

1. **Fermer les autres onglets/applications**

2. **Réduire la résolution de la caméra**
   ```typescript
   // Dans CameraCapture.tsx
   width: { ideal: 640 },   // Au lieu de 1280
   height: { ideal: 480 },  // Au lieu de 720
   ```

3. **Throttler la détection**
   ```typescript
   // Dans usePoseDetection hook
   throttle: 100  // Détecter max 10 FPS
   ```

4. **Utiliser le modèle Lightning**
   ```typescript
   modelType: 'lightning'  // Plus rapide que 'thunder'
   ```

5. **Désactiver l'overlay de squelette**
   ```tsx
   <CameraCapture showSkeleton={false} />
   ```

### Erreur TensorFlow.js

**Message :** "WebGL not supported"

**Solution :**
1. Vérifier que WebGL est activé dans le navigateur
2. Mettre à jour les pilotes graphiques
3. Essayer un autre navigateur (Chrome recommandé)

**Test WebGL :** Visiter https://get.webgl.org/

---

## 🔄 Mise à jour

Pour mettre à jour vers une nouvelle version :

```bash
# 1. Sauvegarder vos données (export depuis l'app)

# 2. Récupérer les dernières modifications
git pull

# 3. Réinstaller les dépendances
npm install

# 4. Relancer
npm run dev
```

---

## 🗑️ Désinstallation

### Supprimer l'application

```bash
# 1. Arrêter le serveur (Ctrl+C)

# 2. Supprimer le dossier du projet
rm -rf TrakerDart
```

### Nettoyer les données du navigateur

1. Ouvrir les outils développeur (F12)
2. Onglet "Application" (Chrome) ou "Storage" (Firefox)
3. Supprimer :
   - IndexedDB → `trakerdart`
   - LocalStorage → `trakerdart-storage`
   - Cache Storage → Tout nettoyer

### Désinstaller la PWA

**iOS :**
- Maintenir l'icône de l'app
- Appuyer sur "Supprimer l'app"

**Android :**
- Maintenir l'icône de l'app
- Glisser vers "Désinstaller"

---

## 📞 Support

En cas de problème persistant :

1. Consulter la [TODOLIST.md](./TODOLIST.md) (bugs connus)
2. Vérifier les [issues GitHub](lien_vers_issues)
3. Créer une nouvelle issue avec :
   - Description du problème
   - Étapes pour reproduire
   - Navigateur et OS utilisés
   - Console d'erreur (F12)

---

## ✅ Vérification de l'installation

Pour vérifier que tout fonctionne :

```bash
# 1. Vérifier Node.js
node --version
# Attendu : v18.x.x ou supérieur

# 2. Vérifier npm
npm --version
# Attendu : 9.x.x ou supérieur

# 3. Vérifier les dépendances
npm list --depth=0
# Aucune erreur UNMET DEPENDENCY

# 4. Lancer l'app
npm run dev
# Le serveur démarre sans erreur
```

**Test de la caméra :**
1. Ouvrir http://localhost:3000
2. Cliquer "Démarrer"
3. Cliquer "Activer la caméra"
4. Vérifier que le flux vidéo s'affiche
5. Vérifier que le squelette (lignes vertes) est détecté

✅ **Si tout fonctionne, l'installation est réussie !**
