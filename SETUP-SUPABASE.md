# 🚀 Configuration Supabase - Guide Rapide

**Problème actuel** : Erreur 406 sur `/rest/v1/subscriptions`  
**Cause** : Les tables n'existent pas encore dans Supabase

---

## ⚡ Solution Rapide (5 minutes)

### Étape 1: Accéder au SQL Editor

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet **TrakerDart**
3. Dans le menu gauche → Cliquer sur **SQL Editor**

### Étape 2: Exécuter la Migration

1. Cliquer sur **"+ New query"**
2. Ouvrir le fichier : `supabase/migrations/20260128_create_subscriptions.sql`
3. **Copier TOUT le contenu** (201 lignes)
4. **Coller** dans le SQL Editor Supabase
5. Cliquer sur **"Run"** (en bas à droite)

**Résultat attendu** :
```
✅ Success. No rows returned
```

### Étape 3: Vérifier les Tables

Dans le menu gauche → **Table Editor**, vous devriez voir :
- ✅ `subscriptions` (colonnes: id, user_id, tier_id, status, etc.)
- ✅ `usage_tracking` (colonnes: id, user_id, feature_id, count, etc.)
- ✅ `feature_gates` (14 lignes insérées avec les features)

---

## 🔍 Vérification Rapide

### Test 1: Vérifier feature_gates

Dans SQL Editor, exécuter :
```sql
SELECT feature_id, free_limit, pro_limit, elite_limit
FROM feature_gates
ORDER BY feature_id;
```

**Résultat attendu** : 14 lignes avec les features (sessions_per_month, pdf_exports, etc.)

### Test 2: Vérifier les fonctions

```sql
-- Tester get_user_tier() avec votre user_id
SELECT get_user_tier('109ec285-9618-4268-aef2-968e421f7190'::uuid);
```

**Résultat attendu** : `free` (car pas encore d'abonnement)

---

## 🎯 Après la Migration

### Redémarrer l'Application

```bash
# Arrêter le serveur (Ctrl+C)
# Redémarrer
npm run dev
```

### Tester

1. ✅ Aller sur http://localhost:3000
2. ✅ **Pas d'erreur 406**
3. ✅ UsageBanner affiche "Sessions: 0 / 10"
4. ✅ Créer une session → Compteur s'incrémente

---

## 🐛 Si ça ne marche toujours pas

### Vérifier l'Auth

Dans SQL Editor :
```sql
-- Voir votre user_id actuel
SELECT id, email FROM auth.users;
```

Copier votre `id` et remplacer dans le test :
```sql
SELECT get_user_tier('VOTRE_USER_ID'::uuid);
```

### Vérifier les RLS (Row Level Security)

Les politiques RLS permettent l'accès uniquement à ses propres données.

Si problème, temporairement désactiver pour tester :
```sql
-- ⚠️ SEULEMENT POUR TESTER (pas en production)
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking DISABLE ROW LEVEL SECURITY;
```

Puis réactiver :
```sql
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
```

---

## 📋 Checklist Complète

- [ ] Migration SQL exécutée sans erreur
- [ ] Table `subscriptions` visible dans Table Editor
- [ ] Table `usage_tracking` visible dans Table Editor  
- [ ] Table `feature_gates` contient 14 lignes
- [ ] Fonction `get_user_tier()` retourne 'free'
- [ ] Application redémarrée
- [ ] Pas d'erreur 406 dans la console
- [ ] UsageBanner s'affiche correctement

---

## 💡 Mode Dev Simplifié (Optionnel)

Si tu veux tester sans Supabase temporairement, éditer `.env` :

```env
# Désactiver Supabase temporairement
VITE_DEV_MODE=true
VITE_DEV_DEFAULT_TIER=elite

# Commenter les variables Supabase
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
```

Modifier `src/services/subscription.ts` :
```typescript
export async function getUserTier(): Promise<SubscriptionTier> {
  // Mode dev : retour direct sans Supabase
  if (import.meta.env.VITE_DEV_MODE === 'true') {
    return (import.meta.env.VITE_DEV_DEFAULT_TIER as SubscriptionTier) || 'free';
  }
  
  // ... reste du code
}
```

---

## 🎉 C'est Fait !

Une fois la migration appliquée, l'erreur 406 disparaîtra et le feature gating sera 100% fonctionnel !

**Prochaine étape** : Tester les 3 tiers (Free/Pro/Elite) avec `VITE_DEV_DEFAULT_TIER`

---

**Créé le** : 28 janvier 2026  
**Pour** : @Eloura74  
**Durée** : ~5 minutes
