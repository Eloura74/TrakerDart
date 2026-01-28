/**
 * Migration SQL pour le système de subscriptions
 * À exécuter dans Supabase SQL Editor ou via Supabase CLI
 */

-- Table des abonnements
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier_id TEXT NOT NULL CHECK (tier_id IN ('free', 'pro', 'elite')),
  paypal_customer_id TEXT,
  paypal_subscription_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')) DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paypal_subscription_id ON subscriptions(paypal_subscription_id);

-- Table de tracking d'usage
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature_id TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_feature_id ON usage_tracking(feature_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON usage_tracking(period_start, period_end);

-- Table des gates de fonctionnalités (configuration)
CREATE TABLE IF NOT EXISTS feature_gates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_id TEXT UNIQUE NOT NULL,
  free_limit INTEGER,
  pro_limit INTEGER,
  elite_limit INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer les configurations de features par défaut
INSERT INTO feature_gates (feature_id, free_limit, pro_limit, elite_limit, description) VALUES
  ('sessions_per_month', 10, -1, -1, 'Nombre de sessions d''entraînement par mois'),
  ('volleys_per_session', 3, -1, -1, 'Nombre de lancers par session'),
  ('pdf_exports', 0, 10, -1, 'Export de rapports PDF'),
  ('video_exports_720p', 0, 5, 20, 'Export vidéo 720p'),
  ('video_exports_1080p', 0, 0, 10, 'Export vidéo 1080p'),
  ('video_exports_4k', 0, 0, 3, 'Export vidéo 4K'),
  ('ai_recommendations', 0, 20, -1, 'Recommandations IA par mois'),
  ('ai_training_plans', 0, 2, -1, 'Plans d''entraînement IA générés'),
  ('chatbot_messages', 0, 50, -1, 'Messages chatbot assistant'),
  ('comparable_sessions', 2, -1, -1, 'Sessions comparables simultanément'),
  ('storage_mb', 100, 5000, -1, 'Stockage local en MB'),
  ('storage_cloud_gb', 0, 10, 100, 'Stockage cloud en GB'),
  ('saved_calibration_profiles', 0, 3, -1, 'Profils de calibration sauvegardés'),
  ('scheduled_reports', 0, 0, -1, 'Rapports programmés automatiques')
ON CONFLICT (feature_id) DO NOTHING;

-- Fonction pour obtenir le tier d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_tier(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_tier TEXT;
BEGIN
  -- Récupérer le tier actif le plus récent
  SELECT tier_id INTO v_tier
  FROM subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Retourner 'free' par défaut si aucun abonnement trouvé
  RETURN COALESCE(v_tier, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier l'accès à une fonctionnalité
CREATE OR REPLACE FUNCTION check_feature_access(
  p_user_id UUID,
  p_feature_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier TEXT;
  v_limit INTEGER;
  v_usage INTEGER;
BEGIN
  -- Obtenir le tier de l'utilisateur
  v_tier := get_user_tier(p_user_id);
  
  -- Récupérer la limite pour ce tier
  SELECT
    CASE v_tier
      WHEN 'free' THEN free_limit
      WHEN 'pro' THEN pro_limit
      WHEN 'elite' THEN elite_limit
      ELSE 0
    END
  INTO v_limit
  FROM feature_gates
  WHERE feature_id = p_feature_id;
  
  -- Si la fonctionnalité n'existe pas, refuser l'accès
  IF v_limit IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Si illimité (-1), autoriser
  IF v_limit = -1 THEN
    RETURN TRUE;
  END IF;
  
  -- Si limite à 0, refuser
  IF v_limit = 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Calculer l'usage du mois en cours
  SELECT COALESCE(SUM(count), 0) INTO v_usage
  FROM usage_tracking
  WHERE user_id = p_user_id
    AND feature_id = p_feature_id
    AND period_start >= DATE_TRUNC('month', NOW());
  
  -- Vérifier si l'usage est inférieur à la limite
  RETURN v_usage < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security (RLS)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_gates ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour subscriptions: les utilisateurs ne voient que leurs abonnements
CREATE POLICY "Utilisateurs peuvent voir leurs propres abonnements"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent créer leurs abonnements"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent mettre à jour leurs abonnements"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Politique RLS pour usage_tracking: les utilisateurs ne voient que leur usage
CREATE POLICY "Utilisateurs peuvent voir leur propre usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent créer leur usage"
  ON usage_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent mettre à jour leur usage"
  ON usage_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- Politique RLS pour feature_gates: lecture publique, écriture admin seulement
CREATE POLICY "Tout le monde peut lire les feature gates"
  ON feature_gates FOR SELECT
  TO authenticated
  USING (TRUE);

-- Fonction trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour subscriptions
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Commentaires pour documentation
COMMENT ON TABLE subscriptions IS 'Gestion des abonnements utilisateurs (Free, Pro, Elite)';
COMMENT ON TABLE usage_tracking IS 'Tracking de l''utilisation des fonctionnalités par utilisateur';
COMMENT ON TABLE feature_gates IS 'Configuration des limites de fonctionnalités par tier';
COMMENT ON FUNCTION get_user_tier(UUID) IS 'Retourne le tier actif d''un utilisateur ou ''free'' par défaut';
COMMENT ON FUNCTION check_feature_access(UUID, TEXT) IS 'Vérifie si un utilisateur a accès à une fonctionnalité';
