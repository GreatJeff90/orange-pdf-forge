-- Enable realtime for conversions table
ALTER TABLE public.conversions REPLICA IDENTITY FULL;

-- Add the table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversions;