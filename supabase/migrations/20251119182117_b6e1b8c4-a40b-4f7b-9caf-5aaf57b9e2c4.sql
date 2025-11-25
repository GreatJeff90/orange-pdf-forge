-- Add badge column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN badge TEXT DEFAULT 'freemium';

-- Update existing users to have freemium badge
UPDATE public.profiles 
SET badge = 'freemium' 
WHERE badge IS NULL;

-- Create function to award founder badge when purchasing Ultimate package
CREATE OR REPLACE FUNCTION public.award_founder_badge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if this is an Ultimate package purchase (30,000 coins)
  IF NEW.type = 'purchase' AND NEW.amount = 30000 AND NEW.description LIKE '%Ultimate%' THEN
    -- Award founder badge to the user
    UPDATE public.profiles
    SET badge = 'founder'
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically award founder badge
CREATE TRIGGER award_founder_badge_trigger
AFTER INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.award_founder_badge();