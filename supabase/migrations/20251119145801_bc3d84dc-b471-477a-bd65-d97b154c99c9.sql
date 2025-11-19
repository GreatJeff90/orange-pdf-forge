-- Add coins balance to profiles table
ALTER TABLE public.profiles ADD COLUMN coins INTEGER NOT NULL DEFAULT 100;

-- Create coin packages table
CREATE TABLE public.coin_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  coins INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default coin packages
INSERT INTO public.coin_packages (name, coins, price, popular) VALUES
  ('Starter', 100, 4.99, false),
  ('Popular', 500, 19.99, true),
  ('Pro', 1000, 34.99, false),
  ('Ultimate', 5000, 149.99, false);

-- Create transactions table for coin history
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'conversion', 'refund')),
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  conversion_id UUID REFERENCES public.conversions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.coin_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coin_packages (public read)
CREATE POLICY "Anyone can view coin packages"
  ON public.coin_packages
  FOR SELECT
  USING (true);

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);

-- Create function to deduct coins and record transaction
CREATE OR REPLACE FUNCTION public.deduct_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_conversion_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT coins INTO current_balance
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check if user has enough coins
  IF current_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Deduct coins
  UPDATE public.profiles
  SET coins = coins - p_amount
  WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO public.transactions (user_id, type, amount, description, conversion_id)
  VALUES (p_user_id, 'conversion', -p_amount, p_description, p_conversion_id);

  RETURN TRUE;
END;
$$;

-- Create function to add coins and record transaction
CREATE OR REPLACE FUNCTION public.add_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add coins
  UPDATE public.profiles
  SET coins = coins + p_amount
  WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO public.transactions (user_id, type, amount, description)
  VALUES (p_user_id, 'purchase', p_amount, p_description);
END;
$$;