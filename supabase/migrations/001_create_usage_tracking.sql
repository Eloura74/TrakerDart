-- Migration: Create usage_tracking table
-- Description: Track feature usage per user for subscription limits
-- Date: 2026-01-28

-- Create usage_tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_id TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_feature_id ON public.usage_tracking(feature_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_feature ON public.usage_tracking(user_id, feature_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period_start ON public.usage_tracking(period_start);

-- Add composite index for most common query
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_feature_period 
  ON public.usage_tracking(user_id, feature_id, period_start);

-- Enable Row Level Security (RLS)
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own usage
CREATE POLICY "Users can view own usage"
  ON public.usage_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own usage
CREATE POLICY "Users can insert own usage"
  ON public.usage_tracking
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own usage
CREATE POLICY "Users can update own usage"
  ON public.usage_tracking
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own usage
CREATE POLICY "Users can delete own usage"
  ON public.usage_tracking
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_usage_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER trigger_update_usage_tracking_updated_at
  BEFORE UPDATE ON public.usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_usage_tracking_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.usage_tracking IS 'Tracks feature usage per user for subscription tier limits';
COMMENT ON COLUMN public.usage_tracking.user_id IS 'Reference to auth.users';
COMMENT ON COLUMN public.usage_tracking.feature_id IS 'Feature identifier (e.g., video_exports_720p, ai_recommendations)';
COMMENT ON COLUMN public.usage_tracking.count IS 'Number of times feature was used in this period';
COMMENT ON COLUMN public.usage_tracking.period_start IS 'Start of tracking period (usually month start)';
COMMENT ON COLUMN public.usage_tracking.period_end IS 'End of tracking period (optional)';
