# Compatibilité mobile Android

## ✅ Corrections apportées

### 1. Backend TensorFlow avec fallback
- **WebGL** : Essayé en premier (rapide)
- **CPU** : Fallback automatique si WebGL échoue
- **Message clair** : Si aucun ne fonctionne

### 2. Configuration caméra optimisée
- Résolution max : 1280x720 (au lieu de 1920x1080)
- Résolution idéale : 640x480
- Contraintes simplifiées pour mobile

### 3. PWA (Progressive Web App)
- **manifest.json** créé avec :
  - Nom de l'app
  - Icônes (à ajouter)
  - Permissions caméra
  - Mode standalone
  - Orientation portrait

### 4. Meta tags optimisés
- `viewport-fit=cover` pour iPhone X+
- `mobile-web-app-capable`
- Theme color cohérent

## 🧪 Pour tester sur Android

### Via le réseau local

1. **Sur votre PC** :
   ```bash
   npm run dev
   ```
   
2. **Notez l'adresse réseau** dans la console :
   ```
   ➜  Network: http://192.168.1.10:3000/
   ```

3. **Sur votre Android** :
   - Ouvrez Chrome
   - Tapez l'adresse : `http://192.168.1.10:3000`
   - Autorisez la caméra quand demandé

### Installation comme app

1. Dans Chrome Android
2. Menu ⋮ → "Ajouter à l'écran d'accueil"
3. L'app s'ouvre en plein écran

## 🔧 Si ça ne fonctionne toujours pas

### Navigateurs supportés Android
- ✅ **Chrome** 90+
- ✅ **Firefox** 88+
- ✅ **Edge** 90+
- ⚠️ **Opera** (parfois problématique)
- ❌ **Samsung Internet** (WebGL limité)

### Vérifications

1. **Permissions caméra** :
   - Paramètres Android → Apps → Chrome → Permissions → Caméra

2. **WebGL supporté** :
   - Ouvrez `chrome://gpu` sur mobile
   - Cherchez "WebGL"
   - Doit être "Activé"

3. **Fallback CPU** :
   - Si WebGL échoue, l'app utilise le CPU
   - Sera plus lent mais fonctionnel

## 📱 Limitations mobiles connues

- **FPS** : 15-30 fps (vs 60+ sur PC)
- **Latence** : +100-200ms
- **Batterie** : Consommation importante
- **Chaleur** : Appareil peut chauffer

## 🚀 Optimisations futures possibles

1. **Service Worker** pour offline
2. **Lazy loading** des modèles
3. **Quantization** du modèle (plus léger)
4. **Cache des analyses**
5. **Mode basse consommation**

## ⚠️ Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| "Caméra non supportée" | Permissions refusées | Autoriser dans les paramètres |
| "WebGL non disponible" | GPU désactivé | Activer dans `chrome://flags` |
| "Détecteur échoue" | Mémoire insuffisante | Fermer d'autres apps |
| Page blanche | Service Worker corrompu | Vider le cache |

## 📝 Checklist test Android

- [ ] Chrome mobile ouvre l'app
- [ ] Permissions caméra demandées
- [ ] Caméra s'active
- [ ] Squelette s'affiche
- [ ] Détection fonctionne
- [ ] Les 3 lancers sont captés
- [ ] Analyse s'affiche
- [ ] Graphiques sont visibles
- [ ] Navigation fluide
