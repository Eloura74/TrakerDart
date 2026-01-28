# 🗄️ Supabase Database Setup - TrakerDart

## 📋 Configuration Requise

### 1. Créer Projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter les credentials :
   - Project URL : `https://XXXXX.supabase.co`
   - API Key (anon, public) : `eyJhbGc...`
   - Service Role Key : `eyJhbGc...` (secret, ne pas exposer)

### 2. Configurer Variables d'Environnement

Créer `.env.local` à la racine :

```env
VITE_SUPABASE_URL=https://XXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## 🚀 Migrations Database

### Migration Automatique (Recommandé)

```bash
# Installer Supabase CLI
npm install -g supabase

# Login
supabase login

# Lier projet
supabase link --project-ref XXXXX

# Appliquer migrations
supabase db push
```

### Migration Manuelle

1. Ouvrir **Supabase Dashboard** → **SQL Editor**
2. Exécuter le contenu de `migrations/001_create_usage_tracking.sql`
3. Vérifier dans **Table Editor** que `usage_tracking` existe

---

## 📊 Tables Créées

### `usage_tracking`

**Description** : Tracking usage des features par user/mois

**Colonnes** :
- `id` : UUID (PK)
- `user_id` : UUID (FK → auth.users)
- `feature_id` : TEXT (ex: `video_exports_720p`)
- `count` : INTEGER (nombre utilisations)
- `period_start` : TIMESTAMP (début période)
- `period_end` : TIMESTAMP (fin période, optionnel)
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP (auto-update trigger)

**Indexes** :
- `user_id`
- `feature_id`
- `user_id + feature_id`
- `period_start`
- `user_id + feature_id + period_start` (composite)

**RLS Policies** :
- Users can view own usage (SELECT)
- Users can insert own usage (INSERT)
- Users can update own usage (UPDATE)
- Users can delete own usage (DELETE)

---

## 🔒 Row Level Security (RLS)

Toutes les tables ont RLS activé :
- ✅ Users peuvent seulement accéder leurs propres données
- ✅ Sécurité garantie au niveau database
- ✅ Pas besoin de vérifications côté client

---

## 🧪 Tester la Configuration

```sql
-- Dans SQL Editor Supabase

-- 1. Vérifier table existe
SELECT * FROM public.usage_tracking LIMIT 5;

-- 2. Tester insertion (remplacer UUID par user réel)
INSERT INTO public.usage_tracking (user_id, feature_id, count, period_start)
VALUES (
  'USER_UUID_ICI',
  'video_exports_720p',
  1,
  DATE_TRUNC('month', NOW())
);

-- 3. Vérifier RLS fonctionne
-- Connecté comme user X, ne devrait voir que ses données
SELECT * FROM public.usage_tracking WHERE user_id = auth.uid();
```

---

## 📈 Feature IDs Disponibles

Selon `src/config/features.ts` :

**Captures** :
- `sessions_per_month`
- `volleys_per_session`

**Exports** :
- `pdf_exports`
- `video_exports_720p`
- `video_exports_1080p`
- `video_exports_4k`
- `csv_exports`

**Comparaisons** :
- `comparable_sessions`

**IA** :
- `ai_recommendations`
- `ai_training_plans`
- `chatbot_messages`

**Stockage** :
- `storage_mb`
- `storage_cloud_gb`

**Rapports** :
- `scheduled_reports`

**Calibration** :
- `saved_calibration_profiles`

---

## 🔄 Maintenance

### Nettoyer Anciennes Données

```sql
-- Supprimer tracking > 1 an
DELETE FROM public.usage_tracking
WHERE period_start < NOW() - INTERVAL '1 year';

-- Archiver données anciennes (optionnel)
CREATE TABLE IF NOT EXISTS usage_tracking_archive AS
SELECT * FROM usage_tracking
WHERE period_start < NOW() - INTERVAL '6 months';
```

### Monitoring

```sql
-- Stats par feature
SELECT 
  feature_id,
  COUNT(*) as records,
  SUM(count) as total_usage,
  COUNT(DISTINCT user_id) as unique_users
FROM public.usage_tracking
WHERE period_start >= DATE_TRUNC('month', NOW())
GROUP BY feature_id
ORDER BY total_usage DESC;

-- Top users par feature
SELECT 
  user_id,
  feature_id,
  SUM(count) as total
FROM public.usage_tracking
WHERE period_start >= DATE_TRUNC('month', NOW())
GROUP BY user_id, feature_id
ORDER BY total DESC
LIMIT 10;
```

---

## 🐛 Troubleshooting

### Erreur 406 Not Acceptable

**Cause** : Table `usage_tracking` n'existe pas

**Solution** :
1. Exécuter migration SQL
2. Vérifier RLS policies actives
3. Redémarrer app

### Erreur Permissions

**Cause** : RLS bloque accès

**Solution** :
1. Vérifier user authentifié (`auth.uid()` non null)
2. Vérifier policies créées
3. Tester avec Service Role Key (admin)

### Performance Lente

**Cause** : Index manquants

**Solution** :
```sql
-- Vérifier indexes
SELECT * FROM pg_indexes WHERE tablename = 'usage_tracking';

-- Réanalyser table
ANALYZE public.usage_tracking;
```

---

## 📚 Documentation Officielle

- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Migrations](https://supabase.com/docs/guides/cli/managing-environments)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)

---

**Prêt pour production ! ✅**
