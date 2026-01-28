# ❓ FAQ - Questions Fréquentes - TrakerDart

**Toutes les réponses à vos questions sur TrakerDart**

---

## 🎯 GÉNÉRAL

### Qu'est-ce que TrakerDart ?

TrakerDart est une application web d'analyse biomécanique pour le lancer de fléchettes. Elle utilise l'IA et la vision par ordinateur pour analyser votre geste en temps réel via webcam et vous donner des conseils personnalisés pour améliorer votre précision.

### Est-ce gratuit ?

Oui ! TrakerDart propose un **forfait gratuit** avec :
- 10 sessions par mois
- 3 lancers par session
- Analyse biomécanique basique
- Export CSV/JSON

Pour plus de fonctionnalités (IA, coaching temps réel, exports vidéo), consultez nos [plans Pro et Elite](#pricing).

### Quel matériel ai-je besoin ?

**Minimum requis** :
- 💻 Ordinateur (Windows/Mac/Linux) ou smartphone récent
- 📷 Webcam (720p minimum, 1080p recommandé)
- 🌐 Navigateur moderne (Chrome, Firefox, Safari, Edge)
- 🎯 Cible de fléchettes

**Recommandé pour meilleure qualité** :
- Webcam 1080p avec bon éclairage
- Fond uni derrière le lanceur
- Connexion internet stable

### Fonctionne sur mobile ?

✅ **Oui !** TrakerDart est une PWA (Progressive Web App) :
- Fonctionne sur iOS et Android
- Interface optimisée mobile
- Peut s'installer comme une app native
- Fonctionne offline (après première visite)

**Limitations mobile** :
- Dashboard non personnalisable (lecture seule)
- Calibration ArUco nécessite desktop

---

## 🚀 UTILISATION

### Comment faire ma première session ?

1. **Créer un compte** (email + mot de passe)
2. **Autoriser accès caméra** quand demandé
3. **Cliquer "Nouvelle Session"**
4. **Se positionner face caméra** (2-3m distance)
5. **Effectuer 3 lancers** (détection automatique)
6. **Consulter résultats** immédiatement !

### La caméra ne fonctionne pas

**Solutions** :
1. Vérifier permissions navigateur (icône 🔒 dans barre URL)
2. Autoriser caméra pour le site
3. Fermer autres apps utilisant la caméra (Zoom, Teams, etc.)
4. Rafraîchir la page (F5)
5. Redémarrer navigateur

**Toujours rien ?**
- Tester caméra sur https://webcamtests.com
- Vérifier pilotes caméra à jour
- Essayer autre navigateur

### La détection de pose est imprécise

**Causes & Solutions** :

**Lumière insuffisante** ⚠️
- Ajouter éclairage frontal
- Éviter contre-jour (fenêtre derrière)

**Fond encombré** ⚠️
- Utiliser fond uni
- Éviter objets/personnes en arrière-plan

**Position incorrecte** ⚠️
- Se placer face caméra (pas de profil)
- Distance 2-3m optimale
- Corps entier visible dans cadre

**Vêtements** ⚠️
- Porter vêtements contrastés
- Éviter couleurs trop similaires au fond

**Solution ultime** : [Calibration ArUco](#aruco) (Elite)

### Combien de lancers par session ?

**Forfait Gratuit** : 3 lancers/session (1 volée)  
**Pro & Elite** : Illimité

Une "session" = 1 entraînement complet  
Une "volée" = 3 lancers consécutifs analysés ensemble

### Puis-je comparer mes sessions ?

✅ **Oui !** Fonctionnalité "Comparaison" :
1. Menu → Comparaison
2. Sélectionner 2 sessions
3. Voir tableau comparatif + graphiques évolution

**Limite Free** : Comparer seulement 2 sessions  
**Pro/Elite** : Comparaisons illimitées

---

## 🤖 IA GÉNÉRATIVE

### Comment activer l'IA ?

**Prérequis** :
1. Abonnement **Pro ou Elite**
2. Clé API OpenAI (gratuite à créer)

**Configuration** :
1. Aller sur [platform.openai.com](https://platform.openai.com)
2. Créer compte + clé API
3. Dans TrakerDart : Menu → Config IA
4. Coller clé API (sk-...)
5. Choisir modèle (GPT-3.5-turbo recommandé)
6. Sauvegarder

### Quel modèle IA choisir ?

**GPT-3.5-turbo** ⭐ RECOMMANDÉ
- Le moins cher ($0.001-0.003/req)
- Rapide
- Qualité excellente pour fléchettes
- **Usage moyen : $3-6/mois**

**GPT-4o-mini**
- Léger + performant
- $0.002-0.004/req
- Bon compromis

**GPT-4**
- Le plus précis
- Le plus cher ($0.03-0.06/req)
- Réservé usages spécifiques

### Combien coûte l'IA par mois ?

**Estimations** (avec GPT-3.5-turbo) :

| Usage | Requêtes/jour | Coût/mois |
|-------|---------------|-----------|
| Léger | 5-10 | $1-2 |
| Moyen | 20-30 | $3-6 |
| Intensif | 50-100 | $10-20 |

**Inclus dans l'app** :
- Tracking tokens temps réel
- Estimation coût USD
- Historique mensuel

### L'IA génère des erreurs

**"JSON parsing error"** :
- Augmenter maxTokens (Config IA)
- Réduire température (0.5 recommandé)
- Essayer autre modèle

**"API Key invalid"** :
- Vérifier clé copiée complète
- Créer nouvelle clé OpenAI
- Vérifier crédit API restant

**"Rate limit exceeded"** :
- Trop de requêtes simultanées
- Attendre 1 minute
- Upgrade plan OpenAI si nécessaire

### Différence Chat / Recommandations / Plans ?

**Chat Coach IA** 💬
- Conversation interactive
- Questions libres
- Conseils instantanés
- **Limite Pro : 50 messages/mois**

**Recommandations IA** 🎯
- Analyse automatique sessions
- 2-3 recommandations concrètes
- Actions priorisées
- **Limite Pro : 20/mois**

**Plans d'Entraînement** 📅
- Programme 7-90 jours
- Exercices détaillés
- Progression structurée
- **Limite Pro : 2/mois**

---

## 🎯 CALIBRATION ARUCO

### Qu'est-ce que la calibration ArUco ?

Calibration 3D professionnelle avec **marqueurs fiduciaires** pour :
- ✅ +20% précision détection
- ✅ Correction distorsion caméra
- ✅ Mapping 2D→3D précis
- ✅ Analyse professionnelle

**Réservé Elite** uniquement.

### Comment calibrer avec ArUco ?

**Matériel** :
1. Imprimer **cible ArUco** (template fourni)
2. Fixer sur cible fléchettes

**Processus** :
1. Menu → Calibration ArUco
2. Démarrer détection
3. Positionner cible face caméra
4. Capturer **5-10 frames** (angles variés)
5. Cliquer "Calibrer"
6. Vérifier qualité (< 1.0 px = excellent)
7. Sauvegarder profil

**Durée** : 5-10 minutes

### Combien de profils puis-je sauvegarder ?

**Free** : 0 (pas d'accès ArUco)  
**Pro** : 3 profils  
**Elite** : Illimité

**Utilité profils multiples** :
- 1 profil par caméra
- 1 profil par lieu (maison, club, extérieur)
- Backup/comparaison

### Les marqueurs ne sont pas détectés

**Solutions** :
1. **Améliorer lumière** (crucial !)
2. **Impression haute qualité** (laser, pas jet d'encre)
3. **Marqueurs bien visibles** (4/4 requis)
4. **Cible face caméra** (pas d'angle)
5. **Distance optimale** (1-3m)

**Vérifier** :
- Marqueurs ID 0, 1, 2, 3 corrects
- Taille 50mm chacun
- Contraste noir/blanc net

---

## 📤 EXPORTS

### Quels formats d'export ?

**Vidéo** (Pro/Elite) :
- 720p (Pro : 5/mois)
- 1080p (Elite : 10/mois)
- 4K (Elite : 3/mois)
- Format : MP4 avec overlays

**Rapports** (Pro/Elite) :
- PDF (Pro : 10/mois, Elite : illimité)
- HTML (illimité)
- DOCX (illimité)

**Données** (Tous) :
- CSV (illimité)
- JSON (illimité)

### L'export vidéo est très lent

**Normal** : Processing côté client (FFmpeg.wasm)

**Durées estimées** :
- 720p : 30-60 secondes
- 1080p : 1-2 minutes
- 4K : 2-4 minutes

**Dépend de** :
- Puissance appareil
- Longueur session
- Navigateur utilisé

**Optimisations** :
- Fermer autres onglets
- Utiliser desktop (pas mobile)
- Chrome/Edge (meilleurs perfs)

### Puis-je partager mes rapports ?

✅ **Oui !** Plusieurs options :

1. **Email** : Télécharger PDF + envoyer
2. **Cloud** : Sauvegarder sur Drive/Dropbox
3. **Réseaux sociaux** : Partager screenshots
4. **Coach** : Collaboration coach (future)

---

## 💳 ABONNEMENTS & PRICING

### Différences Free / Pro / Elite ?

**GRATUIT** (0€)
- 10 sessions/mois
- 3 lancers/session
- Analyse basique
- Export CSV/JSON

**PRO** (9.99€/mois)
- Sessions illimitées
- Export vidéo 720p
- Export PDF
- IA limitée (20 recs, 50 msg, 2 plans/mois)
- Coaching temps réel
- Support prioritaire 48h

**ELITE** (19.99€/mois)
- Tout Pro +
- Export 1080p/4K
- IA illimitée (tous modèles)
- Calibration ArUco
- Rapports programmés
- Support VIP 24h

[→ Voir tableau comparatif complet](#pricing)

### Comment upgrader ?

1. Menu → Mon Abonnement
2. Choisir plan Pro ou Elite
3. Paiement sécurisé Stripe
4. Activation immédiate

**Modes paiement** : CB, PayPal, Apple Pay, Google Pay

### Puis-je annuler ?

✅ **Oui, à tout moment !**

- Pas d'engagement
- Annulation en 1 clic
- Accès jusqu'à fin période payée
- Pas de frais cachés

**Remboursement** : 14 jours satisfait ou remboursé

### Réductions disponibles ?

**-20% sur abonnement annuel**  
**-50% étudiants** (sur justificatif)  
**Essai gratuit 7 jours** (Pro/Elite)

---

## 🔒 SÉCURITÉ & CONFIDENTIALITÉ

### Mes vidéos sont-elles sauvegardées ?

**NON ! 🔒**

- Vidéos **JAMAIS uploadées** sur serveur
- Processing **100% local** (dans navigateur)
- Seules **métadonnées** sauvegardées (scores, angles)
- Export vidéo = fichier local uniquement

**Vous gardez contrôle total de vos vidéos.**

### Où sont stockées mes données ?

**Données analysées** :
- Scores, angles, métriques → **Supabase** (chiffré)
- Préférences, settings → **localStorage** (local)

**Clé API OpenAI** :
- **localStorage uniquement** (jamais envoyée à nos serveurs)
- Chiffrée dans navigateur
- Supprimée si vous déconnectez

### Est-ce RGPD compliant ?

✅ **Oui, totalement !**

- Données hébergées UE (Supabase EU)
- Chiffrement end-to-end
- Droit accès/modification/suppression
- Export données JSON
- Suppression compte complète

[→ Politique de Confidentialité complète](#privacy)

### Puis-je supprimer mon compte ?

✅ **Oui** : Menu → Paramètres → Supprimer compte

**Supprime** :
- Toutes vos données
- Abonnements actifs
- Historique complet

**Irrévocable** - Confirmation requise.

---

## 🛠️ TECHNIQUE

### Quels navigateurs supportés ?

**Recommandés** ✅ :
- Chrome 90+ (meilleur)
- Edge 90+
- Firefox 88+
- Safari 14+ (iOS/Mac)

**Non supportés** ❌ :
- Internet Explorer
- Navigateurs trop anciens (< 2020)

### Fonctionne offline ?

**Partiellement** :

✅ **Offline** :
- Consultation historique
- Visualisation stats
- Interface app

❌ **Nécessite internet** :
- Capture nouveaux lancers (IA TensorFlow)
- Fonctionnalités IA (OpenAI API)
- Synchronisation cloud
- Authentification

**PWA** : L'app se met en cache après 1ère visite.

### Compatibilité caméras ?

✅ **Compatible avec** :
- Webcams USB standards
- Caméras laptop intégrées
- Caméras smartphones (front/back)
- Caméras externes HD

**Résolutions supportées** :
- Minimum : 640x480 (VGA)
- Recommandé : 1280x720 (HD)
- Optimal : 1920x1080 (Full HD)

### Puis-je utiliser plusieurs caméras ?

**Actuellement** : 1 caméra à la fois

**Bientôt** : Phase 7 Multi-Caméras (Elite)
- Capture simultanée multi-angles
- Reconstruction 3D trajectoire
- Vue 360° analyses

---

## 💬 SUPPORT

### Comment contacter le support ?

**Email** : support@trakerdart.app

**Temps réponse** :
- Free : 72h
- Pro : 48h
- Elite : 24h

**Discord** : [discord.gg/trakerdart](#) (communauté)

### Signaler un bug

**Par email** avec :
1. Description bug
2. Steps pour reproduire
3. Screenshots/vidéo si possible
4. Navigateur + OS + version
5. Console logs (F12 → Console)

**Priorité** : Bugs bloquants traités en < 24h

### Demander une fonctionnalité

**Roadmap publique** : [github.com/trakerdart/roadmap](#)

Votez pour features souhaitées ou proposez nouvelles idées !

### Contribuer au projet

TrakerDart est **open-source** ! 🎉

**GitHub** : [github.com/trakerdart/trakerdart](#)

**Contributions bienvenues** :
- Code (TypeScript/React)
- Documentation
- Traductions
- Tests
- Bug reports

---

## 📚 RESSOURCES

### Tutoriels vidéo

- [🎥 Première session](https://youtube.com/watch?v=XXX)
- [🎥 Configuration IA](https://youtube.com/watch?v=XXX)
- [🎥 Calibration ArUco](https://youtube.com/watch?v=XXX)
- [🎥 Tips & Tricks](https://youtube.com/watch?v=XXX)

### Documentation complète

- [📖 Guide Utilisateur](GUIDE-UTILISATEUR-RAPIDE.md)
- [🤖 Doc IA Générative](IA-GENERATIVE-IMPLEMENTATION.md)
- [🎯 Doc Calibration ArUco](PHASE-6-ARUCO-COMPLETE.md)
- [⚙️ Configuration Technique](README.md)

### Rejoindre la communauté

- **Discord** : Discussions, entraide, updates
- **Twitter** : @TrakerDartApp
- **Instagram** : @trakerdart
- **YouTube** : Tutoriels & démos

---

## ❓ AUTRE QUESTION ?

**Pas trouvé réponse ?**

📧 **Email** : support@trakerdart.app  
💬 **Discord** : [Rejoindre la communauté](#)  
📖 **Docs** : [Documentation complète](#docs)

---

**Mis à jour** : 28 janvier 2026  
**Version** : 0.9.2
