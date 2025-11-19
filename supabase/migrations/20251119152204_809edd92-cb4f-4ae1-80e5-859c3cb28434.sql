-- Fix 1: Restrict profiles table access to prevent email scraping
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- Fix 2: Create rate limiting table for password reset attempts
CREATE TABLE IF NOT EXISTS public.password_reset_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on password_reset_attempts
ALTER TABLE public.password_reset_attempts ENABLE ROW LEVEL SECURITY;

-- Create index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_password_reset_email_time 
  ON public.password_reset_attempts(email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_password_reset_ip_time 
  ON public.password_reset_attempts(ip_address, created_at DESC);

-- Add policy to allow the edge function to insert attempts (service role will handle this)
CREATE POLICY "Service role can manage reset attempts" ON public.password_reset_attempts
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Create cleanup function to remove old attempts (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_reset_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.password_reset_attempts
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;