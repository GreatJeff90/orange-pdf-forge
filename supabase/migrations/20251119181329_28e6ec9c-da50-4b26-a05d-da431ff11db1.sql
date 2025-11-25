-- Add ad_free_until column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN ad_free_until TIMESTAMP WITH TIME ZONE;

-- Create function to extend ad-free time based on coins purchased
CREATE OR REPLACE FUNCTION public.extend_ad_free_time(
  p_user_id UUID,
  p_coins INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_months NUMERIC;
  v_current_expiry TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate months: 1000 coins = 1 month
  v_months := p_coins / 1000.0;
  
  -- Get current ad_free_until value
  SELECT ad_free_until INTO v_current_expiry
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- If already ad-free and not expired, extend from current expiry
  -- Otherwise, start from now
  IF v_current_expiry IS NOT NULL AND v_current_expiry > NOW() THEN
    UPDATE public.profiles
    SET ad_free_until = v_current_expiry + (v_months || ' months')::INTERVAL
    WHERE id = p_user_id;
  ELSE
    UPDATE public.profiles
    SET ad_free_until = NOW() + (v_months || ' months')::INTERVAL
    WHERE id = p_user_id;
  END IF;
END;
$$;