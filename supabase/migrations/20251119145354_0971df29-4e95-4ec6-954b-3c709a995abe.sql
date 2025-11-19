-- Create enum for conversion types
CREATE TYPE conversion_type AS ENUM (
  'pdf_to_word',
  'pdf_to_excel', 
  'word_to_pdf',
  'excel_to_pdf',
  'compress_pdf',
  'merge_pdf',
  'split_pdf',
  'pdf_to_jpg',
  'jpg_to_pdf'
);

-- Create enum for conversion status
CREATE TYPE conversion_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed'
);

-- Create conversions table to track all conversion jobs
CREATE TABLE public.conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversion_type conversion_type NOT NULL,
  status conversion_status NOT NULL DEFAULT 'pending',
  input_file_path TEXT NOT NULL,
  output_file_path TEXT,
  error_message TEXT,
  cost INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversions
CREATE POLICY "Users can view their own conversions"
  ON public.conversions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversions"
  ON public.conversions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversions"
  ON public.conversions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_conversions_user_id ON public.conversions(user_id);
CREATE INDEX idx_conversions_status ON public.conversions(status);
CREATE INDEX idx_conversions_created_at ON public.conversions(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_conversions_updated_at
  BEFORE UPDATE ON public.conversions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();